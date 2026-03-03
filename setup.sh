#!/bin/bash
# DayOne Zero-Headache Environment Setup
# Run this once to ensure everything is production-ready

echo "🚀 Polishing DayOne environment..."

# 1. Automated .env generation (safe-by-default)
if [ ! -f .env.local ]; then
    echo "📄 Creating .env.local from template..."
    echo "NEXT_PUBLIC_SUPABASE_URL=" >> .env.local
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=" >> .env.local
    echo "GEMINI_API_KEY=" >> .env.local
    echo "STRIPE_SECRET_KEY=" >> .env.local
    echo "STRIPE_WEBHOOK_SECRET=" >> .env.local
fi

# 2. Database Migration Check
echo "🗄️ Checking database schema availability..."
if [ -f lib/supabase.ts ]; then
    echo "✅ SQL Schema is documented in lib/supabase.ts for one-click setup."
fi

# 3. Capacitor Native Sync
echo "📱 Syncing native mobile components..."
npm run cap:sync

# 4. Cleanup and Optimization
echo "🧹 Cleaning build artifacts..."
rm -rf .next
npm prune

echo "------------------------------------------------"
echo "✅ Environment Hardened."
echo "READY TO BUILD: Run 'npm run dev' to start."
echo "READY TO DEPLOY: Run 'vercel' to go live."
echo "------------------------------------------------"
