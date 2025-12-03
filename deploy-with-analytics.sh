#!/bin/bash

# Deploy to Vercel with Analytics enabled
# This script ensures that Vercel Analytics is properly configured

echo "🚀 Preparing deployment with Vercel Analytics..."

# Check if package.json has @vercel/analytics
if grep -q "@vercel/analytics" package.json; then
    echo "✅ @vercel/analytics found in package.json"
else
    echo "❌ @vercel/analytics not found in package.json"
    echo "Run: npm install @vercel/analytics"
    exit 1
fi

# Check if vercel-analytics.js exists
if [ -f "js/vercel-analytics.js" ]; then
    echo "✅ Vercel Analytics script found"
else
    echo "❌ Vercel Analytics script missing"
    exit 1
fi

# Check if main HTML files include analytics
if grep -q "vercel-analytics.js" index.html; then
    echo "✅ Analytics included in main page"
else
    echo "❌ Analytics not included in main page"
    exit 1
fi

echo "📊 Vercel Analytics setup complete!"
echo ""
echo "When deployed to Vercel, you can track:"
echo "• Page views and sessions"
echo "• Tool usage events"
echo "• Search queries"
echo "• Button clicks"
echo "• Errors and performance"
echo ""
echo "Visit https://vercel.com/dashboard/analytics to view your data"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod