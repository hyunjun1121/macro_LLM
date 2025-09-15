#!/bin/bash

# Tmux Session Manager for LLM Benchmarks

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

SESSION_NAME="llm_benchmark"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🖥️  LLM Benchmark Tmux Session Manager${NC}"
echo "=================================================="

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo -e "${RED}❌ tmux is not installed. Please install it first:${NC}"
    echo "   Ubuntu/Debian: sudo apt-get install tmux"
    echo "   CentOS/RHEL:   sudo yum install tmux"
    exit 1
fi

# Check if .env exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${RED}❌ .env file not found. Please run setup_api.sh first${NC}"
    exit 1
fi

# Function to create or attach to session
start_session() {
    if tmux has-session -t $SESSION_NAME 2>/dev/null; then
        echo -e "${YELLOW}📺 Session '$SESSION_NAME' already exists. Attaching...${NC}"
        tmux attach-session -t $SESSION_NAME
    else
        echo -e "${GREEN}🚀 Creating new tmux session: $SESSION_NAME${NC}"

        # Create session with first window
        tmux new-session -d -s $SESSION_NAME -x 120 -y 30

        # Window 0: Dashboard/Monitor
        tmux rename-window -t $SESSION_NAME:0 'dashboard'
        tmux send-keys -t $SESSION_NAME:0 "cd $SCRIPT_DIR" C-m
        tmux send-keys -t $SESSION_NAME:0 "echo '📊 LLM Benchmark Dashboard'" C-m
        tmux send-keys -t $SESSION_NAME:0 "echo 'Use: htop (system monitor), tail -f *.log (logs)'" C-m

        # Window 1: GPT-4.1
        tmux new-window -t $SESSION_NAME -n 'gpt4.1'
        tmux send-keys -t $SESSION_NAME:1 "cd $SCRIPT_DIR" C-m
        tmux send-keys -t $SESSION_NAME:1 "echo '🤖 GPT-4.1 Benchmark Ready'" C-m
        tmux send-keys -t $SESSION_NAME:1 "echo 'Run: node run_server_benchmark.js \"openai/gpt-4.1\" resume'" C-m

        # Window 2: Gemini
        tmux new-window -t $SESSION_NAME -n 'gemini'
        tmux send-keys -t $SESSION_NAME:2 "cd $SCRIPT_DIR" C-m
        tmux send-keys -t $SESSION_NAME:2 "echo '🧠 Gemini-2.5-Pro Benchmark Ready'" C-m
        tmux send-keys -t $SESSION_NAME:2 "echo 'Run: node run_server_benchmark.js \"google/gemini-2.5-pro-thinking-on\" resume'" C-m

        # Window 3: DeepSeek
        tmux new-window -t $SESSION_NAME -n 'deepseek'
        tmux send-keys -t $SESSION_NAME:3 "cd $SCRIPT_DIR" C-m
        tmux send-keys -t $SESSION_NAME:3 "echo '🤖 DeepSeek-V3.1 Benchmark Ready'" C-m
        tmux send-keys -t $SESSION_NAME:3 "echo 'Run: node run_server_benchmark.js \"deepseek-ai/DeepSeek-V3.1-thinking-on\" resume'" C-m

        # Window 4: GPT-4o-Mini
        tmux new-window -t $SESSION_NAME -n 'gpt4mini'
        tmux send-keys -t $SESSION_NAME:4 "cd $SCRIPT_DIR" C-m
        tmux send-keys -t $SESSION_NAME:4 "echo '💫 GPT-4o-Mini Benchmark Ready'" C-m
        tmux send-keys -t $SESSION_NAME:4 "echo 'Run: node run_server_benchmark.js \"openai/gpt-4o-mini\" resume'" C-m

        # Window 5: Multi-Process
        tmux new-window -t $SESSION_NAME -n 'multiproc'
        tmux send-keys -t $SESSION_NAME:5 "cd $SCRIPT_DIR" C-m
        tmux send-keys -t $SESSION_NAME:5 "echo '⚡ Multi-Process Benchmark Ready (32 processes)'" C-m
        tmux send-keys -t $SESSION_NAME:5 "echo 'Run: node run_server_multiprocess.js'" C-m

        # Window 6: Logs Monitor
        tmux new-window -t $SESSION_NAME -n 'logs'
        tmux send-keys -t $SESSION_NAME:6 "cd $SCRIPT_DIR" C-m
        tmux send-keys -t $SESSION_NAME:6 "echo '📋 Log Monitor'" C-m
        tmux send-keys -t $SESSION_NAME:6 "echo 'Available log commands:'" C-m
        tmux send-keys -t $SESSION_NAME:6 "echo '  tail -f *.log              # Follow all logs'" C-m
        tmux send-keys -t $SESSION_NAME:6 "echo '  ls -la benchmark_results/  # Check results'" C-m
        tmux send-keys -t $SESSION_NAME:6 "echo '  htop                       # System monitor'" C-m

        # Go back to dashboard
        tmux select-window -t $SESSION_NAME:0

        echo ""
        echo -e "${GREEN}✅ Tmux session created successfully!${NC}"
        echo ""
        echo -e "${BLUE}📺 Windows created:${NC}"
        echo -e "   0: ${YELLOW}dashboard${NC}  - Main dashboard and system monitoring"
        echo -e "   1: ${YELLOW}gpt4.1${NC}     - GPT-4.1 model benchmark"
        echo -e "   2: ${YELLOW}gemini${NC}     - Gemini-2.5-Pro-Thinking model"
        echo -e "   3: ${YELLOW}deepseek${NC}   - DeepSeek-V3.1-Thinking model"
        echo -e "   4: ${YELLOW}gpt4mini${NC}   - GPT-4o-Mini model"
        echo -e "   5: ${YELLOW}multiproc${NC}  - Multi-process benchmark (32 workers)"
        echo -e "   6: ${YELLOW}logs${NC}       - Log monitoring and results"
        echo ""
        echo -e "${PURPLE}🔧 Tmux controls:${NC}"
        echo -e "   Ctrl+B then 0-6    : Switch between windows"
        echo -e "   Ctrl+B then d       : Detach from session"
        echo -e "   Ctrl+B then [       : Scroll mode (q to exit)"
        echo -e "   Ctrl+B then c       : Create new window"
        echo -e "   exit                : Exit current window"
        echo ""

        # Attach to session
        tmux attach-session -t $SESSION_NAME
    fi
}

# Function to kill session
kill_session() {
    if tmux has-session -t $SESSION_NAME 2>/dev/null; then
        echo -e "${YELLOW}🛑 Killing session '$SESSION_NAME'...${NC}"
        tmux kill-session -t $SESSION_NAME
        echo -e "${GREEN}✅ Session killed${NC}"
    else
        echo -e "${RED}❌ Session '$SESSION_NAME' not found${NC}"
    fi
}

# Function to list active sessions
list_sessions() {
    echo -e "${BLUE}📺 Active tmux sessions:${NC}"
    tmux list-sessions 2>/dev/null || echo "No active sessions"
}

# Function to run all models automatically
auto_run() {
    echo -e "${GREEN}🚀 Starting all models automatically in tmux session...${NC}"

    if ! tmux has-session -t $SESSION_NAME 2>/dev/null; then
        echo -e "${RED}❌ Session not found. Creating session first...${NC}"
        start_session
        sleep 2
        tmux detach-client -s $SESSION_NAME
    fi

    # Run each model in its respective window
    MODELS=(
        "openai/gpt-4.1"
        "google/gemini-2.5-pro-thinking-on"
        "deepseek-ai/DeepSeek-V3.1-thinking-on"
        "openai/gpt-4o-mini"
    )

    for i in "${!MODELS[@]}"; do
        window_id=$((i + 1))
        model="${MODELS[$i]}"
        log_file="benchmark_${model//\//_}_$(date +%Y%m%d_%H%M%S).log"

        echo -e "🚀 Starting ${GREEN}$model${NC} in window $window_id"
        tmux send-keys -t $SESSION_NAME:$window_id "node run_server_benchmark.js \"$model\" resume 2>&1 | tee $log_file" C-m
        sleep 2
    done

    echo ""
    echo -e "${GREEN}✅ All models started!${NC}"
    echo -e "📺 Use: ${YELLOW}tmux attach -t $SESSION_NAME${NC} to monitor"
}

# Parse command line arguments
case "${1:-start}" in
    "start")
        start_session
        ;;
    "kill")
        kill_session
        ;;
    "list")
        list_sessions
        ;;
    "auto")
        auto_run
        ;;
    *)
        echo "Usage: $0 {start|kill|list|auto}"
        echo ""
        echo "Commands:"
        echo "  start  - Create and attach to tmux session (default)"
        echo "  kill   - Kill the benchmark session"
        echo "  list   - List all active tmux sessions"
        echo "  auto   - Automatically start all models in background"
        echo ""
        echo "Examples:"
        echo "  $0 start    # Start interactive session"
        echo "  $0 auto     # Run all models automatically"
        echo "  $0 list     # Check what's running"
        echo "  $0 kill     # Stop everything"
        exit 1
        ;;
esac