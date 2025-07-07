#!/bin/bash

# DEX Frontend Deployment Script

echo "🚀 Starting DEX Frontend Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Navigate to frontend directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "❌ Build directory not found"
    exit 1
fi

echo "🎉 Frontend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update src/config.ts with your deployed contract addresses"
echo "2. Update POOL_ID in src/App.tsx with your liquidity pool object ID"
echo "3. Run 'npm start' to start the development server"
echo "4. Deploy the 'build' folder to your hosting service"
echo ""
echo "🔧 Configuration files to update:"
echo "   - src/config.ts (contract addresses)"
echo "   - src/App.tsx (pool ID)"
echo ""
echo "🌐 To start development server:"
echo "   npm start"
