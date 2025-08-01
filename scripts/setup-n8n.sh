#!/bin/bash

# TeeReserve Golf - N8N Setup Script
# This script sets up n8n automation platform for TeeReserve Golf

set -e

echo "🤖 Setting up N8N for TeeReserve Golf..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p n8n/workflows
mkdir -p n8n/credentials
mkdir -p n8n/data

# Set proper permissions
echo "🔐 Setting permissions..."
chmod 755 n8n/workflows
chmod 755 n8n/credentials
chmod 755 n8n/data

# Copy environment variables
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it first."
    exit 1
fi

# Add N8N specific environment variables to .env if not present
if ! grep -q "N8N_WEBHOOK_URL" .env; then
    echo "" >> .env
    echo "# N8N Configuration" >> .env
    echo "N8N_WEBHOOK_URL=http://localhost:5678" >> .env
    echo "N8N_BASIC_AUTH_USER=admin" >> .env
    echo "N8N_BASIC_AUTH_PASSWORD=TeeReserve2025!" >> .env
fi

# Start N8N with Docker Compose
echo "🚀 Starting N8N..."
docker-compose -f docker-compose.n8n.yml up -d

# Wait for N8N to be ready
echo "⏳ Waiting for N8N to be ready..."
sleep 30

# Check if N8N is running
if curl -f http://localhost:5678 > /dev/null 2>&1; then
    echo "✅ N8N is running successfully!"
    echo ""
    echo "🌐 Access N8N at: http://localhost:5678"
    echo "👤 Username: admin"
    echo "🔑 Password: TeeReserve2025!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Access N8N web interface"
    echo "2. Import the workflow files from n8n/workflows/"
    echo "3. Configure credentials for Resend, Twilio, etc."
    echo "4. Activate the workflows"
    echo ""
    echo "🔗 Webhook URLs:"
    echo "• New User: http://localhost:5678/webhook/new-user"
    echo "• Reservation Reminder: http://localhost:5678/webhook/reservation-reminder"
    echo "• Abandoned Reservation: http://localhost:5678/webhook/abandoned-reservation"
    echo "• VIP User: http://localhost:5678/webhook/vip-user"
else
    echo "❌ N8N failed to start. Check the logs:"
    docker-compose -f docker-compose.n8n.yml logs
    exit 1
fi

echo ""
echo "🎉 N8N setup completed successfully!"
echo "📚 Check the documentation in IMPLEMENTACION_N8N.md for detailed usage instructions."

