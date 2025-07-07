#!/bin/bash

# Pool Creation Helper Script for SUI DEX
# Package ID: 0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8

PACKAGE_ID="0x3673547b8917685622ddc09c094f206169c4a655288766340ae10c2128065ee8"

echo "🚀 SUI DEX Pool Creation Helper"
echo "================================"
echo "Package ID: $PACKAGE_ID"
echo ""

# Step 1: Check setup
echo "📋 Step 1: Checking your setup..."
echo "Current address: $(sui client active-address)"
echo "Current network: $(sui client active-env)"
echo "SUI balance: $(sui client balance)"
echo ""

# Step 2: Find Treasury Caps
echo "🔍 Step 2: Finding Treasury Caps..."
echo "Looking for Treasury Cap objects..."

# Find treasury caps
echo "Treasury Caps owned by you:"
sui client objects --json | jq -r '.[] | select(.type | contains("TreasuryCap")) | "Type: \(.type)\nObject ID: \(.objectId)\n"'

echo ""
echo "📝 Please note down the Treasury Cap IDs above:"
echo "- Token A Treasury Cap: [Copy from above]"
echo "- Token B Treasury Cap: [Copy from above]"
echo "- LP Token Treasury Cap: [Copy from above]"
echo ""

# Step 3: Check for existing coins
echo "🪙 Step 3: Checking for existing coins..."
echo "Token A coins:"
sui client objects --json | jq -r '.[] | select(.type | contains("token_a::TOKEN_A")) | "Object ID: \(.objectId)\nType: \(.type)\n"'

echo "Token B coins:"
sui client objects --json | jq -r '.[] | select(.type | contains("token_b::TOKEN_B")) | "Object ID: \(.objectId)\nType: \(.type)\n"'

echo ""

# Step 4: Instructions for minting (if needed)
echo "🔨 Step 4: Minting tokens (if you don't have any)..."
echo "If you don't see any Token A or Token B coins above, you need to mint them first."
echo ""
echo "Commands to mint tokens:"
echo "Replace [TOKEN_A_TREASURY_CAP_ID] and [TOKEN_B_TREASURY_CAP_ID] with actual IDs from Step 2"
echo ""
echo "# Mint 1 Token A:"
echo "sui client call \\"
echo "  --package $PACKAGE_ID \\"
echo "  --module token_a \\"
echo "  --function mint \\"
echo "  --args [TOKEN_A_TREASURY_CAP_ID] 1000000000 \$(sui client active-address) \\"
echo "  --gas-budget 10000000"
echo ""
echo "# Mint 2 Token B:"
echo "sui client call \\"
echo "  --package $PACKAGE_ID \\"
echo "  --module token_b \\"
echo "  --function mint \\"
echo "  --args [TOKEN_B_TREASURY_CAP_ID] 2000000000 \$(sui client active-address) \\"
echo "  --gas-budget 10000000"
echo ""

# Step 5: Pool creation command
echo "🏊 Step 5: Creating the pool..."
echo "After you have Token A and Token B coins, use this command:"
echo "Replace [TOKEN_A_COIN_ID] and [TOKEN_B_COIN_ID] with actual coin IDs"
echo ""
echo "sui client call \\"
echo "  --package $PACKAGE_ID \\"
echo "  --module dex \\"
echo "  --function create_pool \\"
echo "  --args [TOKEN_A_COIN_ID] [TOKEN_B_COIN_ID] \\"
echo "  --gas-budget 10000000"
echo ""

# Step 6: Finding the pool
echo "🔍 Step 6: Finding your created pool..."
echo "After pool creation, look for a shared object with type containing 'LiquidityPool'"
echo "The pool object ID will be in the transaction result under 'created objects'"
echo ""
echo "To find all shared objects:"
echo "sui client objects --json | jq -r '.[] | select(.type | contains(\"LiquidityPool\")) | \"Pool ID: \\(.objectId)\\nType: \\(.type)\\n\"'"
echo ""

echo "✅ Pool creation steps completed!"
echo "Follow the instructions above to create your liquidity pool."
