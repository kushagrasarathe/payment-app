"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePaymentLink } from "@/hooks/usePaymentLink";
import {
  paymentFormSchema,
  TPaymentFormValues,
} from "@/validation/payment-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "./ui/card";

export function PaymentForm() {
  const { generateLink, link, isLoading, error } = usePaymentLink();

  const form = useForm<TPaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      recipient: "",
      isAdvancedMode: false,
      chain: "optimism",
      amount: "",
      token: "usdc",
    },
  });

  const onSubmit = async (data: TPaymentFormValues) => {
    try {
      await generateLink(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="recipient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient</FormLabel>
              <FormControl>
                <Input placeholder="0x... or kushagra.eth" {...field} />
              </FormControl>
              <FormDescription>
                Enter an Ethereum address or ENS name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardContent className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="isAdvancedMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Advanced Mode</FormLabel>
                    <FormDescription>
                      Enable to specify chain and separate amount/token
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("isAdvancedMode") && (
              <FormField
                control={form.control}
                name="chain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chain</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select chain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="optimism">Optimism</SelectItem>
                        <SelectItem value="arbitrum">Arbitrum</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                        <SelectItem value="mainnet">Ethereum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="10"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Leave empty for open-ended requests
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="usdc">USDC</SelectItem>
                  {/* <SelectItem value="usdt">USDT</SelectItem> */}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        {link && (
          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-medium">Payment Link Generated</h3>
            <div className="flex items-center gap-2">
              <Input readOnly value={link} className="font-mono" />
              <Button
                type="button"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(link)}
              >
                Copy
              </Button>
            </div>
          </div>
        )}

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Payment Link"}
        </Button>
      </form>
    </Form>
  );
}
