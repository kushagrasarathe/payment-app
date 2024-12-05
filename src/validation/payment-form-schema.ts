import { isValidAddressOrENS } from "@/lib/utils";
import { z } from "zod";

export const paymentFormSchema = z.object({
  recipient: z.string().refine(isValidAddressOrENS, {
    message: "Must be a valid Ethereum address or ENS name",
  }),

  isAdvancedMode: z.boolean().default(false),

  chain: z.enum(["mainnet", "optimism", "arbitrum", "polygon"]).optional(),

  amount: z
    .string()
    .optional()
    .refine((amount) => !amount || !isNaN(Number(amount)), {
      message: "Amount must be a valid number",
    })
    .refine((amount) => !amount || Number(amount) > 0, {
      message: "Amount must be greater than 0",
    }),

  token: z.enum(["usdc", "usdt"]).default("usdc"),
});

export type TPaymentFormValues = z.infer<typeof paymentFormSchema>;
