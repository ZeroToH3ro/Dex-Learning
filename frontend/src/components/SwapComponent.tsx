import React, { useState, useEffect } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import { DEXService } from '../services/dexService';
import { CONTRACT_CONFIG } from '../config';

interface SwapComponentProps {
  poolId: string;
}

const SwapComponent: React.FC<SwapComponentProps> = ({ poolId }) => {
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();
  const [tokenAAmount, setTokenAAmount] = useState('');
  const [tokenBAmount, setTokenBAmount] = useState('');
  const [isAToB, setIsAToB] = useState(true);
  const [loading, setLoading] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [reserves, setReserves] = useState<[number, number] | null>(null);
  
  const dexService = new DEXService();

  // Load pool reserves
  useEffect(() => {
    const loadReserves = async () => {
      if (poolId) {
        const result = await dexService.getReserves(poolId);
        // Process result to extract reserves
        if (result) {
          // This would need to be parsed from the actual result
          // setReserves([reserveA, reserveB]);
        }
      }
    };
    loadReserves();
  }, [poolId]);

  // Calculate output amount when input changes
  useEffect(() => {
    const calculateOutput = async () => {
      if (tokenAAmount && poolId && isAToB) {
        const result = await dexService.calculateSwapOutput(
          poolId,
          parseFloat(tokenAAmount) * Math.pow(10, CONTRACT_CONFIG.TOKEN_A.decimals),
          isAToB
        );
        // Process result and set tokenBAmount
        if (result) {
          // Parse the result and set output amount
          // setTokenBAmount(calculatedAmount);
        }
      }
    };
    
    if (tokenAAmount && !loading) {
      calculateOutput();
    }
  }, [tokenAAmount, isAToB, poolId]);

  const handleSwap = async () => {
    if (!currentAccount || !poolId) return;

    setLoading(true);
    try {
      const inputAmount = parseFloat(isAToB ? tokenAAmount : tokenBAmount);
      const outputAmount = parseFloat(isAToB ? tokenBAmount : tokenAAmount);
      const minOutputAmount = outputAmount * (1 - slippage / 100);

      let txb;
      if (isAToB) {
        // Get user's Token A coins
        const userCoins = await dexService.getUserCoins(
          currentAccount.address,
          CONTRACT_CONFIG.TOKEN_A.type
        );
        
        if (userCoins.length === 0) {
          alert('No Token A coins found');
          return;
        }

        txb = await dexService.swapAToB(
          poolId,
          userCoins[0].coinObjectId,
          Math.floor(minOutputAmount * Math.pow(10, CONTRACT_CONFIG.TOKEN_B.decimals))
        );
      } else {
        // Get user's Token B coins
        const userCoins = await dexService.getUserCoins(
          currentAccount.address,
          CONTRACT_CONFIG.TOKEN_B.type
        );
        
        if (userCoins.length === 0) {
          alert('No Token B coins found');
          return;
        }

        txb = await dexService.swapBToA(
          poolId,
          userCoins[0].coinObjectId,
          Math.floor(minOutputAmount * Math.pow(10, CONTRACT_CONFIG.TOKEN_A.decimals))
        );
      }

      const result = await signAndExecuteTransactionBlock({ transactionBlock: txb as any });
      console.log('Swap successful:', result);
      
      // Reset form
      setTokenAAmount('');
      setTokenBAmount('');
      
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    setIsAToB(!isAToB);
    setTokenAAmount(tokenBAmount);
    setTokenBAmount(tokenAAmount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Swap Tokens</h2>
      
      {/* Slippage Settings */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slippage Tolerance: {slippage}%
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={slippage}
          onChange={(e) => setSlippage(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Token A Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          From: {isAToB ? CONTRACT_CONFIG.TOKEN_A.name : CONTRACT_CONFIG.TOKEN_B.name}
        </label>
        <input
          type="number"
          value={isAToB ? tokenAAmount : tokenBAmount}
          onChange={(e) => isAToB ? setTokenAAmount(e.target.value) : setTokenBAmount(e.target.value)}
          placeholder="0.0"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Switch Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={switchTokens}
          className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* Token B Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          To: {isAToB ? CONTRACT_CONFIG.TOKEN_B.name : CONTRACT_CONFIG.TOKEN_A.name}
        </label>
        <input
          type="number"
          value={isAToB ? tokenBAmount : tokenAAmount}
          onChange={(e) => isAToB ? setTokenBAmount(e.target.value) : setTokenAAmount(e.target.value)}
          placeholder="0.0"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly
        />
      </div>

      {/* Pool Info */}
      {reserves && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Pool Reserves</h3>
          <p className="text-sm text-gray-600">
            {CONTRACT_CONFIG.TOKEN_A.symbol}: {(reserves[0] / Math.pow(10, CONTRACT_CONFIG.TOKEN_A.decimals)).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            {CONTRACT_CONFIG.TOKEN_B.symbol}: {(reserves[1] / Math.pow(10, CONTRACT_CONFIG.TOKEN_B.decimals)).toLocaleString()}
          </p>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={loading || !currentAccount || !tokenAAmount || !tokenBAmount}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          loading || !currentAccount || !tokenAAmount || !tokenBAmount
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? 'Swapping...' : !currentAccount ? 'Connect Wallet' : 'Swap'}
      </button>
    </div>
  );
};

export default SwapComponent;
