import React from 'react';
import { WalletKitProvider } from '@mysten/wallet-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SwapComponent from './components/SwapComponent';
import LiquidityComponent from './components/LiquidityComponent';
import './index.css';

const queryClient = new QueryClient();

// Replace with your actual pool ID after deployment
const POOL_ID = "0x...";

function App() {
  const [activeTab, setActiveTab] = React.useState<'swap' | 'liquidity'>('swap');
  const [isConnected, setIsConnected] = React.useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <WalletKitProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">SUI DEX</h1>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Beta
                  </span>
                </div>
                
                {/* Wallet Connection */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {/* Handle wallet connection */}}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isConnected
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('swap')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'swap'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Swap
                </button>
                <button
                  onClick={() => setActiveTab('liquidity')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'liquidity'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Liquidity
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex justify-center">
              {activeTab === 'swap' ? (
                <SwapComponent poolId={POOL_ID} />
              ) : (
                <LiquidityComponent poolId={POOL_ID} />
              )}
            </div>

            {/* Info Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Value Locked</h3>
                <p className="text-3xl font-bold text-blue-600">$0.00</p>
                <p className="text-sm text-gray-600 mt-1">Across all pools</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">24h Volume</h3>
                <p className="text-3xl font-bold text-green-600">$0.00</p>
                <p className="text-sm text-gray-600 mt-1">Trading volume</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Pairs</h3>
                <p className="text-3xl font-bold text-purple-600">1</p>
                <p className="text-sm text-gray-600 mt-1">TOKEN_A / TOKEN_B</p>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-600">
                <p>© 2024 SUI DEX. Built on Sui Network.</p>
                <p className="mt-2 text-sm">
                  Always verify contract addresses and use at your own risk.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </WalletKitProvider>
    </QueryClientProvider>
  );
}

export default App;
