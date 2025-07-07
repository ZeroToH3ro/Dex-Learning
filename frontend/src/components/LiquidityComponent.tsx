import React, { useState } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import { DEXService } from '../services/dexService';
import { CONTRACT_CONFIG } from '../config';

interface LiquidityComponentProps {
  poolId: string;
}

const LiquidityComponent: React.FC<LiquidityComponentProps> = ({ poolId }) => {
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();
  const [tokenAAmount, setTokenAAmount] = useState('');
  const [tokenBAmount, setTokenBAmount] = useState('');
  const [lpTokenAmount, setLpTokenAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const dexService = new DEXService();

  const handleAddLiquidity = async () => {
    if (!currentAccount || !poolId) return;

    setLoading(true);
    try {
      // Get user's coins
      const tokenACoins = await dexService.getUserCoins(
        currentAccount.address,
        CONTRACT_CONFIG.TOKEN_A.type
      );
      
      const tokenBCoins = await dexService.getUserCoins(
        currentAccount.address,
        CONTRACT_CONFIG.TOKEN_B.type
      );

      if (tokenACoins.length === 0 || tokenBCoins.length === 0) {
        alert('Insufficient token balance');
        return;
      }

      // You'll need to get the LP token treasury cap somehow
      // This is typically stored after deployment
      const treasuryCapId = "0x..."; // Replace with actual treasury cap ID

      const txb = await dexService.addLiquidity(
        poolId,
        tokenACoins[0].coinObjectId,
        tokenBCoins[0].coinObjectId,
        treasuryCapId
      );

      const result = await signAndExecuteTransactionBlock({ transactionBlock: txb as any });
      console.log('Add liquidity successful:', result);
      
      // Reset form
      setTokenAAmount('');
      setTokenBAmount('');
      
    } catch (error) {
      console.error('Add liquidity failed:', error);
      alert('Add liquidity failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!currentAccount || !poolId) return;

    setLoading(true);
    try {
      // Get user's LP tokens
      const lpTokens = await dexService.getUserCoins(
        currentAccount.address,
        CONTRACT_CONFIG.LP_TOKEN.type
      );

      if (lpTokens.length === 0) {
        alert('No LP tokens found');
        return;
      }

      const treasuryCapId = "0x..."; // Replace with actual treasury cap ID

      const txb = await dexService.removeLiquidity(
        poolId,
        lpTokens[0].coinObjectId,
        treasuryCapId
      );

      const result = await signAndExecuteTransactionBlock({ transactionBlock: txb as any });
      console.log('Remove liquidity successful:', result);
      
      // Reset form
      setLpTokenAmount('');
      
    } catch (error) {
      console.error('Remove liquidity failed:', error);
      alert('Remove liquidity failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {isRemoving ? 'Remove Liquidity' : 'Add Liquidity'}
      </h2>
      
      {/* Toggle Button */}
      <div className="flex mb-6">
        <button
          onClick={() => setIsRemoving(false)}
          className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
            !isRemoving ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Add
        </button>
        <button
          onClick={() => setIsRemoving(true)}
          className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
            isRemoving ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Remove
        </button>
      </div>

      {!isRemoving ? (
        <>
          {/* Add Liquidity Form */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {CONTRACT_CONFIG.TOKEN_A.name} Amount
            </label>
            <input
              type="number"
              value={tokenAAmount}
              onChange={(e) => setTokenAAmount(e.target.value)}
              placeholder="0.0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {CONTRACT_CONFIG.TOKEN_B.name} Amount
            </label>
            <input
              type="number"
              value={tokenBAmount}
              onChange={(e) => setTokenBAmount(e.target.value)}
              placeholder="0.0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleAddLiquidity}
            disabled={loading || !currentAccount || !tokenAAmount || !tokenBAmount}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading || !currentAccount || !tokenAAmount || !tokenBAmount
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? 'Adding Liquidity...' : !currentAccount ? 'Connect Wallet' : 'Add Liquidity'}
          </button>
        </>
      ) : (
        <>
          {/* Remove Liquidity Form */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LP Token Amount
            </label>
            <input
              type="number"
              value={lpTokenAmount}
              onChange={(e) => setLpTokenAmount(e.target.value)}
              placeholder="0.0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleRemoveLiquidity}
            disabled={loading || !currentAccount || !lpTokenAmount}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading || !currentAccount || !lpTokenAmount
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {loading ? 'Removing Liquidity...' : !currentAccount ? 'Connect Wallet' : 'Remove Liquidity'}
          </button>
        </>
      )}
    </div>
  );
};

export default LiquidityComponent;
