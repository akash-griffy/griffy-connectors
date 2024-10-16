import {
  useAccount,
  useConnectUI,
  useDisconnect,
  useSendTransaction,
  useWallet,
} from "@fuels/react";
import React, { useEffect, useState } from "react";
import griffyLogo from "../assets/griffy_logo.svg";
import { assets } from "@fuel-ts/account";

type Balance = {
  assetId: string;
  amount: number;
  symbol: string | undefined;
};

type WalletAsset = {
  id: string;
  icon: string;
  name: string;
  symbol: string;
  balance?: number;
  decimal: number;
};

const FuelProviderSetup: React.FC = () => {
  const { connect } = useConnectUI();
  const { account } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { refetch } = useAccount();
  const { wallet } = useWallet();
  const [transferAddress, setTransferAddress] = useState(); 
  const [transferAmount, setTransferAmount] = useState<string>(""); // New state for transfer amount
  const { sendTransactionAsync } = useSendTransaction();
  const [assetsWithBalance, setAssetWithBalances] = useState<WalletAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<WalletAsset | null>(null);
  const [dummy, setDummy] = useState<number>(0)

  const handleLogout = async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      refetch();
    }
  };

  useEffect(() => {
    const filteredAssets: WalletAsset[] = assets
      .map((asset) => {
        const network = asset.networks.find(
          (network) =>
            network.chainId === wallet?.provider.getChainId() &&
            network.type === "fuel"
        );

        if (network) {
          const walletAsset: WalletAsset = {
            symbol: asset.symbol,
            icon: asset.icon,
            id: network["assetId"],
            name: asset.name,
            decimal: network.decimals,
          };

          return walletAsset;
        }
        return null;
      })
      .filter(Boolean);

    filteredAssets.map(async (asset) => {
      const balance = +(await wallet?.getBalance(asset.id)) || 0;
      asset.balance = balance / 10 ** asset.decimal;
    });

    setAssetWithBalances(filteredAssets);
  }, [wallet, dummy]);

  const handleTransaction = async (
    destination: string,
    amountToTransfer: number
  ) => {
    if (!wallet) {
      throw new Error("Current wallet is not authorized for this connection!");
    }
    const amount = amountToTransfer * 10**selectedAsset?.decimal;

    const transactionRequest = await wallet.createTransfer(
      destination,
      amount,
      selectedAsset?.id
    );

    // Broadcast the transaction to the network
    const tx = await sendTransactionAsync({
      address: wallet.address, // The address to sign the transaction (a connected wallet)
      transaction: transactionRequest, // The transaction to send
    });

    setTimeout(()=>{setDummy((prev)=>prev+1), console.log("state changed")},1000)

    console.log(tx);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAssetId = e.target.value;
    const selectedAssetObject = assetsWithBalance.find(
      (asset) => asset.id === selectedAssetId
    );

    console.log(selectedAssetObject);

    // Set the selected asset object to state
    if (!selectedAssetObject) return;
    setSelectedAsset(selectedAssetObject);
  };
 
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-full max-w-6xl p-8 bg-gray-900 rounded-lg shadow-md flex">
        {/* Left side with content */}
        <div className="w-1/2 pr-6">
          <div className="text-left mb-4">
            {/* Griffy Logo */}
            <img src={griffyLogo} alt="Griffy logo" className="h-10 " />
          </div>

          <h2 className="text-2xl font-bold text-gray-200 mb-4">Wallet Demo</h2>
          <p className="text-gray-200 text-sm mb-6">
            Griffy enables developers to build integrations with any wallet.
          </p>

          <ul className="list-disc list-inside text-gray-200 mb-6 space-y-2">
            <li>Reduce friction for users</li>
            <li>Build using any signature scheme</li>
            <li>Use predicates, a new type of stateless smart contract</li>
          </ul>
        </div>

        {/* Right side with Connect Wallet button or account details */}
        <div className="w-1/2 flex justify-center items-center">
          <div className="bg-gray-800 text-gray-400 w-full rounded-lg shadow-lg p-6 min-h-[400px] flex flex-col justify-between">
            {account ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  {/* Address block and Disconnect button side by side */}
                  <div>
                    <p className="text-gray-200">Your Fuel Address</p>
                    <p className="font-mono text-lg">
                      {account.substring(0, 6) +
                        "..." +
                        account.substring(account.length - 6)}
                    </p>
                    <a href="#" className="text-blue-400 text-sm underline">
                      View on Explorer
                    </a>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition duration-300"
                  >
                    Disconnect
                  </button>
                </div>

                <div>
                  <h2 className="text-gray-200 mb-2">Select an Asset</h2>
                  <select
                    value={selectedAsset?.id || ""}
                    onChange={(e) => handleSelectChange(e)}
                    className="border p-3 rounded-lg bg-gray-800 mb-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select an asset
                    </option>
                    {assetsWithBalance.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.symbol || "Unknown"} - {asset.id.substring(0, 6)}
                        ...
                        {asset.id.substring(asset.id.length - 4)}
                      </option>
                    ))}
                  </select>

                  {/* Display the selected balance */}
                  {selectedAsset && (
                    <div>
                      <p className="text-gray-200">Balance</p>
                      <p className="text-lg font-bold  mb-3">
                        {selectedAsset?.balance}
                      </p>
                    </div>
                  )}

                  {/* Display the selected asset details */}
                </div>

                <div className="mb-4">
                  <p className="text-gray-200">Transfer To</p>
                  <input
                    type="text"
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                    className="bg-gray-700 text-gray-400 py-2 px-4 rounded-lg w-full mb-2"
                    placeholder="Wallet address"
                  />

                  <p className="text-gray-200">Amount to Transfer</p>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="bg-gray-700 text-gray-400 py-2 px-4 rounded-lg w-full mb-2 "
                    placeholder="Enter amount"
                    min="0" // Prevent negative values
                  />
                  <button
                    className="bg-green-600 text-white py-2 px-4 rounded-lg w-full hover:bg-gray-600 transition duration-300"
                    onClick={() =>
                      handleTransaction(
                        transferAddress,
                        parseFloat(transferAmount)
                      )
                    }
                    disabled={!transferAddress || !transferAmount} // Disable if no address or amount
                  >
                    Transfer {transferAmount}{" "}
                    {selectedAsset?.symbol || "Unknown"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-[400px]">
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300"
                  onClick={connect}
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelProviderSetup;
