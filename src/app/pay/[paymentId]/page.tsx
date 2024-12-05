"use client";
import { useParams } from "next/navigation";

export default function PaymentPage() {
  const { paymentId } = useParams();

  return <div>gm {paymentId}</div>;
}
