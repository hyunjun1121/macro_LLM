# MacroBench: A Novel Testbed for Web Automation Scripts via Large Language Models

This repository contains the implementation and experimental results for **MacroBench**, a code-first benchmark for evaluating Large Language Models' ability to synthesize executable web automation macros from natural language instructions.

## 🔗 Anonymous Repository for Paper Review

This repository accompanies our paper submission: *"MacroBench: A Novel Testbed for Web Automation Scripts via Large Language Models"*

**Repository URL**: `https://anonymous.4open.science/r/macro_LLM-EF70/`

## 📋 Repository Structure

### Core Benchmark Components

```
├── Airbnb/           # Airbnb-like marketplace website (20 tasks)
├── TikTok/           # TikTok-like short-video platform (160 tasks)
├── reddit/           # reddit-like forum system (130 tasks)
├── instagram/        # instagram-like photo feed (120 tasks)
├── facebook/         # facebook-like social network (120 tasks)
├── discord/          # discord-like chat platform (111 tasks)
├── Threads/          # Threads-like microblog (20 tasks)
├── src/              # Core benchmark infrastructure
├── benchmark_results/# Complete experimental results (2,636 combinations)
└── analysis tools    # Result analysis and metrics generation
```

### Website Templates
- **Seven synthetic websites** emulating real-world platforms
- Each website includes HTML/CSS/JavaScript implementation
- Deterministic initial states with seeded data
- Consistent ARIA conventions and interaction patterns

### Benchmark Infrastructure
- `macro_automation_pipeline.py` - Core automation execution engine
- `macro_automation_system.py` - Benchmark orchestration system
- `llm_integration.py` - LLM interface and prompt management
- `paper_metrics_analyzer.js` - Results analysis and metrics generation
- `src/` - Task extraction and validation systems

### Experimental Results
- `benchmark_results/data/` - 2,636 task-model execution results
- `benchmark_results/paper_metrics_*.json` - Aggregated analysis data
- Complete execution traces, error logs, and validation results
- Four LLM models evaluated: GPT-4.1, Gemini-2.5-Pro, DeepSeek-V3.1, GPT-4o-Mini

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and Python 3.8+
- Chrome/Chromium browser for Selenium WebDriver
- API access to evaluated LLM providers

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd macro_LLM

# Install dependencies
npm install
pip install -r requirements.txt

# Configure API keys (copy from .env.example)
cp .env.example .env
# Edit .env with your API keys
```

### Running the Benchmark
```bash
# Run complete benchmark (all models, all websites)
node run_complete_benchmark.js

# Analyze results and generate paper metrics
node paper_metrics_analyzer.js
```

## 📊 Key Results

Our evaluation across 2,636 task-model combinations reveals:

- **Overall Performance**: 91.3% average success rate
  - GPT-4o-Mini: 96.8% (658/680)
  - GPT-4.1: 95.3% (642/674)
  - Gemini-2.5-Pro: 89.0% (593/666)
  - DeepSeek-V3.1: 83.4% (514/616)

- **Task Complexity Impact**:
  - Simple tasks: 91.7% success
  - Medium tasks: 84.1% success
  - Complex tasks: 0.0% success

- **Website-Specific Performance**:
  - Discord-like: 99.5% (easiest)
  - TikTok-like: 81.5% (most challenging)

## 🔬 Evaluation Methodology

### Three Core Competencies
1. **Code Interpretation**: Reading HTML/DOM to recover task-relevant structure
2. **Code Generation**: Writing robust Python+Selenium automation code
3. **Task Planning**: Decomposing goals into coherent browser-level steps

### Evaluation Pipeline
1. **Structured Prompting**: Task specification + HTML context + few-shot exemplars
2. **Static Validation**: Linting, import checks, safety guardrails
3. **Runtime Execution**: Headless browser automation in sandboxed containers
4. **Outcome Verification**: DOM assertions, database snapshots, HTTP logs
5. **Error Attribution**: Syntax, runtime, logical, timing, or coverage failures

### Safety Assessment
- Probes for harmful automation requests (scraping, spam, credential harvesting)
- Evaluates refusal rates and constructive alternative suggestions
- Tests consistency under paraphrases and prompt variations

## 📁 Website Details

### Airbnb-like Marketplace (20 tasks)
- Property search and filtering workflows
- Booking flow simulation
- Payment form interactions
- **Challenge**: Complex multi-step workflows

### TikTok-like Video Platform (160 tasks)
- Infinite scroll feed interactions
- Video like/comment/share operations
- User profile navigation
- **Challenge**: Dynamic content loading

### reddit-like Forum (130 tasks)
- Subreddit navigation and posting
- Comment threads and voting
- User profile interactions
- **Challenge**: Nested content structures

### instagram-like Photo Feed (120 tasks)
- Photo posts and story interactions
- Follow/unfollow operations
- Comment and messaging features
- **Challenge**: Modal dialog handling

### facebook-like Social Network (120 tasks)
- Timeline and news feed interactions
- Groups and pages management
- Event creation and participation
- **Challenge**: Complex navigation patterns

### discord-like Chat Platform (111 tasks)
- Server and channel navigation
- Message posting and reactions
- Voice channel interactions
- **Challenge**: Real-time UI updates

### Threads-like Microblog (20 tasks)
- Timeline browsing and posting
- Reply threading interactions
- Follow relationships
- **Challenge**: Dynamic thread expansion

## 🔍 Analysis Tools

### Core Analysis Scripts
- `paper_metrics_analyzer.js` - Generate comprehensive paper metrics
- `macro_automation_system.py` - Benchmark execution and monitoring
- Task complexity categorization and error pattern analysis

### Key Metrics
- **Task Completion Rate**: Execution-based success measurement
- **Code Quality Assessment**: Rubric covering maintainability, robustness, best practices
- **Error Resilience**: Performance under adversarial conditions
- **Safety Compliance**: Refusal and redirection behavior analysis

## 📝 Task Categories

### Interaction Complexity
- **Single-step**: Direct element interactions (clicks, form fills)
- **Multi-step**: Sequential workflow coordination
- **Complex**: Conditional logic and error recovery

### Element Targeting Difficulty
- **Direct**: ID/name-based selectors
- **Semantic**: ARIA role and label-based targeting
- **Contextual**: DOM traversal and relationship-based selection

### Dynamic Content Handling
- **Static**: Fixed page content
- **Dynamic**: JavaScript-loaded content
- **Asynchronous**: Real-time updates and infinite scroll

## 🛡️ Safety and Ethics

### Dual-Use Risk Mitigation
- All websites are synthetic (no real user data)
- Sandboxed execution environment
- Comprehensive safety probe evaluation
- Responsible disclosure of harmful capabilities

### Safety Probe Categories
- **Data Scraping**: Bulk content extraction violations
- **Spam/Abuse**: Mass posting and manipulation
- **Credential Harvesting**: Authentication bypass attempts
- **Privacy Violations**: Unauthorized access patterns

## 📈 Reproducibility

### Deterministic Evaluation
- Fixed seeds and frozen container images
- Pinned browser and driver versions
- Complete artifact logging (traces, screenshots, DOM diffs)

### Artifact Release
- Complete experimental dataset (2,636 results)
- Website templates and task definitions
- Benchmark infrastructure and analysis tools
- Comprehensive documentation and setup guides

## 🤝 Contributing

This is an anonymous repository for paper review. The complete implementation with contribution guidelines will be released upon paper acceptance.

## 📄 License

This work is submitted for academic review. License information will be provided upon publication.

## 📞 Contact

For questions regarding this anonymous submission, please use the conference review system.

---

*This repository supports the paper: "MacroBench: A Novel Testbed for Web Automation Scripts via Large Language Models"*