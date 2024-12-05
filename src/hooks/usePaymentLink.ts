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
      //create a simple req
      if (!formData.amount) {
        const simpleReq = generateSimpleLink(formData);
        setResult({ link: simpleReq, isLoading: false, error: null });
        return;
      }

      const chainId = CHAIN_IDS[formData.chain || "optimism"].toString();
      const tokenAddress = TOKEN_ADDRESSES[formData.chain || "optimism"].usdc;

      // create payment req using sdk
      const { link } = await peanut.createRequestLink({
        chainId,
        tokenAddress,
        tokenAmount: formData.amount,
        tokenType: peanut.interfaces.EPeanutLinkType.erc20,
        tokenDecimals: TOKEN_DECIMALS.usdc.toString(),
        recipientAddress: formData.recipient,
        APIKey: peanutApiKey,
      });

      setResult({ link, isLoading: false, error: null });
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

//  generate simple links without sdk
const generateSimpleLink = (formData: TPaymentFormValues): string => {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const params = ["pay", formData.recipient];

  if (formData.isAdvancedMode) {
    if (formData.chain) {
      params.push(formData.chain);
    }
    if (formData.amount) {
      params.push(formData.amount);
      params.push("usdc");
    }
  } else if (formData.amount) {
    params.push(`${formData.amount}usdc`);
  }

  return `${baseUrl}/${params.join("/")}`;
};
