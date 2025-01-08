// @ts-nocheck
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FuelProvider, UIConfig } from "@fuels/react";
import "./tailwind.css"; // Import Tailwind styles
import FuelProviderSetup from "./components/FuelProvider";
import { structuralSharing } from "@wagmi/core/query";
import { createConfig, http, injected } from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";
import { coinbaseWallet, walletConnect } from "@wagmi/connectors";
import { CHAIN_ID_NAME, PROVIDER_URL } from "./utils/config";
import { defaultConnectors } from "@fuels/connectors";
import { CHAIN_IDS, Provider } from "fuels";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      structuralSharing,
    },
  },
});

const WC_PROJECT_ID = import.meta.env.VITE_APP_WC_PROJECT_ID;
const METADATA = {
  name: "SolFlairy",
  description: "Fuel Fairies",
  url: location.href,
  icons: ["https://fairiestoken.com/favicon.ico"],
};

const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  syncConnectedChain: true,
  connectors: [
    injected({ shimDisconnect: false }),
    walletConnect({
      projectId: WC_PROJECT_ID,
      metadata: METADATA,
      showQrModal: false,
    }),
    coinbaseWallet({
      appName: METADATA.name,
      appLogoUrl: METADATA.icons[0],
      darkMode: true,
      reloadOnDisconnect: true,
    }),
  ],
});

const CHAIN_ID = CHAIN_IDS.fuel[CHAIN_ID_NAME];

if (CHAIN_ID == null) {
  throw new Error("VITE_APP_CHAIN_ID_NAME is not set");
}

if (!PROVIDER_URL) {
  throw new Error("VITE_APP_RPC_URL is not set");
}

const uiConfig: UIConfig = { suggestBridge: false,  };

const NETWORKS = [
  {
    chainId: CHAIN_ID,
    url: PROVIDER_URL,
  },
];

const filteredConnectors = defaultConnectors({
  devMode: true,
  wcProjectId: WC_PROJECT_ID,
  ethWagmiConfig: wagmiConfig,
  chainId: CHAIN_ID,
  fuelProvider: Provider.create(PROVIDER_URL),
}).filter(
  (c) => c.name !== "Burner Wallet" && c.name !== "Fuel Wallet Development"
);

const FUEL_CONFIG = {
  connectors: filteredConnectors,
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        theme="light"
        networks={NETWORKS}
        fuelConfig={FUEL_CONFIG}
        uiConfig={uiConfig}
      >
        <FuelProviderSetup />
      </FuelProvider>
    </QueryClientProvider>
  );
};

export default App;
