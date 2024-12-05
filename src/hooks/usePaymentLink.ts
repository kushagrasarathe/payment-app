import {
  CHAIN_IDS,
  TOKEN_ADDRESSES,
  TOKEN_DECIMALS,
} from "@/lib/config/tokens.config";
import { TPaymentFormValues } from "@/validation/payment-form-schema";
import peanut from "@squirrel-labs/peanut-sdk";
import { useState } from "react";

interface PaymentLinkResult {
  link: string;
  isLoading: boolean;
  error: string | null;
}

const peanutApiKey = process.env.NEXT_PUBLIC_PEANUT_API_KEY;

export function usePaymentLink() {
  const [result, setResult] = useState<PaymentLinkResult>({
    link: "",
    isLoading: false,
    error: null,
  });

  const generateLink = async (formData: TPaymentFormValues): Promise<void> => {
    setResult({ link: "", isLoading: true, error: null });

    try {
      const chainId = CHAIN_IDS[formData.chain || "optimism"].toString();
      const tokenAddress = TOKEN_ADDRESSES[formData.chain || "optimism"].usdc;

      // create payment req using sdk
      const { link } = await peanut.createRequestLink({
        chainId,
        tokenAddress,
        tokenAmount: formData.amount || "10",
        tokenType: peanut.interfaces.EPeanutLinkType.erc20,
        tokenDecimals: TOKEN_DECIMALS.usdc.toString(),
        recipientAddress: formData.recipient,
        APIKey: peanutApiKey,
      });

      const peanutUrl = new URL(link);
      const requestId = peanutUrl.searchParams.get("id");
      const normalizedUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay?id=${requestId}`;

      setResult({ link: normalizedUrl, isLoading: false, error: null });
    } catch (error) {
      let errorMessage = "Failed to generate payment link";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setResult({ link: "", isLoading: false, error: errorMessage });
      console.error("Payment link generation error:", error);
    }
  };

  return {
    ...result,
    generateLink,
  };
}
