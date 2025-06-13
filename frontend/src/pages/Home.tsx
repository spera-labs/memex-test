import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
  bondingCurve: string;
  marketCap: string;
  price: string;
  volume24h: string;
  priceChange24h: string;
}

const Home: React.FC = () => {
  const [featuredTokens, setFeaturedTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTokens();
  }, []);

  const fetchFeaturedTokens = async () => {
    try {
      // This would typically fetch from your backend API
      // For now, we'll use mock data
      const mockTokens: Token[] = [
        {
          id: '1',
          name: 'Sample Token',
          symbol: 'SAMPLE',
          address: '0x1234...5678',
          bondingCurve: '0xabcd...efgh',
          marketCap: '125,000',
          price: '0.0245',
          volume24h: '12,450',
          priceChange24h: '+15.4'
        },
        {
          id: '2',
          name: 'Demo Coin',
          symbol: 'DEMO',
          address: '0x2345...6789',
          bondingCurve: '0xbcde...fghi',
          marketCap: '89,500',
          price: '0.0189',
          volume24h: '8,750',
          priceChange24h: '-3.2'
        }
      ];
      
      setFeaturedTokens(mockTokens);
    } catch (error) {
      console.error('Error fetching featured tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-6">
            Create & Trade Tokens
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
            Launch your own tokens with automatic bonding curves on Abstract L2. 
            No coding required. Fair launch guaranteed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create" className="btn-primary text-lg px-8 py-4">
              Create Token
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="card text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM1 15a1 1 0 011-1h2a1 1 0 110 2H2a1 1 0 01-1-1zm13-1a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Automated Bonding Curves</h3>
          <p className="text-secondary-600">
            Price discovery through mathematical curves. No manual market making required.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Abstract L2 Network</h3>
          <p className="text-secondary-600">
            Built on Abstract Layer 2 for fast transactions and low fees.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Fair Launch</h3>
          <p className="text-secondary-600">
            Equal opportunity for all participants. No pre-mining or insider advantages.
          </p>
        </div>
      </section>

      {/* Featured Tokens */}
      <section className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-secondary-800">Featured Tokens</h2>
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-secondary-200 rounded mb-4"></div>
                <div className="h-6 bg-secondary-200 rounded mb-2"></div>
                <div className="h-4 bg-secondary-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTokens.map((token) => (
              <Link
                key={token.id}
                to={`/token/${token.address}`}
                className="card hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{token.name}</h3>
                    <p className="text-secondary-500">{token.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${token.price}</p>
                    <p className={`text-sm ${
                      token.priceChange24h.startsWith('+') 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {token.priceChange24h}%
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-secondary-600">
                  <div className="flex justify-between">
                    <span>Market Cap:</span>
                    <span>${token.marketCap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>24h Volume:</span>
                    <span>${token.volume24h}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Launch Your Token?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join the future of decentralized token creation and trading
        </p>
        <Link to="/create" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
          Get Started Now
        </Link>
      </section>
    </div>
  );
};

export default Home; 