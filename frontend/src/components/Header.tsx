import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface WalletState {
  isConnected: boolean;
  address: string;
  balance: string;
}

interface HeaderProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ wallet, onConnect, onDisconnect, isLoading }) => {
  const location = useLocation();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Memex</h1>
              <p className="text-xs text-secondary-500">Token Factory</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                  : 'text-secondary-600 hover:text-primary-600'
              }`}
            >
              Home
            </Link>
            {wallet.isConnected && (
              <>
                <Link
                  to="/create"
                  className={`font-medium transition-colors duration-200 ${
                    isActive('/create') 
                      ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                      : 'text-secondary-600 hover:text-primary-600'
                  }`}
                >
                  Create Token
                </Link>
                <Link
                  to="/dashboard"
                  className={`font-medium transition-colors duration-200 ${
                    isActive('/dashboard') 
                      ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                      : 'text-secondary-600 hover:text-primary-600'
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {wallet.isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-secondary-800">
                    {formatAddress(wallet.address)}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {formatBalance(wallet.balance)} ETH
                  </p>
                </div>
                <button
                  onClick={onDisconnect}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {wallet.isConnected && (
          <nav className="md:hidden mt-4 pt-4 border-t border-secondary-200">
            <div className="flex space-x-6">
              <Link
                to="/create"
                className={`font-medium text-sm transition-colors duration-200 ${
                  isActive('/create') 
                    ? 'text-primary-600' 
                    : 'text-secondary-600 hover:text-primary-600'
                }`}
              >
                Create Token
              </Link>
              <Link
                to="/dashboard"
                className={`font-medium text-sm transition-colors duration-200 ${
                  isActive('/dashboard') 
                    ? 'text-primary-600' 
                    : 'text-secondary-600 hover:text-primary-600'
                }`}
              >
                Dashboard
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 