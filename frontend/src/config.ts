// Configuration for the DEX smart contract
export const CONTRACT_CONFIG = {
  // Replace with your actual deployed contract addresses
  PACKAGE_ID: "0x...", // Your deployed package ID
  MODULE_NAME: "dex",
  
  // Token configurations
  TOKEN_A: {
    name: "Token A",
    symbol: "TOKENA",
    decimals: 9,
    type: "0x...::token_a::TOKEN_A" // Replace with actual type
  },
  
  TOKEN_B: {
    name: "Token B", 
    symbol: "TOKENB",
    decimals: 9,
    type: "0x...::token_b::TOKEN_B" // Replace with actual type
  },
  
  LP_TOKEN: {
    name: "LP Token",
    symbol: "LP",
    decimals: 9,
    type: "0x...::lp_token::LP_TOKEN" // Replace with actual type
  },
  
  // Network configuration
  NETWORK: "devnet", // or "testnet", "mainnet"
  RPC_URL: "https://fullnode.devnet.sui.io:443"
};

// Function names in the smart contract
export const FUNCTIONS = {
  CREATE_POOL: "create_pool",
  ADD_LIQUIDITY: "add_liquidity", 
  REMOVE_LIQUIDITY: "remove_liquidity",
  SWAP_A_TO_B: "swap_a_to_b",
  SWAP_B_TO_A: "swap_b_to_a",
  GET_RESERVES: "get_reserves",
  CALCULATE_SWAP_OUTPUT: "calculate_swap_output"
} as const;
