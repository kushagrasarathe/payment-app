"use client";

import { ProcessPayment } from "@/components/process-payment";
import { useSearchParams } from "next/navigation";

export default function PayPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id");

  if (requestId) {
    return (
      <div className="flex items-start md:items-stretch flex-col gap-4 justify-center min-h-screen">
        <ProcessPayment requestId={requestId} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Invalid Payment Link</h1>
      <p className="text-gray-600">
        This payment link appears to be invalid. Please check the URL and try
        again.
      </p>
    </div>
  );
}
