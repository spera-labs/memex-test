import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Home from './pages/Home';
import CreateToken from './pages/CreateToken';
import TokenDetail from './pages/TokenDetail';
import Dashboard from './pages/Dashboard';
import { web3Service } from './utils/web3';

interface WalletState {
  isConnected: boolean;
  address: string;
  balance: string;
}

function App() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: '',
    balance: '0'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const address = accounts[0];
          const balance = await web3Service.getBalance(address);
          setWallet({
            isConnected: true,
            address,
            balance
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWallet({ isConnected: false, address: '', balance: '0' });
    } else {
      handleWalletConnect();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleWalletConnect = async () => {
    setIsLoading(true);
    try {
      const address = await web3Service.connectWallet();
      const balance = await web3Service.getBalance(address);
      setWallet({
        isConnected: true,
        address,
        balance
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletDisconnect = () => {
    setWallet({ isConnected: false, address: '', balance: '0' });
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header 
          wallet={wallet}
          onConnect={handleWalletConnect}
          onDisconnect={handleWalletDisconnect}
          isLoading={isLoading}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/create" 
              element={
                wallet.isConnected ? 
                <CreateToken wallet={wallet} /> : 
                <Navigate to="/" replace />
              } 
            />
            <Route path="/token/:address" element={<TokenDetail wallet={wallet} />} />
            <Route 
              path="/dashboard" 
              element={
                wallet.isConnected ? 
                <Dashboard wallet={wallet} /> : 
                <Navigate to="/" replace />
              } 
            />
          </Routes>
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
