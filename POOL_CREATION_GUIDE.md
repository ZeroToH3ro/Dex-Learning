# Step-by-Step Guide: Creating a Pool on SUI DEX

## Prerequisites
- SUI CLI installed and configured
- Your deployed package ID: `0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8`
- SUI testnet/devnet tokens for gas

## Step 1: Check Your Setup

```bash
# Check SUI CLI version
sui --version

# Check your address
sui client active-address

# Check your balance
sui client balance

# Check network (should be devnet/testnet)
sui client active-env
```

## Step 2: Find Treasury Caps

After deployment, you need to find the Treasury Cap object IDs for Token A, Token B, and LP Token:

```bash
# Find objects owned by your address
sui client objects

# Look for objects with type containing "TreasuryCap"
# You should see something like:
# - 0x...::token_a::TOKEN_A for Token A treasury cap
# - 0x...::token_b::TOKEN_B for Token B treasury cap
# - 0x...::lp_token::LP_TOKEN for LP token treasury cap
```

## Step 3: Mint Tokens

First, mint some Token A and Token B to create the pool:

```bash
# Mint Token A (1 token = 1,000,000,000 units with 9 decimals)
sui client call \
  --package 0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8 \
  --module token_a \
  --function mint \
  --args [TOKEN_A_TREASURY_CAP_ID] 1000000000 [YOUR_ADDRESS] \
  --gas-budget 10000000

# Mint Token B (2 tokens = 2,000,000,000 units with 9 decimals)
sui client call \
  --package 0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8 \
  --module token_b \
  --function mint \
  --args [TOKEN_B_TREASURY_CAP_ID] 2000000000 [YOUR_ADDRESS] \
  --gas-budget 10000000
```

## Step 4: Find Your Token Coins

After minting, find the coin object IDs:

```bash
# List all your objects again
sui client objects

# Look for Coin objects with types:
# - 0x...::token_a::TOKEN_A
# - 0x...::token_b::TOKEN_B
```

## Step 5: Create the Pool

Now create the liquidity pool:

```bash
sui client call \
  --package 0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8 \
  --module dex \
  --function create_pool \
  --args [TOKEN_A_COIN_ID] [TOKEN_B_COIN_ID] \
  --gas-budget 10000000
```

## Step 6: Find the Created Pool

After the transaction, find the pool object ID:

```bash
# Check the transaction result for created objects
# Look for an object with type containing "LiquidityPool"
# The pool will be a shared object
```

## Example Commands (Replace with Actual IDs)

```bash
# Example treasury cap IDs (replace with actual ones)
TOKEN_A_TREASURY_CAP="0x1234..."
TOKEN_B_TREASURY_CAP="0x5678..."
YOUR_ADDRESS="0xabcd..."

# Mint tokens
sui client call \
  --package 0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8 \
  --module token_a \
  --function mint \
  --args $TOKEN_A_TREASURY_CAP 1000000000 $YOUR_ADDRESS \
  --gas-budget 10000000

sui client call \
  --package 0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8 \
  --module token_b \
  --function mint \
  --args $TOKEN_B_TREASURY_CAP 2000000000 $YOUR_ADDRESS \
  --gas-budget 10000000

# After minting, find coin IDs and create pool
TOKEN_A_COIN="0x9876..."
TOKEN_B_COIN="0x5432..."

sui client call \
  --package 0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8 \
  --module dex \
  --function create_pool \
  --args $TOKEN_A_COIN $TOKEN_B_COIN \
  --gas-budget 10000000
```

## Step 7: Verify Pool Creation

```bash
# Check shared objects to find your pool
sui client objects --address [YOUR_ADDRESS]

# Or check transaction details
sui client transaction [TRANSACTION_DIGEST]
```

## Troubleshooting

### Common Issues:

1. **"Object not found"**: Make sure you're using the correct object IDs
2. **"Insufficient gas"**: Increase the gas budget (try 20000000)
3. **"Type mismatch"**: Ensure you're using the correct token types
4. **"Treasury cap not found"**: Check that you own the treasury caps

### Finding Object IDs:

```bash
# Find all objects you own
sui client objects --json | jq '.[] | select(.type | contains("TreasuryCap"))'

# Find specific coin types
sui client objects --json | jq '.[] | select(.type | contains("token_a"))'
```

## Next Steps

Once you have a pool created:
1. Note the pool object ID
2. Update your frontend configuration
3. Test adding liquidity, removing liquidity, and swapping
4. The pool will be available for others to use since it's a shared object

## Pool Object ID Format

Your pool object ID will look like:
```
0x[64-character-hex-string]
```

Save this ID - you'll need it for all future pool operations!
