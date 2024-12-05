import { PaymentForm } from "@/components/payment-form";

export default function Home() {
  return (
    <div className="flex items-start md:items-stretch flex-col gap-4 justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Generate Payment Links</h1>
      <PaymentForm />
    </div>
  );
}
