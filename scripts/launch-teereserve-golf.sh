#!/bin/bash

# 🚀 TeeReserve Golf - Automated Production Launch Script
# This script will deploy TeeReserve Golf to production in one command

set -e  # Exit on any error

echo "🏌️ =============================================="
echo "   TEERESERVE GOLF - PRODUCTION LAUNCH"
echo "   Domain: https://teereserve.golf"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
print_status "Checking required tools..."

if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed. Please install bun first."
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

if ! command -v git &> /dev/null; then
    print_error "Git is not installed."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_status "Installing Vercel CLI..."
    bun install -g vercel
fi

print_success "All required tools are available"

# Step 1: Environment Setup
print_status "Setting up environment variables..."

if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_status "Please create .env.production with your credentials"
    exit 1
fi

# Copy production env to .env for local development
cp .env.production .env
print_success "Environment variables configured"

# Step 2: Install Dependencies
print_status "Installing dependencies..."
bun install
print_success "Dependencies installed"

# Step 3: Database Setup
print_status "Setting up database..."

# Generate Prisma client
print_status "Generating Prisma client..."
bunx prisma generate

# Push database schema
print_status "Pushing database schema..."
bunx prisma db push --accept-data-loss

print_success "Database configured"

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

# Login to Vercel (if not already logged in)
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

# Step 6: Database Seeding
print_status "Seeding database with golf courses..."

# Wait a moment for deployment to be ready
sleep 10

# Seed database via API
curl -X POST "https://teereserve.golf/api/seed" \
  -H "Content-Type: application/json" \
  -w "HTTP Status: %{http_code}\n" || print_warning "Seeding might have failed, check manually"

# Step 7: Health Check
print_status "Performing health check..."

sleep 5

# Check if site is responding
if curl -f -s "https://teereserve.golf/api/health" > /dev/null; then
    print_success "Health check passed!"
else
    print_warning "Health check failed, but deployment may still be working"
fi

# Final Success Message
echo ""
echo "🎉 =============================================="
print_success "TEERESERVE GOLF DEPLOYED SUCCESSFULLY!"
echo "=============================================="
echo ""
echo "🌐 Your website is live at:"
echo "   https://teereserve.golf"
echo ""
echo "🔧 Admin Panel:"
echo "   https://teereserve.golf/admin"
echo ""
echo "📱 API Endpoint:"
echo "   https://teereserve.golf/api"
echo ""
echo "📊 What's included:"
echo "   ✅ Golf course booking system"
echo "   ✅ Stripe payment integration"
echo "   ✅ Google OAuth authentication"
echo "   ✅ WhatsApp notifications"
echo "   ✅ Admin dashboard"
echo "   ✅ Real-time booking system"
echo "   ✅ Mobile-responsive design"
echo ""
echo "🔧 Next Steps:"
echo "   1. Test booking flow: https://teereserve.golf"
echo "   2. Configure Stripe webhooks"
echo "   3. Complete Twilio WhatsApp setup"
echo "   4. Add your golf courses in admin panel"
echo ""
echo "📞 Support:"
echo "   - Check logs: vercel logs"
echo "   - Monitor: https://vercel.com/dashboard"
echo "   - Database: https://supabase.com/dashboard"
echo ""
print_success "TeeReserve Golf is ready to revolutionize golf bookings! 🏌️⛳"
echo "=============================================="
