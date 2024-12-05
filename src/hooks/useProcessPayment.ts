import peanut from "@squirrel-labs/peanut-sdk";
import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";

interface ProcessPaymentResult {
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
}

export function useProcessPayment() {
  const { address } = useAccount();
  const { data: signer } = useWalletClient();

  const [result, setResult] = useState<ProcessPaymentResult>({
    isLoading: false,
    error: null,
    txHash: null,
  });

  const fulfillPayment = async (paymentLink: string) => {
    console.log("Starting payment fulfillment with link:", paymentLink);

    if (!signer || !address) {
      setResult({
        isLoading: false,
        error: "Please connect your wallet",
        txHash: null,
      });
      return;
    }

    setResult({
      isLoading: true,
      error: null,
      txHash: null,
    });

    try {
      // get payment request details
      console.log("Fetching link details...");
      const linkDetails = await peanut.getRequestLinkDetails({
        link: paymentLink,
        APIKey: process.env.NEXT_PUBLIC_PEANUT_API_KEY!,
      });
      console.log("Received link details:", linkDetails);

      // prepare tx
      console.log("Preparing unsigned transaction...");
      const { unsignedTx } = peanut.prepareRequestLinkFulfillmentTransaction({
        recipientAddress: linkDetails.recipientAddress!,
        tokenAddress: linkDetails.tokenAddress,
        tokenAmount: linkDetails.tokenAmount,
        tokenDecimals: linkDetails.tokenDecimals,
        tokenType: peanut.interfaces.EPeanutLinkType.erc20,
      });
      console.log("Prepared unsigned transaction:", unsignedTx);

      console.log("Signing and submitting transaction...");
      const { tx, txHash } = await peanut.signAndSubmitTx({
        unsignedTx,
        structSigner: {
          signer: signer as any,
        },
      });

      console.log("Transaction submitted with hash:", txHash);

      console.log("Waiting for transaction confirmation...");
      await tx.wait();
      console.log("Transaction confirmed!");

      console.log("Submitting fulfillment details...");
      await peanut.submitRequestLinkFulfillment({
        chainId: linkDetails.chainId,
        hash: txHash,
        payerAddress: address,
        link: paymentLink,
        amountUsd: "",
      });

      setResult({
        isLoading: false,
        error: null,
        txHash,
      });

      console.log("Payment fulfillment completed successfully!");
    } catch (error) {
      console.error("Full error object:", error);

      let errorMessage = "Failed to fulfill payment";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setResult({
        isLoading: false,
        error: errorMessage,
        txHash: null,
      });
    }
  };

  return {
    ...result,
    fulfillPayment,
  };
}
