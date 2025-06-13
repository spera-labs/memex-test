import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { web3Service } from '../utils/web3';

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
  image: string;
  twitter: string;
  telegram: string;
  website: string;
}

const CreateToken: React.FC<CreateTokenProps> = ({ wallet }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    symbol: '',
    description: '',
    image: '',
    twitter: '',
    telegram: '',
    website: ''
  });
  const [deploymentFee, setDeploymentFee] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    fetchDeploymentFee();
  }, []);

  const fetchDeploymentFee = async () => {
    try {
      const fee = await web3Service.getDeploymentFee();
      setDeploymentFee(fee);
    } catch (error) {
      console.error('Error fetching deployment fee:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.symbol) {
      toast.error('Name and symbol are required');
      return;
    }

    if (formData.symbol.length > 10) {
      toast.error('Symbol must be 10 characters or less');
      return;
    }

    setIsDeploying(true);
    const loadingToast = toast.loading('Deploying your token...');

    try {
      const result = await web3Service.deployToken(
        formData.name,
        formData.symbol,
        formData.description,
        formData.image,
        formData.twitter,
        formData.telegram,
        formData.website
      );

      toast.dismiss(loadingToast);
      toast.success('Token deployed successfully!');
      
      // Redirect to the token detail page
      navigate(`/token/${result.tokenAddress}`);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Error deploying token:', error);
      toast.error(error.message || 'Failed to deploy token');
    } finally {
      setIsDeploying(false);
    }
  };

  const isFormValid = formData.name && formData.symbol && formData.symbol.length <= 10;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Create Your Token</h1>
          <p className="text-secondary-600">
            Launch your token with automated bonding curve pricing
          </p>
        </div>

        {/* Deployment Fee Info */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary-800">Deployment Fee</h3>
              <p className="text-sm text-primary-600">Required to deploy your token contract</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-800">{deploymentFee} ETH</p>
              <p className="text-sm text-primary-600">≈ ${(parseFloat(deploymentFee) * 2000).toFixed(2)} USD</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-800">Basic Information</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                Token Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., My Awesome Token"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-secondary-700 mb-2">
                Token Symbol *
              </label>
              <input
                type="text"
                id="symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                placeholder="e.g., MAT (max 10 characters)"
                className="input-field"
                maxLength={10}
                required
              />
              <p className="text-xs text-secondary-500 mt-1">
                {formData.symbol.length}/10 characters
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your token and its purpose..."
                rows={4}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-800">Social Links (Optional)</h3>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-secondary-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-secondary-700 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourproject.com"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-secondary-700 mb-2">
                  Twitter
                </label>
                <input
                  type="text"
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="telegram" className="block text-sm font-medium text-secondary-700 mb-2">
                  Telegram
                </label>
                <input
                  type="text"
                  id="telegram"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleInputChange}
                  placeholder="t.me/channel"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Bonding Curve Info */}
          <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
            <h3 className="font-semibold text-secondary-800 mb-2">Bonding Curve Details</h3>
            <div className="text-sm text-secondary-600 space-y-1">
              <p>• Initial price starts near zero</p>
              <p>• Price increases with each purchase</p>
              <p>• Automatic liquidity provision</p>
              <p>• Fair launch for all participants</p>
            </div>
          </div>

          {/* Wallet Balance Check */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-yellow-800">Your Balance</h3>
                <p className="text-sm text-yellow-600">Make sure you have enough ETH for deployment</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-yellow-800">{wallet.balance} ETH</p>
                <p className={`text-sm ${
                  parseFloat(wallet.balance) >= parseFloat(deploymentFee) 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {parseFloat(wallet.balance) >= parseFloat(deploymentFee) 
                    ? '✅ Sufficient balance' 
                    : '❌ Insufficient balance'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isDeploying || parseFloat(wallet.balance) < parseFloat(deploymentFee)}
            className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeploying ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deploying Token...</span>
              </div>
            ) : (
              `Deploy Token (${deploymentFee} ETH)`
            )}
          </button>

          {!isFormValid && (
            <p className="text-sm text-red-600 text-center">
              Please fill in all required fields
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateToken; 