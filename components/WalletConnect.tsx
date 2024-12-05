'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { NETWORK_CONFIG, switchToBaseNetwork } from '@/constants/addresses';

interface WalletConnectProps {
  onConnect: (address: string, provider: BrowserProvider) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [network, setNetwork] = useState<string>('');

  const checkNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(chainId, 16);
      
      if (chainIdNum === NETWORK_CONFIG.base_sepolia.chainId) {
        setNetwork('Base Sepolia');
      } else {
        setNetwork('Wrong Network');
      }
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      if (typeof window.ethereum !== 'undefined') {
        // Switch to Base Sepolia
        await switchToBaseNetwork(window);
        
        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAddress(address);
        onConnect(address, provider);
        await checkNetwork();
      } else {
        alert('Please install MetaMask to use this feature');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      window.ethereum.on('chainChanged', checkNetwork);
      checkNetwork();
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      }
    };
  }, [address]);

  return (
    <div className="flex items-center gap-4">
      {address ? (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            network === 'Wrong Network' ? 'bg-red-500' : 'bg-green-500'
          }`} />
          <span className="text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <span className={`text-sm ${
            network === 'Wrong Network' ? 'text-red-500' : 'text-green-500'
          }`}>
            {network}
          </span>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
} 