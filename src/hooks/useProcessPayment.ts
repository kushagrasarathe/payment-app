import peanut from "@squirrel-labs/peanut-sdk";
import { BigNumber } from "ethers";
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

  const createStructuredSigner = async (client: any, chainId: string) => {
    // Convert chainId to number if it's a string
    const numericChainId = Number(chainId);

    return {
      provider: publicClient,
      chainId: numericChainId, // Explicitly set the chainId from the payment details
      account: client.account,
      signer: {
        ...client,
        getAddress: async () => client.account.address,
        // Add chainId to the transaction
        signTransaction: async (tx: any) => {
          return client.signTransaction({
            ...tx,
            chainId: numericChainId,
          });
        },
        sendTransaction: async (tx: any) => {
          const hash = await client.sendTransaction({
            ...tx,
            chainId: numericChainId,
          });
          return {
            hash,
            wait: async () => {
              await publicClient?.waitForTransactionReceipt({ hash });
              return { hash };
            },
          };
        },
      },
      gasLimit: BigNumber.from(2_000_000),
    };
  };

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

      // Create the structured signer with the correct chain ID
      const structSigner = await createStructuredSigner(
        walletClient,
        linkDetails.chainId
      );

      // Prepare the transaction
      const { unsignedTx } = peanut.prepareRequestLinkFulfillmentTransaction({
        recipientAddress: linkDetails.recipientAddress!,
        tokenAddress: linkDetails.tokenAddress,
        tokenAmount: linkDetails.tokenAmount,
        tokenDecimals: linkDetails.tokenDecimals,
        tokenType: peanut.interfaces.EPeanutLinkType.erc20,
      });

      // Sign and submit the transaction
      const { tx, txHash } = await peanut.signAndSubmitTx({
        unsignedTx,
        structSigner,
      });

      await tx.wait();

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
