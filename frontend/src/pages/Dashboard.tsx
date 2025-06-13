import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { web3Service } from '../utils/web3';
import toast from 'react-hot-toast';

interface WalletState {
  isConnected: boolean;
  address: string;
  balance: string;
}

interface DashboardProps {
  wallet: WalletState;
}

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  supply: string;
  bondingCurve: string;
  creator: string;
}

const Dashboard: React.FC<DashboardProps> = ({ wallet }) => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (wallet.isConnected) {
      fetchTokens();
    }
  }, [wallet.isConnected]);

  const fetchTokens = async () => {
    try {
      // TODO: Implement token fetching
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast.error('Failed to fetch tokens');
      setIsLoading(false);
    }
  };

  if (!wallet.isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-2 text-lg text-gray-600">
              Manage your tokens and track their performance
            </p>
          </div>
          <Link
            to="/create-token"
            className="btn-primary flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Create Token</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tokens.length === 0 ? (
          <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Tokens Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first token to get started with the bonding curve system
              </p>
              <Link
                to="/create-token"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Create Your First Token</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <div
                key={token.address}
                className="bg-white shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {token.name}
                    </h3>
                    <p className="text-sm text-gray-500">{token.symbol}</p>
                  </div>
                  <Link
                    to={`/token/${token.address}`}
                    className="text-primary hover:text-primary-dark"
                  >
                    View Details
                  </Link>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Supply</span>
                    <span className="font-medium text-gray-900">
                      {token.supply}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Creator</span>
                    <span className="font-medium text-gray-900">
                      {token.creator.slice(0, 6)}...{token.creator.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 