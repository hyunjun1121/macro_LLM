#!/bin/bash

# Linux Server Setup Script WITHOUT SUDO (User-space installation)

echo "🐧 Setting up Linux Server Environment (No sudo required)"
echo "=================================================="

# Set up local directory structure
LOCAL_DIR="$HOME/local"
BIN_DIR="$LOCAL_DIR/bin"
LIB_DIR="$LOCAL_DIR/lib"

echo "📁 Creating local directories..."
mkdir -p "$LOCAL_DIR" "$BIN_DIR" "$LIB_DIR"

# Add to PATH if not already there
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo "export PATH=\"$BIN_DIR:\$PATH\"" >> ~/.bashrc
    export PATH="$BIN_DIR:$PATH"
    echo "✅ Added $BIN_DIR to PATH"
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Node.js (user-space via NodeSource binary)
if ! command_exists node || [[ "$(node --version | cut -d'.' -f1 | cut -d'v' -f2)" -lt "18" ]]; then
    echo "📦 Installing Node.js 20.x (user-space)..."

    # Detect architecture
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) NODE_ARCH="x64" ;;
        aarch64|arm64) NODE_ARCH="arm64" ;;
        *) echo "❌ Unsupported architecture: $ARCH"; exit 1 ;;
    esac

    NODE_VERSION="20.18.0"
    NODE_TARBALL="node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"
    NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/${NODE_TARBALL}"

    cd "$LOCAL_DIR"

    # Download Node.js
    if command_exists wget; then
        wget "$NODE_URL"
    elif command_exists curl; then
        curl -O "$NODE_URL"
    else
        echo "❌ Neither wget nor curl found. Please install Node.js manually."
        exit 1
    fi

    # Extract and setup Node.js
    tar -xf "$NODE_TARBALL"
    mv "node-v${NODE_VERSION}-linux-${NODE_ARCH}"/* .
    rm -rf "node-v${NODE_VERSION}-linux-${NODE_ARCH}" "$NODE_TARBALL"

    echo "✅ Node.js installed: $(node --version)"
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install Python packages (user-space)
echo "🐍 Installing Python packages (user-space)..."

# Check if pip3 exists
if command_exists pip3; then
    PIP_CMD="pip3"
elif command_exists pip; then
    PIP_CMD="pip"
else
    echo "❌ pip not found. Please install Python pip manually."
    exit 1
fi

# Install playwright (user-space)
echo "📦 Installing Playwright (user-space)..."
$PIP_CMD install --user playwright
$PIP_CMD install --user playwright[chromium]

# Add Python user bin to PATH
PYTHON_USER_BIN="$HOME/.local/bin"
if [[ ":$PATH:" != *":$PYTHON_USER_BIN:"* ]]; then
    echo "export PATH=\"$PYTHON_USER_BIN:\$PATH\"" >> ~/.bashrc
    export PATH="$PYTHON_USER_BIN:$PATH"
    echo "✅ Added Python user bin to PATH"
fi

# Install Playwright browsers (user-space)
echo "🎭 Installing Playwright browsers (user-space)..."
python3 -m playwright install chromium
python3 -m playwright install-deps chromium 2>/dev/null || echo "⚠️  Some system deps might be missing (this is normal without sudo)"

# Install project dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing project dependencies..."
    npm install
else
    echo "⚠️  package.json not found. Make sure you're in the project directory."
fi

# Setup virtual display (user-space alternative)
echo "🖥️  Setting up virtual display alternative..."

# Try to use existing display or create a minimal one
if [ -z "$DISPLAY" ]; then
    export DISPLAY=:0
    echo "export DISPLAY=:0" >> ~/.bashrc
fi

# Create benchmark results directory
mkdir -p benchmark_results/{data,reports}

# Set environment variables for server mode
echo "🔧 Setting up environment variables..."
if [ ! -f ".env" ]; then
    echo "SERVER_MODE=true" >> .env
    echo "HEADLESS=true" >> .env
    echo "DISPLAY=${DISPLAY:-:0}" >> .env
    echo "NODE_ENV=production" >> .env
    echo "✅ Created basic .env file"
else
    echo "✅ .env file already exists"
fi

# Create a simple system monitor script (tmux alternative for systems without it)
if ! command_exists tmux; then
    echo "📺 Creating simple process manager (tmux not available)..."
    cat > run_parallel.sh << 'EOF'
#!/bin/bash

# Simple parallel runner for systems without tmux

echo "🚀 Starting all models in background..."

MODELS=(
    "openai/gpt-4.1"
    "google/gemini-2.5-pro-thinking-on"
    "deepseek-ai/DeepSeek-V3.1-thinking-on"
    "openai/gpt-4o-mini"
)

PIDS=()

for model in "${MODELS[@]}"; do
    log_file="benchmark_${model//\//_}_$(date +%Y%m%d_%H%M%S).log"
    echo "🚀 Starting $model (log: $log_file)"

    nohup node run_server_benchmark.js "$model" resume > "$log_file" 2>&1 &
    PIDS+=($!)
    sleep 2
done

echo ""
echo "✅ All models started!"
echo "📊 PIDs: ${PIDS[*]}"
echo "📋 Monitor with: tail -f *.log"
echo "🛑 Stop all: kill ${PIDS[*]}"

# Save PIDs for easy management
echo "${PIDS[*]}" > .benchmark_pids

echo ""
echo "⏳ Waiting for completion... (Ctrl+C to detach)"
for pid in "${PIDS[@]}"; do
    wait $pid
    echo "✅ Process $pid completed"
done

echo "🎉 All benchmarks completed!"
EOF

    chmod +x run_parallel.sh
    echo "✅ Created run_parallel.sh (tmux alternative)"
fi

# Final setup
echo ""
echo "✅ User-space Server Setup Complete!"
echo "=================================================="
echo ""
echo "📋 What was installed:"
echo "   - Node.js: $(node --version 2>/dev/null || echo 'Not found')"
echo "   - NPM: $(npm --version 2>/dev/null || echo 'Not found')"
echo "   - Python: $(python3 --version 2>/dev/null || echo 'Not found')"
echo "   - Playwright: $(python3 -m playwright --version 2>/dev/null || echo 'Not found')"
echo ""
echo "🚀 Next steps:"
echo "   1. Source the updated PATH: source ~/.bashrc"
echo "   2. Setup API keys: ./setup_api.sh"
if command_exists tmux; then
    echo "   3. Run with tmux: ./tmux_benchmark.sh auto"
else
    echo "   3. Run in parallel: ./run_parallel.sh"
fi
echo ""
echo "📁 Project files ready in: $(pwd)"
echo "🔧 Environment: User-space installation (no sudo required)"