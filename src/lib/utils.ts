import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isAddress } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isValidAddressOrENS = (value: string) => {
  return isAddress(value) || value.endsWith(".eth");
};
