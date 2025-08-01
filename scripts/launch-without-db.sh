#!/bin/bash

# 🚀 TeeReserve Golf - Launch Without Database Setup
# Deploy to production first, then setup database remotely

set -e

echo "🚀 =============================================="
echo "   TEERESERVE GOLF - QUICK LAUNCH"
echo "   (Database setup will be done remotely)"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Environment Setup
print_status "Setting up environment..."
if [ -f ".env.production" ]; then
    cp .env.production .env
    print_success "Environment variables configured"
else
    print_error ".env.production file not found!"
    exit 1
fi

# Step 2: Install Dependencies
print_status "Installing dependencies..."
bun install
print_success "Dependencies installed"

# Step 3: Generate Prisma client (skip DB connection)
print_status "Generating Prisma client..."
bunx prisma generate
print_success "Prisma client generated"

# Step 4: Build Application
print_status "Building application..."
bun run build

if [ $? -eq 0 ]; then
    print_success "Application built successfully"
else
    print_error "Build failed!"
    exit 1
fi

# Step 5: Deploy to Vercel
print_status "Deploying to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_status "Installing Vercel CLI..."
    bun install -g vercel
fi

# Login check
if ! vercel whoami &> /dev/null; then
    print_status "Please login to Vercel..."
    vercel login
fi

# Deploy to production
print_status "Deploying to production..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    print_success "Deployment successful!"
else
    print_error "Deployment failed!"
    exit 1
fi

# Step 6: Setup database remotely
print_status "Setting up database remotely..."

print_warning "Database will be setup through API endpoints..."

# Wait for deployment to be ready
sleep 15

# Try to setup database via API
echo ""
print_status "Attempting remote database setup..."

# Test health endpoint first
if curl -f -s "https://teereserve.golf/api/health" > /dev/null; then
    print_success "Site is responding!"

    # Try to seed database
    print_status "Seeding database via API..."
    curl -X POST "https://teereserve.golf/api/seed" \
      -H "Content-Type: application/json" \
      -w "HTTP Status: %{http_code}\n" || print_warning "Seeding will be done manually"

else
    print_warning "Site not yet responsive, database will be setup manually"
fi

# Final Success Message
echo ""
echo "🎉 =============================================="
print_success "TEERESERVE GOLF DEPLOYED!"
echo "=============================================="
echo ""
echo "🌐 Your website is live at:"
echo "   https://teereserve.golf"
echo ""
echo "⚠️  Database Setup:"
echo "   If seeding failed, you can setup the database by:"
echo "   1. Visit: https://teereserve.golf/api/seed"
echo "   2. Or run database setup from Vercel dashboard"
echo ""
echo "🔧 Next Steps:"
echo "   1. Test the site: https://teereserve.golf"
echo "   2. Setup database manually if needed"
echo "   3. Configure domain DNS if using custom domain"
echo ""
echo "📊 Admin Access:"
echo "   https://teereserve.golf/admin"
echo ""
print_success "TeeReserve Golf is live! 🏌️⛳"
echo "=============================================="
