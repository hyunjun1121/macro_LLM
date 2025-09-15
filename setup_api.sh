#!/bin/bash

# API Configuration Setup Script

echo "🔧 LLM Benchmark API Configuration Setup"
echo "=================================================="

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    touch .env
else
    echo "📝 .env file already exists, backing up..."
    cp .env .env.backup
fi

# Function to update or add environment variable
update_env_var() {
    local key=$1
    local value=$2

    if grep -q "^${key}=" .env; then
        # Update existing variable
        sed -i "s|^${key}=.*|${key}=${value}|" .env
        echo "✅ Updated $key"
    else
        # Add new variable
        echo "${key}=${value}" >> .env
        echo "✅ Added $key"
    fi
}

echo ""
echo "🔑 Enter your API credentials:"

# Get API Key
read -p "API Key: " API_KEY
if [ -z "$API_KEY" ]; then
    echo "❌ API Key cannot be empty"
    exit 1
fi

# Get Base URL
read -p "Base URL (default: http://5.78.122.79:10000/v1/): " BASE_URL
if [ -z "$BASE_URL" ]; then
    BASE_URL="http://5.78.122.79:10000/v1/"
fi

# Server configuration
echo ""
echo "🖥️  Setting up server configuration..."
update_env_var "API_KEY" "$API_KEY"
update_env_var "BASE_URL" "$BASE_URL"
update_env_var "SERVER_MODE" "true"
update_env_var "HEADLESS" "true"
update_env_var "DISPLAY" ":99"
update_env_var "NODE_ENV" "production"

echo ""
echo "✅ API Configuration Complete!"
echo ""
echo "📋 Current configuration:"
echo "   API Key: $(echo $API_KEY | cut -c1-8)..."
echo "   Base URL: $BASE_URL"
echo "   Server Mode: Enabled"
echo "   Headless: Enabled"
echo ""
echo "🔒 Important: .env file contains sensitive information"
echo "   Make sure to keep it secure and don't commit to git"
echo ""

# Set proper permissions on .env file
chmod 600 .env
echo "🔒 Set secure permissions (600) on .env file"