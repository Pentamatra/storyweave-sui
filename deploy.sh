#!/bin/bash

echo "🚀 ChainMuse Deployment Script"
echo "================================"
echo ""

# Check if we have SUI balance
echo "📍 Checking wallet balance..."
sui client gas

echo ""
echo "⚠️  If you don't have testnet SUI, please visit:"
echo "   https://faucet.sui.io/?address=$(sui client active-address)"
echo ""
read -p "Press Enter when you have testnet SUI tokens..."

echo ""
echo "📦 Building Move contract..."
cd chainmuse_contract
sui move build

echo ""
echo "🚀 Publishing contract to testnet..."
PUBLISH_OUTPUT=$(sui client publish --gas-budget 100000000 --json)

# Extract package ID
PACKAGE_ID=$(echo $PUBLISH_OUTPUT | jq -r '.objectChanges[] | select(.type == "published") | .packageId')

if [ -z "$PACKAGE_ID" ] || [ "$PACKAGE_ID" == "null" ]; then
    echo "❌ Failed to extract package ID"
    echo "Full output:"
    echo $PUBLISH_OUTPUT | jq .
    exit 1
fi

echo "✅ Contract deployed successfully!"
echo "📦 Package ID: $PACKAGE_ID"
echo ""

# Update backend .env
echo "📝 Updating backend configuration..."
cd ../backend
sed -i "s/SUI_PACKAGE_ID=.*/SUI_PACKAGE_ID=$PACKAGE_ID/" .env
echo "✅ Backend .env updated"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start AI service:    cd ai-service && npm start"
echo "   2. Start backend:       cd backend && npm start"
echo "   3. Start frontend:      cd frontend && npm run dev"
echo "   4. Open browser:        http://localhost:3000"
echo ""
echo "🔗 Package ID: $PACKAGE_ID"
echo "🔗 Explorer: https://suiscan.xyz/testnet/object/$PACKAGE_ID"

