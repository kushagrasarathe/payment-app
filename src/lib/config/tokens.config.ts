import { arbitrum, mainnet, optimism, polygon } from "viem/chains";

export const TOKEN_ADDRESSES = {
  mainnet: {
    usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  optimism: {
    usdc: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
  },
  arbitrum: {
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  },
  polygon: {
    usdc: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
  },
} as const;

export const TOKEN_DECIMALS = {
  usdc: 6,
  usdt: 6,
} as const;

export const CHAIN_IDS = {
  mainnet: mainnet.id,
  optimism: optimism.id,
  arbitrum: arbitrum.id,
  polygon: polygon.id,
} as const;
