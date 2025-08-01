#!/bin/bash

# 🔍 TeeReserve Golf - Database Connection Test
# Test database connection before deployment

set -e

echo "🔍 =============================================="
echo "   TEERESERVE GOLF - DATABASE CONNECTION TEST"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Step 1: Load environment variables
print_status "Loading environment variables..."
if [ -f ".env.production" ]; then
    cp .env.production .env
    print_success "Environment variables loaded from .env.production"
else
    print_error ".env.production file not found!"
    exit 1
fi

# Step 2: Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    bun install
fi

# Step 3: Generate Prisma client
print_status "Generating Prisma client..."
bunx prisma generate

# Step 4: Test basic connection
print_status "Testing database connection..."

# Create a simple test script
cat > test-connection.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
    const prisma = new PrismaClient();

    try {
        // Test basic connection
        await prisma.$connect();
        console.log('✅ Database connection successful!');

        // Test a simple query
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Database query test successful!');

        await prisma.$disconnect();
        console.log('✅ Database disconnection successful!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);

        if (error.message.includes('P1001')) {
            console.error('💡 This seems to be a connection issue. Please check:');
            console.error('   1. Your internet connection');
            console.error('   2. Supabase database is running');
            console.error('   3. Database URL in .env.production');
            console.error('   4. Firewall settings');
        }

        await prisma.$disconnect();
        process.exit(1);
    }
}

testConnection();
EOF

# Run the test
node test-connection.js

if [ $? -eq 0 ]; then
    print_success "Database connection test passed!"

    echo ""
    echo "🎉 =============================================="
    print_success "DATABASE CONNECTION SUCCESSFUL!"
    echo "=============================================="
    echo ""
    echo "✅ Your database is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "   1. Run: ./scripts/launch-teereserve-golf.sh"
    echo "   2. Or continue with manual deployment"
    echo ""

    # Clean up test file
    rm -f test-connection.js
else
    print_error "Database connection test failed!"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo ""
    echo "1. Check your .env.production file:"
    echo "   - DATABASE_URL should use connection pooling"
    echo "   - DIRECT_URL should be the direct connection"
    echo ""
    echo "2. Verify Supabase is running:"
    echo "   - Go to https://supabase.com/dashboard"
    echo "   - Check your project status"
    echo ""
    echo "3. Test internet connection"
    echo ""
    echo "4. Try alternative connection:"
    echo "   - Use DIRECT_URL temporarily"
    echo "   - Check firewall settings"
    echo ""

    # Clean up test file
    rm -f test-connection.js
    exit 1
fi
