'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import WalletConnect from '../components/WalletConnect';
import CreateCampaign from '../components/CreateCampaign';
import { CROWDFUNDING_ABI } from '@/constants/abi';
import { CROWDFUNDING_ADDRESS } from '@/constants/addresses';

interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: string;
  raised: string;
  creator: string;
  deadline: Date;
}

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const handleWalletConnect = (address: string, provider: BrowserProvider) => {
    setUserAddress(address);
    setProvider(provider);
  };

  const loadCampaigns = async () => {
    if (!provider) return;

    try {
      const contract = new Contract(
        CROWDFUNDING_ADDRESS,
        CROWDFUNDING_ABI,
        provider
      );

      const campaignCount = await contract.campaignCount();
      const loadedCampaigns: Campaign[] = [];

      for (let i = 0; i < campaignCount; i++) {
        const campaign = await contract.campaigns(i);
        loadedCampaigns.push({
          id: i,
          title: campaign.title,
          description: campaign.description,
          goal: formatEther(campaign.goal),
          raised: formatEther(campaign.amountRaised),
          creator: campaign.creator,
          deadline: new Date(Number(campaign.deadline.toString()) * 1000)
        });
      }

      setCampaigns(loadedCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (campaignData: any) => {
    if (!provider) return;

    const signer = await provider.getSigner();
    const contract = new Contract(
      CROWDFUNDING_ADDRESS,
      CROWDFUNDING_ABI,
      signer
    );

    const tx = await contract.createCampaign(
      campaignData.title,
      campaignData.description,
      campaignData.goal,
      campaignData.deadline
    );

    await tx.wait();
    await loadCampaigns();
  };

  const handleContribute = async (campaignId: number, amount: string) => {
    if (!provider) return;

    const signer = await provider.getSigner();
    const contract = new Contract(
      CROWDFUNDING_ADDRESS,
      CROWDFUNDING_ABI,
      signer
    );

    const tx = await contract.contribute(campaignId, {
      value: parseEther(amount)
    });

    await tx.wait();
    await loadCampaigns();
  };

  useEffect(() => {
    if (provider) {
      loadCampaigns();
    }
  }, [provider]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold">Decentralized Crowdfunding</h1>
            <p className="text-xl text-gray-600 mt-2">Support projects you believe in</p>
          </div>
          <WalletConnect onConnect={handleWalletConnect} />
        </div>

        {userAddress && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="mb-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Campaign
          </button>
        )}

        {loading ? (
          <div className="text-center py-12">Loading campaigns...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-2">{campaign.title}</h2>
                <p className="text-gray-600 mb-4">{campaign.description}</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ 
                      width: `${(parseFloat(campaign.raised) / parseFloat(campaign.goal) * 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>{campaign.raised} ETH raised</span>
                  <span>Goal: {campaign.goal} ETH</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    by {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                  </span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Contribute
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateCampaign
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateCampaign}
          />
        )}
      </div>
    </main>
  );
}
