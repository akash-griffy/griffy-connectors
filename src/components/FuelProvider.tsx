import { useAccount, useConnectUI, useDisconnect } from "@fuels/react";
import React, { useState } from "react";
import griffyLogo from "../assets/griffy_logo.svg";

const FuelProviderSetup: React.FC = () => {
  const { connect } = useConnectUI();
  const { account } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { refetch } = useAccount();

  const [balance] = useState("0.000 ETH");
  const [transferAddress, setTransferAddress] = useState(
    "0xa671949e92e3cf75a497f"
  );
  const [message, setMessage] = useState("Fuelum ipsum FuelVM sit amet.");

  const handleLogout = async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      refetch();
    }
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

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-200">Balance</p>
                    <p className="text-lg font-bold">{balance}</p>
                  </div>
                  <button
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition duration-300"
                    onClick={() => alert("Getting coins")}
                  >
                    Get coins
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-gray-200">Transfer</p>
                  <input
                    type="text"
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                    className="bg-gray-700 text-gray-400 py-2 px-4 rounded-lg w-full mb-2"
                  />
                  <button
                    className="bg-green-600 text-white py-2 px-4 rounded-lg w-full hover:bg-gray-600 transition duration-300"
                    onClick={() =>
                      alert(`Transferring 0.0001 ETH to ${transferAddress}`)
                    }
                  >
                    Transfer 0.0001 ETH
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-gray-200">Sign</p>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-gray-700 text-gray-400 py-2 px-4 rounded-lg w-full mb-2"
                  />
                  <button
                    className="bg-green-600 text-white py-2 px-4 rounded-lg w-full hover:bg-green-500 transition duration-300"
                    onClick={() => alert(`Signing message: ${message}`)}
                  >
                    Sign Message
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
