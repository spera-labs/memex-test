import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { web3Service } from '../utils/web3';
import { 
  buyTokens, 
  sellTokens, 
  getTokenPrice, 
  getBondingCurveData, 
  getTokenData,
  handleTokenOperation
} from '../utils/tokenOperations';

interface WalletState {
  isConnected: boolean;
  address: string;
  balance: string;
}

interface TokenDetailProps {
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

interface BondingCurveData {
  virtualEth: string;
  realEth: string;
  tokenSupply: string;
  preBondingTarget: string;
  bondingTarget: string;
  isActive: boolean;
}

const TokenDetail: React.FC<TokenDetailProps> = ({ wallet }) => {
  const { address } = useParams<{ address: string }>();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [bondingCurveData, setBondingCurveData] = useState<BondingCurveData | null>(null);
  const [currentPrice, setCurrentPrice] = useState('0');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userBalance, setUserBalance] = useState('0');

  useEffect(() => {
    if (address) {
      fetchTokenData();
    }
  }, [address]);

  useEffect(() => {
    if (wallet.isConnected && tokenData?.address) {
      fetchUserBalance();
    }
  }, [wallet.isConnected, tokenData?.address]);

  const fetchTokenData = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      const [token, bondingCurve] = await Promise.all([
        getTokenData(address),
        getBondingCurveData(address)
      ]);
      
      setTokenData(token);
      setBondingCurveData(bondingCurve);
      
      // Fetch current price
      const price = await getTokenPrice(address);
      setCurrentPrice(price);
    } catch (error) {
      console.error('Error fetching token data:', error);
      toast.error('Failed to load token data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    if (!tokenData?.address || !wallet.isConnected) return;
    
    try {
      const token = await web3Service.getTokenContract(tokenData.address);
      const balance = await token.balanceOf(wallet.address);
      setUserBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  };

  const handleBuy = async () => {
    if (!address || !buyAmount) return;

    const success = await handleTokenOperation(
      () => buyTokens(address, buyAmount, '0'),
      'Buying tokens...',
      'Successfully bought tokens!',
      'Failed to buy tokens'
    );

    if (success) {
      setBuyAmount('');
      fetchTokenData();
      fetchUserBalance();
    }
  };

  const handleSell = async () => {
    if (!address || !sellAmount) return;

    const success = await handleTokenOperation(
      () => sellTokens(address, sellAmount, '0'),
      'Selling tokens...',
      'Successfully sold tokens!',
      'Failed to sell tokens'
    );

    if (success) {
      setSellAmount('');
      fetchTokenData();
      fetchUserBalance();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tokenData || !bondingCurveData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-secondary-800 mb-4">Token Not Found</h2>
        <p className="text-secondary-600">The requested token could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Token Header */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">{tokenData.name}</h1>
            <p className="text-secondary-600">{tokenData.symbol}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-secondary-800">${currentPrice}</p>
            <p className="text-sm text-secondary-500">Current Price</p>
          </div>
        </div>
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-800 mb-2">Total Supply</h3>
          <p className="text-2xl font-bold">{tokenData.supply}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-800 mb-2">ETH Reserve</h3>
          <p className="text-2xl font-bold">{bondingCurveData.realEth} ETH</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-800 mb-2">Your Balance</h3>
          <p className="text-2xl font-bold">{userBalance} {tokenData.symbol}</p>
        </div>
      </div>

      {/* Buy/Sell Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Buy Section */}
        <div className="card">
          <h2 className="text-xl font-bold text-secondary-800 mb-4">Buy {tokenData.symbol}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Amount in ETH
              </label>
              <input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="0.0"
                className="input-field"
                min="0"
                step="0.0001"
              />
            </div>
            <button
              onClick={handleBuy}
              disabled={!wallet.isConnected || !buyAmount || parseFloat(buyAmount) <= 0}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Tokens
            </button>
          </div>
        </div>

        {/* Sell Section */}
        <div className="card">
          <h2 className="text-xl font-bold text-secondary-800 mb-4">Sell {tokenData.symbol}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Amount in {tokenData.symbol}
              </label>
              <input
                type="number"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="0.0"
                className="input-field"
                min="0"
                step="0.0001"
              />
            </div>
            <button
              onClick={handleSell}
              disabled={!wallet.isConnected || !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > parseFloat(userBalance)}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sell Tokens
            </button>
          </div>
        </div>
      </div>

      {/* Bonding Curve Info */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-secondary-800 mb-4">Bonding Curve Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-secondary-700 mb-2">Pre-Bonding Target</h3>
            <p className="text-lg">{bondingCurveData.preBondingTarget} ETH</p>
          </div>
          <div>
            <h3 className="font-semibold text-secondary-700 mb-2">Bonding Target</h3>
            <p className="text-lg">{bondingCurveData.bondingTarget} ETH</p>
          </div>
          <div>
            <h3 className="font-semibold text-secondary-700 mb-2">Virtual ETH</h3>
            <p className="text-lg">{bondingCurveData.virtualEth} ETH</p>
          </div>
          <div>
            <h3 className="font-semibold text-secondary-700 mb-2">Status</h3>
            <p className="text-lg">
              <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                bondingCurveData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {bondingCurveData.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetail; 