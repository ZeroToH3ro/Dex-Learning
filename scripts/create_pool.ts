import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX } from '@mysten/sui/utils';

// Your deployed package ID
const PACKAGE_ID = "0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8";

// Configuration
const CONFIG = {
  NETWORK: 'devnet' as const,
  TOKEN_A_TYPE: `${PACKAGE_ID}::token_a::TOKEN_A`,
  TOKEN_B_TYPE: `${PACKAGE_ID}::token_b::TOKEN_B`,
  LP_TOKEN_TYPE: `${PACKAGE_ID}::lp_token::LP_TOKEN`,
};

class PoolCreator {
  private client: SuiClient;
  private keypair: Ed25519Keypair;

  constructor(privateKey?: string) {
    this.client = new SuiClient({
      url: getFullnodeUrl(CONFIG.NETWORK),
    });
    
    if (privateKey) {
      this.keypair = Ed25519Keypair.fromSecretKey(fromHEX(privateKey));
    } else {
      // Generate a new keypair for testing
      this.keypair = new Ed25519Keypair();
    }
  }

  async getBalance() {
    const address = this.keypair.getPublicKey().toSuiAddress();
    const balance = await this.client.getBalance({ owner: address });
    return balance;
  }

  async mintTokens(amount: number = 1000000000) { // 1 token with 9 decimals
    const tx = new Transaction();
    
    // Get treasury caps - you'll need to find these object IDs after deployment
    const tokenATreasuryCap = "0x..."; // Replace with actual treasury cap ID
    const tokenBTreasuryCap = "0x..."; // Replace with actual treasury cap ID
    
    // Mint Token A
    tx.moveCall({
      target: `${PACKAGE_ID}::token_a::mint`,
      arguments: [
        tx.object(tokenATreasuryCap),
        tx.pure.u64(amount),
        tx.pure.address(this.keypair.getPublicKey().toSuiAddress()),
      ],
    });

    // Mint Token B
    tx.moveCall({
      target: `${PACKAGE_ID}::token_b::mint`,
      arguments: [
        tx.object(tokenBTreasuryCap),
        tx.pure.u64(amount),
        tx.pure.address(this.keypair.getPublicKey().toSuiAddress()),
      ],
    });

    const result = await this.client.signAndExecuteTransaction({
      signer: this.keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    return result;
  }

  async createPool(tokenAAmount: number, tokenBAmount: number) {
    const tx = new Transaction();
    
    // Get user's coins
    const address = this.keypair.getPublicKey().toSuiAddress();
    const tokenACoins = await this.client.getCoins({
      owner: address,
      coinType: CONFIG.TOKEN_A_TYPE,
    });
    
    const tokenBCoins = await this.client.getCoins({
      owner: address,
      coinType: CONFIG.TOKEN_B_TYPE,
    });

    if (tokenACoins.data.length === 0 || tokenBCoins.data.length === 0) {
      throw new Error('No tokens found. Please mint tokens first.');
    }

    // Use the first available coins
    const tokenACoin = tokenACoins.data[0];
    const tokenBCoin = tokenBCoins.data[0];

    // Create pool
    tx.moveCall({
      target: `${PACKAGE_ID}::dex::create_pool`,
      arguments: [
        tx.object(tokenACoin.coinObjectId),
        tx.object(tokenBCoin.coinObjectId),
      ],
    });

    const result = await this.client.signAndExecuteTransaction({
      signer: this.keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    return result;
  }

  async findCreatedPool(transactionResult: any) {
    const objectChanges = transactionResult.objectChanges;
    const createdPool = objectChanges?.find(
      (change: any) => change.type === 'created' && change.objectType?.includes('::dex::LiquidityPool')
    );
    
    return createdPool?.objectId;
  }
}

// Example usage
async function main() {
  try {
    // Initialize with your private key (optional)
    const poolCreator = new PoolCreator(); // or new PoolCreator('your-private-key')
    
    console.log('📊 Checking balance...');
    const balance = await poolCreator.getBalance();
    console.log('Balance:', balance);
    
    console.log('🔨 Creating pool...');
    const result = await poolCreator.createPool(1000000000, 2000000000); // 1 TOKEN_A, 2 TOKEN_B
    console.log('Pool creation result:', result);
    
    const poolId = await poolCreator.findCreatedPool(result);
    console.log('🎉 Pool created with ID:', poolId);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { PoolCreator, CONFIG };
