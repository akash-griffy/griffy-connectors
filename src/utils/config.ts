import { type CHAIN_IDS, bn } from "fuels";

export const CHAIN_ID_NAME = import.meta.env
  .VITE_APP_CHAIN_ID_NAME as keyof typeof CHAIN_IDS.fuel;
export const PROVIDER_URL = import.meta.env.VITE_APP_RPC_URL;
export const DEFAULT_AMOUNT = bn.parseUnits(
  CHAIN_ID_NAME === "mainnet" ? "0.000000001" : "0.0001"
);

export const EXPLORER_URL_MAP: Record<keyof typeof CHAIN_IDS.fuel, string> = {
  testnet: "https://app-testnet.fuel.network",
  devnet: "https://app-testnet.fuel.network",
  mainnet: "https://app-mainnet.fuel.network",
};

export const EXPLORER_LOCAL_URL = "https://app-mainnet.fuel.network";

export const EXPLORER_URL =
  EXPLORER_URL_MAP[CHAIN_ID_NAME] || EXPLORER_LOCAL_URL;
