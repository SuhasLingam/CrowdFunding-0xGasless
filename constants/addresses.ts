// Base network configuration
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
const BASE_SEPOLIA_ADDRESS = "0x48DFA5959F17C2419263f124AdeCB20d1fab5D39";

type NetworkConfig = {
  base_sepolia: {
    chainId: number;
    name: string;
    rpcUrl: string;
    contractAddress: string;
    blockExplorer: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
  };
};

// Network configuration
const NETWORK_CONFIG: NetworkConfig = {
  base_sepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: BASE_SEPOLIA_RPC,
    contractAddress: BASE_SEPOLIA_ADDRESS,
    blockExplorer: "https://sepolia.basescan.org",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    }
  }
};

// Helper function to switch network
const switchToBaseNetwork = async (window: Window): Promise<void> => {
  const network = NETWORK_CONFIG.base_sepolia;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${network.chainId.toString(16)}` }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${network.chainId.toString(16)}`,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: network.nativeCurrency,
              blockExplorerUrls: [network.blockExplorer]
            },
          ],
        });
      } catch (addError) {
        console.error('Error adding network:', addError);
      }
    }
    console.error('Error switching network:', switchError);
  }
};

// Exports
export {
  NETWORK_CONFIG,
  switchToBaseNetwork
};

export const CROWDFUNDING_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || BASE_SEPOLIA_ADDRESS; 