#!/bin/bash

# Linux Server Setup Script for LLM Web Automation Benchmark

echo "🐧 Setting up Linux Server Environment for LLM Benchmark"
echo "=================================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  This script should not be run as root for security reasons"
   exit 1
fi

# Install Python and pip (required for some dependencies)
echo "🐍 Installing Python and pip..."
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y python3 python3-pip wget curl tmux htop
elif command -v yum &> /dev/null; then
    sudo yum update -y
    sudo yum install -y python3 python3-pip wget curl tmux htop
else
    echo "❌ Unsupported package manager. Please install manually."
    exit 1
fi

# Install playwright via pip (alternative method)
echo "📦 Installing Playwright via pip..."
pip3 install playwright
python3 -m playwright install

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
if command -v apt-get &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
elif command -v yum &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs
fi

# Verify Node.js installation
NODE_VERSION=$(node --version)
echo "✅ Node.js installed: $NODE_VERSION"

# Install system dependencies for Playwright
echo "📦 Installing Playwright system dependencies..."
if command -v apt-get &> /dev/null; then
    sudo apt-get install -y \
        libnss3 \
        libatk-bridge2.0-0 \
        libdrm2 \
        libxkbcommon0 \
        libgtk-3-0 \
        libgbm1 \
        libxss1 \
        libasound2 \
        libxtst6 \
        libatspi2.0-0 \
        libgtk-3-0 \
        libgdk-pixbuf2.0-0
elif command -v yum &> /dev/null; then
    sudo yum install -y \
        nss \
        atk \
        at-spi2-atk \
        gtk3 \
        libdrm \
        libxkbcommon \
        mesa-libgbm \
        alsa-lib
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install
npx playwright install-deps

# Set up Xvfb for headless display (optional, but recommended)
if command -v apt-get &> /dev/null; then
    sudo apt-get install -y xvfb
elif command -v yum &> /dev/null; then
    sudo yum install -y xorg-x11-server-Xvfb
fi

# Create benchmark results directory
mkdir -p benchmark_results/{data,reports,screenshots}

# Set environment variables for server mode
echo "🔧 Setting up environment variables..."
echo "SERVER_MODE=true" >> .env
echo "HEADLESS=true" >> .env
echo "DISPLAY=:99" >> .env

# Create systemd service for Xvfb (optional)
echo "🖥️  Setting up virtual display service..."
sudo tee /etc/systemd/system/xvfb.service > /dev/null << EOF
[Unit]
Description=Virtual Frame Buffer X Server
After=network.target

[Service]
Type=forking
User=root
ExecStart=/usr/bin/Xvfb :99 -screen 0 1280x720x24 -ac +extension GLX +render -noreset
Restart=on-failure
RestartSec=2

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable xvfb
sudo systemctl start xvfb

echo ""
echo "✅ Linux Server Setup Complete!"
echo "=================================================="
echo ""
echo "🚀 Ready to run benchmarks:"
echo "   Single model:       node run_server_benchmark.js \"openai/gpt-4.1\" resume"
echo "   Multi-process:      node run_server_multiprocess.js"
echo ""
echo "📊 Monitor with:"
echo "   htop                # System resources"
echo "   tail -f *.log       # Benchmark logs"
echo ""
echo "🔧 Environment:"
echo "   Node.js: $(node --version)"
echo "   NPM: $(npm --version)"
echo "   Display: $DISPLAY"
echo "   Server Mode: Enabled"