'use client';

import { useState } from 'react';
import { parseEther } from 'ethers';

interface CreateCampaignProps {
  onClose: () => void;
  onSubmit: (campaign: any) => Promise<void>;
}

export default function CreateCampaign({ onClose, onSubmit }: CreateCampaignProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        goal: parseEther(formData.goal),
        deadline: new Date(formData.deadline).getTime() / 1000,
      });
      onClose();
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Create New Campaign</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded-lg p-2"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Goal (ETH)</label>
            <input
              type="number"
              step="0.01"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 