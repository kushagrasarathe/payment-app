"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { config } from "@/lib/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

function Provider({ children }: React.PropsWithChildren<{}>) {
  const [client] = React.useState(new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
export default Provider;
