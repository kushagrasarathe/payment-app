"use client";

import { Button } from "@/components/ui/button";
import { useProcessPayment } from "@/hooks/useProcessPayment";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import peanut from "@squirrel-labs/peanut-sdk";
import { useEffect, useState } from "react";
import { optimism } from "viem/chains";
import { useAccount } from "wagmi";
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
  amount: string;
}

export function ProcessPayment({
  recipient,
  chain = optimism.name,
  amount,
  requestId,
}: ProcessPaymentProps) {
  const { isLoading, error, txHash, fulfillPayment } = useProcessPayment();
  const { isConnected } = useAccount();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    async function fetchPaymentDetails() {
      if (!requestId) return;

      setIsLoadingDetails(true);
      try {
        const peanutLink = `https://peanut.to/request/pay?id=${requestId}`;
        const details = await peanut.getRequestLinkDetails({
          link: peanutLink,
          APIKey: process.env.NEXT_PUBLIC_PEANUT_API_KEY!,
        });

        setPaymentDetails({
          recipient: details.recipientAddress!,
          chain: details.chainId,
          amount: details.tokenAmount,
        });
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    }

    fetchPaymentDetails();
  }, [requestId]);

  const handlePayment = () => {
    if (requestId) {
      const peanutLink = `https://peanut.to/request/pay?id=${requestId}`;
      fulfillPayment(peanutLink);
    } else {
      const paymentLink = window.location.href;
      fulfillPayment(paymentLink);
    }
  };

  if (isLoadingDetails) {
    return (
      <div className="space-y-4">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-medium mb-2">
            Loading Payment Details...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">To: </span>
                <span className="break-all">
                  {paymentDetails?.recipient || recipient}
                </span>
              </p>
              {(paymentDetails?.chain || chain) && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Network: </span>
                  {paymentDetails?.chain || chain}
                </p>
              )}
              {(paymentDetails?.amount || amount) && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Amount: </span>
                  {paymentDetails?.amount || amount} USDC
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {txHash && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-700">Payment successful!</p>
              <p className="text-sm text-green-600 break-all">
                Transaction: {txHash}
              </p>
            </div>
          )}

          {!isConnected ? (
            <div className="text-center">
              <p className="mb-4">
                Connect your wallet to complete the payment
              </p>
              <ConnectButton />
            </div>
          ) : (
            <Button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Processing Payment..." : "Pay Now"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
