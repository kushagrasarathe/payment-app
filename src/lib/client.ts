import { createPublicClient, http } from "viem";
import { mainnet, optimism, arbitrum, polygon } from "viem/chains";
import { createConfig } from "wagmi";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const config = createConfig({
  chains: [mainnet, optimism, arbitrum, polygon],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
  },
});

export const resolveAddress = (address: `0x${string}`) => {
  const ensName = publicClient.getEnsName({
    address,
  });
  return ensName;
};
