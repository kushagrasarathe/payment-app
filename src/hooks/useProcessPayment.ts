import peanut from "@squirrel-labs/peanut-sdk";
import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

interface ProcessPaymentResult {
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
}

export function useProcessPayment() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [result, setResult] = useState<ProcessPaymentResult>({
    isLoading: false,
    error: null,
    txHash: null,
  });

  const fulfillPayment = async (paymentLink: string) => {
    let peanutLink = paymentLink;

    if (
      paymentLink.includes("localhost:3000") ||
      paymentLink.includes(process.env.NEXT_PUBLIC_APP_URL || "")
    ) {
      try {
        const url = new URL(paymentLink);
        const requestId = url.searchParams.get("id");
        if (requestId) {
          peanutLink = `https://peanut.to/request/pay?id=${requestId}`;
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
        setResult({
          isLoading: false,
          error: "Invalid payment link format",
          txHash: null,
        });
        return;
      }
    }

    if (!walletClient || !address) {
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
      // Get payment request details first
      const linkDetails = await peanut.getRequestLinkDetails({
        link: peanutLink,
        APIKey: process.env.NEXT_PUBLIC_PEANUT_API_KEY!,
      });

      // Prepare the transaction
      const { unsignedTx } = peanut.prepareRequestLinkFulfillmentTransaction({
        recipientAddress: linkDetails.recipientAddress!,
        tokenAddress: linkDetails.tokenAddress,
        tokenAmount: linkDetails.tokenAmount,
        tokenDecimals: linkDetails.tokenDecimals,
        tokenType: peanut.interfaces.EPeanutLinkType.erc20,
      });

      const txHash = await walletClient.sendTransaction({
        to: unsignedTx.to as `0x${string}`,
        value: unsignedTx.value as bigint,
        data: unsignedTx.data as `0x${string}`,
      });

      await publicClient?.waitForTransactionReceipt({
        hash: txHash,
      });

      // Submit the fulfillment details
      await peanut.submitRequestLinkFulfillment({
        chainId: linkDetails.chainId,
        hash: txHash,
        payerAddress: address,
        link: peanutLink,
        amountUsd: "",
      });

      setResult({
        isLoading: false,
        error: null,
        txHash,
      });
    } catch (error) {
      console.error("Full error object:", error);

      let errorMessage = "Failed to fulfill payment";
      if (error instanceof Error) {
        if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by the wallet";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds to complete the transaction";
        } else {
          errorMessage = error.message;
        }
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
