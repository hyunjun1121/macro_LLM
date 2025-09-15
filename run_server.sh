#!/bin/bash

# Linux Server Benchmark Runner

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐧 Linux Server LLM Benchmark Runner${NC}"
echo "=================================================="

# Check environment
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found. Please create one with API_KEY and BASE_URL${NC}"
    exit 1
fi

# Source environment variables
source .env

if [ -z "$API_KEY" ] || [ -z "$BASE_URL" ]; then
    echo -e "${RED}❌ Missing API_KEY or BASE_URL in .env file${NC}"
    exit 1
fi

# Ensure display is set
export DISPLAY=${DISPLAY:-:99}
export SERVER_MODE=true
export HEADLESS=true

# Check if Xvfb is running
if ! pgrep -x "Xvfb" > /dev/null; then
    echo -e "${YELLOW}⚠️  Starting virtual display (Xvfb)...${NC}"
    Xvfb :99 -screen 0 1280x720x24 -ac +extension GLX +render -noreset &
    XVFB_PID=$!
    sleep 2
else
    echo -e "${GREEN}✅ Virtual display already running${NC}"
fi

# Function to cleanup on exit
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    if [ ! -z "$XVFB_PID" ]; then
        kill $XVFB_PID 2>/dev/null || true
    fi
    # Kill any remaining node processes
    pkill -f "run_server" 2>/dev/null || true
}
trap cleanup EXIT

# Parse command line arguments
MODE=${1:-"single"}
MODEL=${2:-"openai/gpt-4.1"}
RESUME=${3:-"resume"}

case $MODE in
    "single")
        echo -e "${BLUE}🚀 Running single model benchmark${NC}"
        echo -e "   Model: ${GREEN}$MODEL${NC}"
        echo -e "   Resume: ${GREEN}$RESUME${NC}"
        echo ""

        LOG_FILE="benchmark_${MODEL//\//_}_$(date +%Y%m%d_%H%M%S).log"
        echo -e "📝 Logging to: ${YELLOW}$LOG_FILE${NC}"
        echo ""

        node run_server_benchmark.js "$MODEL" "$RESUME" 2>&1 | tee "$LOG_FILE"
        ;;

    "multi")
        echo -e "${BLUE}⚡ Running multi-process benchmark (32 processes)${NC}"
        echo -e "   Models: ${GREEN}All 4 target models${NC}"
        echo -e "   Processes: ${GREEN}32${NC}"
        echo ""

        LOG_FILE="benchmark_multiprocess_$(date +%Y%m%d_%H%M%S).log"
        echo -e "📝 Logging to: ${YELLOW}$LOG_FILE${NC}"
        echo ""

        node run_server_multiprocess.js 2>&1 | tee "$LOG_FILE"
        ;;

    "parallel")
        echo -e "${BLUE}🔄 Running all models in parallel (4 processes)${NC}"
        echo ""

        # Run all 4 models simultaneously in background
        MODELS=(
            "openai/gpt-4.1"
            "google/gemini-2.5-pro-thinking-on"
            "deepseek-ai/DeepSeek-V3.1-thinking-on"
            "openai/gpt-4o-mini"
        )

        PIDS=()

        for model in "${MODELS[@]}"; do
            log_file="benchmark_${model//\//_}_$(date +%Y%m%d_%H%M%S).log"
            echo -e "🚀 Starting ${GREEN}$model${NC} (log: $log_file)"

            nohup node run_server_benchmark.js "$model" resume > "$log_file" 2>&1 &
            PIDS+=($!)
        done

        echo ""
        echo -e "${YELLOW}📊 Monitoring progress...${NC}"
        echo -e "   PIDs: ${PIDS[*]}"
        echo -e "   Use 'tail -f *.log' to monitor individual models"
        echo ""

        # Wait for all processes to complete
        for pid in "${PIDS[@]}"; do
            wait $pid
            echo -e "✅ Process $pid completed"
        done

        echo -e "${GREEN}🎉 All models completed!${NC}"
        ;;

    *)
        echo -e "${RED}❌ Invalid mode: $MODE${NC}"
        echo ""
        echo "Usage: $0 <mode> [model] [resume]"
        echo ""
        echo "Modes:"
        echo -e "  ${GREEN}single${NC}   - Run single model (default)"
        echo -e "  ${GREEN}multi${NC}    - Run all models with 32-process multiprocessing"
        echo -e "  ${GREEN}parallel${NC} - Run all models in parallel (4 separate processes)"
        echo ""
        echo "Examples:"
        echo "  $0 single \"openai/gpt-4.1\" resume"
        echo "  $0 multi"
        echo "  $0 parallel"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✨ Benchmark completed successfully!${NC}"
echo -e "📈 Check benchmark_results/ directory for detailed reports"