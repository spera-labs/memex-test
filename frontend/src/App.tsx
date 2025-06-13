import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
    balance: '0',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length > 0) {
      const address = accounts[0];
      const balance = await web3Service.getBalance();
      setWallet({
        isConnected: true,
        address,
        balance,
      });
    } else {
      setWallet({
        isConnected: false,
        address: '',
        balance: '0',
      });
    }
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await handleAccountsChanged(accounts);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [handleAccountsChanged]);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const address = await web3Service.connectWallet();
      const balance = await web3Service.getBalance();
      setWallet({
        isConnected: true,
        address,
        balance,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: '',
      balance: '0',
    });
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Toaster position="top-right" />
        <Header
          wallet={wallet}
          isLoading={isLoading}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/create-token"
              element={<CreateToken wallet={wallet} />}
            />
            <Route
              path="/token/:address"
              element={<TokenDetail wallet={wallet} />}
            />
            <Route
              path="/dashboard"
              element={<Dashboard wallet={wallet} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
