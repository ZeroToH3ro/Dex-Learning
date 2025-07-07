// Configuration for the DEX smart contract
export const CONTRACT_CONFIG = {
  // Your deployed package ID
  PACKAGE_ID: "0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8",
  MODULE_NAME: "dex",
  
  // Token configurations
  TOKEN_A: {
    name: "Token A",
    symbol: "TOKENA",
    decimals: 9,
    type: "0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8::token_a::TOKEN_A"
  },
  
  TOKEN_B: {
    name: "Token B", 
    symbol: "TOKENB",
    decimals: 9,
    type: "0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8::token_b::TOKEN_B"
  },
  
  LP_TOKEN: {
    name: "LP Token",
    symbol: "LP",
    decimals: 9,
    type: "0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8::lp_token::LP_TOKEN"
  },
  
  // Network configuration
  NETWORK: "testnet", // or "testnet", "mainnet"
  RPC_URL: "https://fullnode.testnet.sui.io:443"
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
