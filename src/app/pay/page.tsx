"use client";

import { ProcessPayment } from "@/components/process-payment";
import { useSearchParams } from "next/navigation";

export default function PayPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id");
  const amount = searchParams.get("amount");
  const recipient = searchParams.get("recipient");
  const chain = searchParams.get("chain");

  const isValidPaymentRequest = requestId || (recipient && amount && chain);

  if (isValidPaymentRequest) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="flex min-h-[80vh] flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <ProcessPayment
              requestId={requestId || undefined}
              recipient={recipient || undefined}
              amount={amount || undefined}
              chain={chain || undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4">Invalid Payment Link</h1>
        <p className="text-gray-600">
          This payment link appears to be invalid. Please ensure the URL
          contains either:
        </p>
        <ul className="mt-4 list-disc pl-5 text-gray-600">
          <li className="mb-2">
            A valid request ID (for Peanut payment requests)
          </li>
          <li className="mb-2">
            Complete payment details (recipient address, amount, and network)
          </li>
        </ul>
      </div>
    </div>
  );
}
