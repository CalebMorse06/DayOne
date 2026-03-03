#!/bin/bash
# DayOne Multi-Platform Deployment & Audit Script
# This script prepares the project for Vercel (Web) and Capacitor (iOS/Android)

echo "🚀 Starting DayOne Production Audit..."

# 1. Project Health Check
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
fi

# 2. Production Build Check (Web)
echo "🏗️ Testing production web build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Web build successful."
else
    echo "❌ Web build failed. Check logs."
    exit 1
fi

# 3. Capacitor Preparation (Mobile)
echo "📱 Preparing Capacitor for Mobile..."
# Generate static export for Capacitor
npm run static

# Ensure iOS platform exists, if not add it
if [ ! -d "ios" ]; then
    echo "➕ Adding iOS platform..."
    npx cap add ios
fi

# Syncing web assets to native project
echo "🔄 Syncing assets to native platforms..."
npx cap sync

echo "✅ Multi-platform preparation complete."
echo "------------------------------------------------"
echo "NEXT STEPS:"
echo "1. Web: Connect this GitHub repo to Vercel."
echo "2. App Store: Run 'npx cap open ios' to open in Xcode."
echo "3. API Keys: Ensure GEMINI_API_KEY is set in Vercel and your .env."
echo "------------------------------------------------"
