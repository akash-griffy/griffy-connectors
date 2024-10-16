import {
  useAccount,
  useConnectUI,
  useDisconnect,
  useSendTransaction,
  useWallet,
} from "@fuels/react";
import React, { useEffect, useState } from "react";
import griffyLogo from "../assets/griffy_logo.svg";
import { Assets } from "../utils/assetMap";
import { Assets as FAssets, assets } from "@fuel-ts/account";

type Balance = {
  assetId: string;
  amount: number;
  symbol: string | undefined;
};

const FuelProviderSetup: React.FC = () => {
  const { connect } = useConnectUI();
  const { account } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { refetch } = useAccount();
  const { wallet } = useWallet();
  const [transferAddress, setTransferAddress] = useState(
    "0xa671949e92e3cf75a497f"
  );
  const [balances, setBalances] = useState<Balance[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [transferAmount, setTransferAmount] = useState<string>(""); // New state for transfer amount
  const { sendTransactionAsync } = useSendTransaction();
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null); // State to hold the selected asset

  const handleLogout = async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      refetch();
    }
  };

  const getBalances = async () => {
    try {
      const balancesData = (await wallet?.getBalances())?.balances;
      if (balancesData) {
        const extractedBalances = balancesData.map((balance: any) => ({
          assetId: balance.assetId,
          amount: +balance.amount, // Convert amount to a number
          symbol: Assets[balance.assetId], // Retrieve the symbol from Assets
        }));
        setBalances(extractedBalances); // Update the balances state here
        console.log(extractedBalances); // Log to check if balances are populated
      }
    } catch (error) {
      refetch();
    }
  };

  useEffect(() => {
    getBalances(); // Fetch balances on component mount
  }, [wallet]);

  // Function to find the asset based on its symbol
  const findAssetBySymbol = (symbol: string) => {
    // Find the asset with the matching symbol
    const matchingAsset = assets.find((asset) => asset.symbol === symbol);

    // If an asset is found, return it
    if (matchingAsset) {
      console.log("Matching Asset: ", matchingAsset);
      return matchingAsset;
    } else {
      console.log("No asset found with symbol:", symbol);
      return null;
    }
  };

  // Function to get decimals for 'fuel' network with chainId 0
  const getFuelDecimals = (networks: Array<any>) => {
    // Find the network with type 'fuel' and chainId 0
    const fuelNetwork = networks.find(
      (network) =>
        network.type === "fuel" &&
        network.chainId === wallet?.provider.getChainId()
    );

    // If found, return the decimals, otherwise return null
    return fuelNetwork ? fuelNetwork.decimals : null;
  };

  const handleTransaction = async (
    destination: string,
    amountToTransfer: number
  ) => {
    if (!wallet) {
      throw new Error("Current wallet is not authorized for this connection!");
    }
    const amount = amountToTransfer;

    const transactionRequest = await wallet.createTransfer(
      destination,
      amount,
      selectedAssetId
    );

    // Broadcast the transaction to the network
    const tx = await sendTransactionAsync({
      address: wallet.address, // The address to sign the transaction (a connected wallet)
      transaction: transactionRequest, // The transaction to send
    });

    console.log(tx);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedAssetId(selectedId);

    // Find the corresponding balance for the selected asset
    const selectedBalance = balances.find(
      (balance) => balance.assetId === selectedId
    );
    if (selectedBalance) {
      setSelectedAmount(selectedBalance.amount);

      // Find the asset details based on the symbol
      const asset = findAssetBySymbol(selectedBalance.symbol || "");
      setSelectedAsset(asset); // Set the selected asset
    }
  };

  const selectedSymbol = balances.find(
    (balance) => balance.assetId === selectedAssetId
  )?.symbol;

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
                    value={selectedAssetId || ""}
                    onChange={handleSelectChange}
                    className="border p-3 rounded-lg bg-gray-800 mb-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select an asset
                    </option>
                    {balances.map((balance) => (
                      <option key={balance.assetId} value={balance.assetId}>
                        {balance.symbol || "Unknown"} -{" "}
                        {balance.assetId.substring(0, 6)}...
                        {balance.assetId.substring(balance.assetId.length - 4)}
                      </option>
                    ))}
                  </select>

                  {/* Display the selected balance */}
                  {selectedAmount !== null && (
                    <div>
                      <p className="text-gray-200">Balance</p>
                      <p className="text-lg font-bold  mb-3">
                        {selectedAmount}
                      </p>
                    </div>
                  )}

                  {/* Display the selected asset details */}
                  {selectedAsset && (
                    <div>
                      <p className="text-gray-200">Selected Asset Details:</p>
                      <p>
                        Icon:{" "}
                        <img
                          src={selectedAsset.icon}
                          alt="icon"
                          className="h-6 inline-block"
                        />
                      </p>
                      <p>Name: {selectedAsset.name}</p>
                      {/* Get the decimals for the 'fuel' network with chainId 0 */}
                      <p>
                        Decimals (Fuel, Chain ID 0):{" "}
                        {getFuelDecimals(selectedAsset.networks)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-gray-200">Transfer To</p>
                  <input
                    type="text"
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                    className="bg-gray-700 text-gray-400 py-2 px-4 rounded-lg w-full mb-2"
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
                    Transfer {transferAmount || "0"}{" "}
                    {selectedSymbol || "Unknown"}
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
