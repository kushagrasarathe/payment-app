"use client";
import { ProcessPayment } from "@/components/process-payment";
import { useParams } from "next/navigation";

export default function PaymentPage() {
  const params = useParams();
  const recipient = params.paymentId as string;

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Payment Details</h2>
        <p className="text-sm text-gray-600 break-all">
          Recipient: {recipient}
        </p>
      </div>

      <ProcessPayment recipient={recipient} chain="optimism" amount="10" />
    </div>
  );
}
