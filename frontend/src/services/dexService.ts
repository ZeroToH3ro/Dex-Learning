import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_CONFIG, FUNCTIONS } from "../config";

export class DEXService {
  private client: SuiClient;

  constructor() {
    this.client = new SuiClient({
      url: getFullnodeUrl(
        CONTRACT_CONFIG.NETWORK as "devnet" | "testnet" | "mainnet"
      ),
    });
  }

  // Create a new liquidity pool
  async createPool(tokenA: string, tokenB: string) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${FUNCTIONS.CREATE_POOL}`,
      arguments: [tx.object(tokenA), tx.object(tokenB)],
    });

    return tx;
  }

  // Add liquidity to existing pool
  async addLiquidity(
    poolId: string,
    tokenA: string,
    tokenB: string,
    treasuryCapId: string
  ) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${FUNCTIONS.ADD_LIQUIDITY}`,
      arguments: [
        tx.object(poolId),
        tx.object(tokenA),
        tx.object(tokenB),
        tx.object(treasuryCapId),
      ],
    });

    return tx;
  }

  // Remove liquidity from pool
  async removeLiquidity(
    poolId: string,
    lpTokens: string,
    treasuryCapId: string
  ) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${FUNCTIONS.REMOVE_LIQUIDITY}`,
      arguments: [
        tx.object(poolId),
        tx.object(lpTokens),
        tx.object(treasuryCapId),
      ],
    });

    return tx;
  }

  // Swap Token A for Token B
  async swapAToB(poolId: string, tokenA: string, minTokenBOut: number) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${FUNCTIONS.SWAP_A_TO_B}`,
      arguments: [
        tx.object(poolId),
        tx.object(tokenA),
        tx.pure.u64(minTokenBOut),
      ],
    });

    return tx;
  }

  // Swap Token B for Token A
  async swapBToA(poolId: string, tokenB: string, minTokenAOut: number) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${FUNCTIONS.SWAP_B_TO_A}`,
      arguments: [
        tx.object(poolId),
        tx.object(tokenB),
        tx.pure.u64(minTokenAOut),
      ],
    });

    return tx;
  }

  // Get pool reserves
  async getReserves(poolId: string) {
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${FUNCTIONS.GET_RESERVES}`,
        arguments: [tx.object(poolId)],
      });

      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      });

      return result;
    } catch (error) {
      console.error("Error getting reserves:", error);
      return null;
    }
  }

  // Calculate swap output
  async calculateSwapOutput(
    poolId: string,
    inputAmount: number,
    isAToB: boolean
  ) {
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${FUNCTIONS.CALCULATE_SWAP_OUTPUT}`,
        arguments: [
          tx.object(poolId),
          tx.pure.u64(inputAmount),
          tx.pure.bool(isAToB),
        ],
      });

      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      });

      return result;
    } catch (error) {
      console.error("Error calculating swap output:", error);
      return null;
    }
  }

  // Get user's coin objects
  async getUserCoins(address: string, coinType: string) {
    try {
      const coins = await this.client.getCoins({
        owner: address,
        coinType: coinType,
      });
      return coins.data;
    } catch (error) {
      console.error("Error getting user coins:", error);
      return [];
    }
  }

  // Execute transaction with wallet
  async executeTransaction(tx: Transaction, signer: any) {
    try {
      const result = await this.client.signAndExecuteTransaction({
        signer: signer,
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });
      return result;
    } catch (error) {
      console.error("Error executing transaction:", error);
      throw error;
    }
  }
}
