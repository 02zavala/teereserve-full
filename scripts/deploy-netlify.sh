#!/bin/bash

# 🚀 TeeReserve Golf - Deploy to Netlify (Alternative)

echo "🌐 Deploying TeeReserve Golf to Netlify..."

# Build for static export
echo "Building for static deployment..."
npm run build
npm run export 2>/dev/null || echo "Export not needed for Next.js 15"

# Create zip for manual upload
echo "Creating deployment package..."
cd .next || cd out || cd build
zip -r ../teereserve-golf-deploy.zip .
cd ..

echo "✅ Deployment package created: teereserve-golf-deploy.zip"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://app.netlify.com/drop"
echo "2. Drag and drop: teereserve-golf-deploy.zip"
echo "3. Your site will be live instantly!"
echo ""
echo "🔧 Then configure:"
echo "- Custom domain: teereserve.golf"
echo "- Environment variables from .env.production"
