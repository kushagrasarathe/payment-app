"use client";

import { Button } from "@/components/ui/button";
import { useProcessPayment } from "@/hooks/useProcessPayment";
import {
  CHAIN_ID_TO_NAME,
  CHAIN_IDS,
  CHAIN_NAME_TO_ID,
} from "@/lib/config/tokens.config";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import peanut from "@squirrel-labs/peanut-sdk";
import { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ProcessPaymentProps {
  recipient?: string;
  chain?: string;
  amount?: string;
  requestId?: string;
}

interface PaymentDetails {
  recipient: string;
  chain: string;
  chainId: number;
  amount: string;
  tokenSymbol: string;
}

export function ProcessPayment({
  recipient,
  chain = "optimism",
  amount,
  requestId,
}: ProcessPaymentProps) {
  const { isLoading, error, txHash, fulfillPayment } = useProcessPayment();
  const { isConnected, chain: currentChain } = useAccount();
  const { switchChainAsync, isPending: isSwitchingNetwork } = useSwitchChain();

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // Get chain name from ID
  const getChainName = (chainId: string | number): string => {
    const numericChainId = Number(chainId);
    return (
      CHAIN_ID_TO_NAME[numericChainId as keyof typeof CHAIN_ID_TO_NAME] ||
      String(chainId)
    );
  };

  // Get chain ID from name
  const getChainId = (chainName: string): number => {
    const normalizedName = chainName.toLowerCase();
    return (
      CHAIN_NAME_TO_ID[normalizedName as keyof typeof CHAIN_NAME_TO_ID] ||
      CHAIN_IDS.optimism
    );
  };

  // Check if we're on the correct network
  useEffect(() => {
    if (!paymentDetails || !currentChain) return;

    const isCorrectNetwork = currentChain.id === paymentDetails.chainId;
    setIsWrongNetwork(!isCorrectNetwork);
  }, [currentChain, paymentDetails]);

  // Fetch payment details
  useEffect(() => {
    async function fetchPaymentDetails() {
      if (!requestId) {
        // If no requestId, use props to set payment details
        if (recipient && chain) {
          const chainId = getChainId(chain);
          setPaymentDetails({
            recipient,
            chain: getChainName(chainId),
            chainId,
            amount: amount || "0",
            tokenSymbol: "USDC",
          });
        }
        return;
      }

      setIsLoadingDetails(true);
      setFetchError(null);

      try {
        const peanutLink = `https://peanut.to/request/pay?id=${requestId}`;
        const details = await peanut.getRequestLinkDetails({
          link: peanutLink,
          APIKey: process.env.NEXT_PUBLIC_PEANUT_API_KEY!,
        });

        setPaymentDetails({
          recipient: details.recipientAddress!,
          chain: getChainName(details.chainId),
          chainId: Number(details.chainId),
          amount: details.tokenAmount,
          tokenSymbol: details.tokenSymbol || "USDC",
        });
      } catch (error) {
        console.error("Error fetching payment details:", error);
        setFetchError(
          "Failed to load payment details. Please try refreshing the page."
        );
      } finally {
        setIsLoadingDetails(false);
      }
    }

    fetchPaymentDetails();
  }, [requestId, recipient, chain, amount]);

  // Handle payment initiation
  const handlePayment = async () => {
    if (!paymentDetails) return;

    // If on wrong network, switch first
    if (isWrongNetwork && switchChainAsync) {
      await switchChainAsync({ chainId: paymentDetails.chainId });
      return;
    }

    // Proceed with payment
    const peanutLink = requestId
      ? `https://peanut.to/request/pay?id=${requestId}`
      : window.location.href;

    fulfillPayment(peanutLink);
  };

  // Loading state
  if (isLoadingDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">Loading...</CardContent>
      </Card>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{fetchError}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Payment Information */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">To: </span>
              <span className="break-all">
                {paymentDetails?.recipient || recipient}
              </span>
            </p>
            {(paymentDetails?.chain || chain) && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Network: </span>
                {paymentDetails?.chain || getChainName(getChainId(chain))}
              </p>
            )}
            {(paymentDetails?.amount || amount) && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Amount: </span>
                {paymentDetails?.amount || amount}{" "}
                {paymentDetails?.tokenSymbol || "USDC"}
              </p>
            )}
          </div>

          {/* Network Warning */}
          {isWrongNetwork && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">
                Please switch to {paymentDetails?.chain} network to continue
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg break-words">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {txHash && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-700">Payment successful!</p>
              <p className="text-sm text-green-600 break-all">
                Transaction: {txHash}
              </p>
            </div>
          )}

          {/* Wallet Connection and Payment Button */}
          <div className="mt-6">
            {!isConnected ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Connect your wallet to complete the payment
                </p>
                <ConnectButton />
              </div>
            ) : (
              <Button
                onClick={handlePayment}
                disabled={isLoading || isSwitchingNetwork}
                className="w-full"
              >
                {isLoading
                  ? "Processing Payment..."
                  : isWrongNetwork
                    ? `Switch to ${paymentDetails?.chain}`
                    : "Pay Now"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
