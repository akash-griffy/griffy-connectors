// @ts-nocheck
import {
  useAccount,
  useConnectUI,
  useDisconnect,
  useSendTransaction,
  useWallet,
} from "@fuels/react";
import React, { useEffect, useState } from "react";
import solFlairyLogo from "../assets/solFlairy_logo.svg";
import { Provider } from "@fuel-ts/account";
import Swal from "sweetalert2";
import * as mira from 'mira-dex-ts'
import { getAvailablePools } from "../utils/getPools";



const allowedAssets = [
    {
       symbol:"FAIRY",
       assetId:"0xc1fdba80b28f51004ede0290e904a59a7dc69d2453706c169630118a80ccde94"
    },
    {
       symbol:"ETH",
       assetId:"0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07"
    },
    {
       symbol:"USDT",
       assetId:"0xa0265fb5c32f6e8db3197af3c7eb05c48ae373605b8165b6f4a51c5b0ba4812e"
    },

] 


const FuelProviderSetup: React.FC = () => {
  const { connect } = useConnectUI();
  const { account } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { refetch } = useAccount();
  const { wallet } = useWallet();
  const [transferAddress, setTransferAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>(""); // New state for transfer amount
  const { sendTransactionAsync } = useSendTransaction();
  const [selectedAsset, setSelectedAsset] = useState(allowedAssets[0])
  const [selectedAssetBalance, setSelectedAssetBalance] = useState<number>(0)
  const [fairyRate, setFairyRate] = useState<number>(0)

  
  
  let readonlyMiraAmm = new mira.ReadonlyMiraAmm(wallet?.provider);
  useEffect(()=>{
    fetchFairyBalance()
    if(!wallet)return
    readonlyMiraAmm = new mira.ReadonlyMiraAmm(wallet?.provider);
  },[wallet])

  const handleLogout = async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      console.log(error)
      refetch();
    }
  };
  const fetchFairyBalance = async()=>{
    if(!wallet)return
    const balance = +await wallet?.getBalance(allowedAssets[0].assetId)
    const pools = await getAvailablePools(allowedAssets[0].assetId,allowedAssets[2].assetId,1000000)
    const currentRate = await readonlyMiraAmm.getCurrentRate({bits:allowedAssets[0].assetId},pools)
    setFairyRate((currentRate[0]*balance)/1000000)
    setSelectedAssetBalance(balance/1000000000)
  }

  const handleTransaction = async (
    destination: string,
    amountToTransfer: number
  ) => {
   try{ if (!wallet) {
      throw new Error("Current wallet is not authorized for this connection!");
    }
    const amount = amountToTransfer * 1000000000;

    const transactionRequest = await wallet.createTransfer(
      destination,
      amount,
      selectedAsset.assetId
    );

    // Broadcast the transaction to the network
    const tx = await sendTransactionAsync({
      address: wallet.address, // The address to sign the transaction (a connected wallet)
      transaction: transactionRequest, // The transaction to send
    })

    Swal.fire({
      title: 'Congratulations !',
      text: 'Transfer successful !',
      icon: 'success',
      confirmButtonText: 'Cool'
    })
    console.log(tx)
  }catch(e){
      console.log(e)
    }
  };

  const handleSelectChange = async(e: React.ChangeEvent<HTMLSelectElement>) => {
    if(!wallet)return
    const selectedAssetId = e.target.value;

    const selected = allowedAssets.find((asset)=>asset.assetId == selectedAssetId)
    
    setSelectedAsset(selected || allowedAssets[0])

    const balance = +await wallet?.getBalance(selectedAssetId)

    if(selectedAssetId == wallet.provider.getBaseAssetId()){
      setSelectedAssetBalance(balance/1000000000)
    }else{
      setSelectedAssetBalance(balance/1000000000)
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-full max-w-6xl p-8 bg-gray-900 rounded-lg shadow-md flex">
        {/* Left side with content */}
        <div className="w-1/2 pr-6">
          <div className="text-left mb-4">
            {/* SolFlairy Logo */}
            <a href="https://fairiestoken.com" target="_blank">
              <img src={solFlairyLogo} alt="SolFlairy logo" className="h-10 " />
            </a>
          </div>

          <h3 className="text-2xl font-bold text-gray-200 mb-4">
            Fuel Fairy Portal
          </h3>
          <br></br>
          <h4 className="text-xl font-bold text-gray-200 mb-4">
            Connect Any Wallet
          </h4>
          <ul className="list-disc list-inside text-gray-200 mb-6 space-y-2">
            <li>Ethereum Wallets</li>
            <li>Solana Wallets</li>
            <li>Fuel Wallets</li>
          </ul>

          <h4 className="text-xl font-bold text-gray-200 mb-4">
            Built by SolFlairy <br></br>
          </h4>
          <h5 className="text-l font-bold text-gray-200 mb-4">
            <a href="https://fairiestoken.com" target="_blank">
              Promoting Fairies Token 
            </a>
          </h5>
          <h5 className="text-l font-bold text-white mb-4 bg-green-600 rounded-md box-border p-2 w-fit shadow-2xl shadow-green-500">
            <a href="https://mira.ly/swap/" target="_blank">
              Swap on Mira here !
            </a>
          </h5>
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
                    {/* <a href="#" className="text-blue-400 text-sm underline">
                      View on Explorer
                    </a> */}
                    <a
                      href={`https://app.fuel.network/account/${account}/assets`}
                      className="text-blue-400 text-sm underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on explorer
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
                    value={selectedAsset.assetId|| ""}
                    onChange={(e) => handleSelectChange(e)}
                    className="border p-3 rounded-lg bg-gray-800 mb-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select an asset
                    </option>
                    {allowedAssets.map((asset) => (
                      <option key={asset.assetId} value={asset.assetId}>
                        {asset.symbol || "Unknown"} - {asset.assetId.substring(0, 6)}
                        ...
                        {asset.assetId.substring(asset.assetId.length - 4)}
                      </option>
                    ))}
                  </select>

                  {/* Display the selected balance */}
                  {selectedAsset && (
                    <div>
                      <p className="text-gray-200">Balance</p>
                      <p className="text-lg font-bold  mb-3">
                        {selectedAssetBalance}  {allowedAssets[0].assetId == selectedAsset.assetId ? (<span>{`($${fairyRate.toFixed(3)})`}</span>):(<div></div>)}
                      </p>
                     
                  
                    </div>
                  )}

                  {/* Display the selected asset details */}
                </div>

                <div className="mb-4">
                  <p className="text-gray-200 mb-2">Transfer To</p>
                  <input
                    type="text"
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                    className="bg-gray-700 text-gray-400 py-2 px-4 rounded-lg w-full mb-2"
                    placeholder="Wallet address"
                  />

                  <p className="text-gray-200 mb-2">Amount to Transfer</p>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="bg-gray-700 text-gray-400 py-2 px-4 rounded-lg w-full mb-2 "
                    placeholder="Enter amount"
                    min="0" // Prevent negative values
                  />
                  <button
                    className="bg-green-600 text-white py-2 px-4 rounded-lg w-full hover:bg-gray-600 transition duration-300 mb-2"
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
