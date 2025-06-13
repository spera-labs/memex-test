import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { web3Service } from '../utils/web3';
import toast from 'react-hot-toast';

interface WalletState {
  isConnected: boolean;
  address: string;
  balance: string;
}

interface CreateTokenProps {
  wallet: WalletState;
}

interface FormData {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  socialLinks: {
    twitter?: string;
    telegram?: string;
    website?: string;
  };
}

const CreateToken: React.FC<CreateTokenProps> = ({ wallet }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
    socialLinks: {},
  });
  const [deploymentFee, setDeploymentFee] = useState('0');
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    if (!wallet.isConnected) {
      navigate('/');
      return;
    }
    fetchDeploymentFee();
  }, [wallet.isConnected, navigate]);

  const fetchDeploymentFee = async () => {
    try {
      const fee = await web3Service.getDeploymentFee();
      setDeploymentFee(fee);
    } catch (error) {
      console.error('Error fetching deployment fee:', error);
      toast.error('Failed to fetch deployment fee');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialPlatform = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialPlatform]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.symbol) {
      toast.error('Name and symbol are required');
      return;
    }

    if (formData.symbol.length > 10) {
      toast.error('Symbol must be 10 characters or less');
      return;
    }

    const walletBalance = parseFloat(wallet.balance);
    const fee = parseFloat(deploymentFee);

    if (walletBalance < fee) {
      toast.error(`Insufficient balance. Required: ${fee} ETH`);
      return;
    }

    setIsDeploying(true);
    try {
      await web3Service.deployToken(
        formData.name,
        formData.symbol,
        formData.description,
        formData.imageUrl,
        formData.socialLinks
      );
      toast.success('Token deployed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deploying token:', error);
      toast.error('Failed to deploy token');
    } finally {
      setIsDeploying(false);
    }
  };

  if (!wallet.isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Create New Token</h2>
          <p className="text-lg text-gray-600">
            Deploy your token with an automated bonding curve
          </p>
        </div>

        <div className="bg-white shadow-2xl rounded-3xl p-8 mb-8 transform hover:scale-[1.01] transition-transform duration-200">
          <div className="mb-8 p-4 bg-primary/5 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Deployment Fee</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {deploymentFee} ETH (≈ ${(parseFloat(deploymentFee) * 2000).toFixed(2)})
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Your Balance</p>
                <p className="text-lg font-semibold text-gray-900">{wallet.balance} ETH</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Token Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                  placeholder="e.g., My Awesome Token"
                />
              </div>

              <div>
                <label
                  htmlFor="symbol"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Token Symbol
                </label>
                <input
                  type="text"
                  name="symbol"
                  id="symbol"
                  required
                  maxLength={10}
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                  placeholder="e.g., MAT"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum 10 characters
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                placeholder="Describe your token..."
              />
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Token Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                placeholder="https://example.com/token-image.png"
              />
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Social Links (Optional)
              </h4>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="social.twitter"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="social.twitter"
                    id="social.twitter"
                    value={formData.socialLinks.twitter || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                    placeholder="https://twitter.com/your-handle"
                  />
                </div>
                <div>
                  <label
                    htmlFor="social.telegram"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Telegram
                  </label>
                  <input
                    type="url"
                    name="social.telegram"
                    id="social.telegram"
                    value={formData.socialLinks.telegram || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                    placeholder="https://t.me/your-group"
                  />
                </div>
                <div>
                  <label
                    htmlFor="social.website"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Website
                  </label>
                  <input
                    type="url"
                    name="social.website"
                    id="social.website"
                    value={formData.socialLinks.website || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isDeploying}
                className="w-full py-4 px-6 rounded-xl bg-blue text-black font-semibold text-lg hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isDeploying ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deploying Token...</span>
                  </div>
                ) : (
                  'Deploy Token'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateToken; 