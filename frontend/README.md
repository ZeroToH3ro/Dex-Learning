# DEX Frontend

A React-based frontend for interacting with the SUI DEX smart contract.

## Features

- **Swap Interface**: Exchange tokens with slippage protection
- **Liquidity Management**: Add and remove liquidity from pools
- **Wallet Integration**: Connect with SUI wallets
- **Real-time Data**: Live pool reserves and pricing
- **Responsive Design**: Works on desktop and mobile

## Setup Instructions

### Prerequisites

1. Node.js (v16 or higher)
2. npm or yarn
3. A SUI wallet (SUI Wallet, Ethos, etc.)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Configuration

Before running the frontend, you need to update the configuration in `src/config.ts`:

```typescript
export const CONTRACT_CONFIG = {
  PACKAGE_ID: "0x...", // Your deployed package ID
  
  TOKEN_A: {
    name: "Token A",
    symbol: "TOKENA",
    decimals: 9,
    type: "0x...::token_a::TOKEN_A" // Your Token A type
  },
  
  TOKEN_B: {
    name: "Token B", 
    symbol: "TOKENB",
    decimals: 9,
    type: "0x...::token_b::TOKEN_B" // Your Token B type
  },
  
  LP_TOKEN: {
    name: "LP Token",
    symbol: "LP",
    decimals: 9,
    type: "0x...::lp_token::LP_TOKEN" // Your LP token type
  }
};
```

### Deployment Steps

1. **Deploy Smart Contract**: First deploy your DEX smart contract to SUI
2. **Update Configuration**: Replace placeholder addresses with actual deployed contract addresses
3. **Set Pool ID**: Update the `POOL_ID` in `App.tsx` with your liquidity pool object ID
4. **Build Frontend**: Run `npm run build` to create production build
5. **Deploy**: Deploy the build folder to your hosting service

## Usage

### Connecting Wallet

1. Click "Connect Wallet" in the top right
2. Choose your preferred SUI wallet
3. Approve the connection

### Swapping Tokens

1. Select the "Swap" tab
2. Enter the amount you want to swap
3. Set your slippage tolerance
4. Click "Swap" and confirm the transaction

### Managing Liquidity

1. Select the "Liquidity" tab
2. To add liquidity:
   - Enter amounts for both tokens
   - Click "Add Liquidity"
3. To remove liquidity:
   - Switch to "Remove" mode
   - Enter LP token amount
   - Click "Remove Liquidity"

## Architecture

```
src/
├── components/          # React components
│   ├── SwapComponent.tsx
│   └── LiquidityComponent.tsx
├── services/           # Blockchain interaction
│   └── dexService.ts
├── config.ts          # Contract configuration
├── App.tsx           # Main application
└── index.tsx         # Entry point
```

## Security Considerations

- Always verify contract addresses before interacting
- Use reasonable slippage settings (0.5-2%)
- Double-check transaction details before signing
- Keep your wallet seed phrase secure
- This is beta software - use at your own risk

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure you have a SUI wallet installed
   - Check that the wallet is unlocked
   - Try refreshing the page

2. **Transaction Failed**
   - Check your SUI balance for gas fees
   - Verify you have sufficient token balances
   - Ensure contract addresses are correct

3. **Pool Not Found**
   - Verify the pool ID is correct
   - Check if the pool has been created
   - Ensure the contract is deployed

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your wallet connection
3. Confirm contract addresses are correct
4. Check SUI network status

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
