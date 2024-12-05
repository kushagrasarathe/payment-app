"use client";

import { config } from "@/lib/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { WagmiProvider } from "wagmi";

function Provider({ children }: React.PropsWithChildren<{}>) {
  const [client] = React.useState(new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
export default Provider;
