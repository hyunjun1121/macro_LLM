# MacroBench: A Code-First Benchmark for Web Automation

This repository contains the implementation and experimental results for **MacroBench**, a code-first benchmark that evaluates whether LLMs can synthesize reusable browser-automation programs (macros) from natural-language goals by reading HTML/DOM and emitting Selenium.

## 🔗 Anonymous Repository for Paper Review

This repository accompanies our paper submission for anonymous review.

**Repository URL**: `https://anonymous.4open.science/r/macro_LLM-EF70/`

## 📋 Repository Structure

### Core Benchmark Components

```
├── TikTok/           # TikTok-like short-video platform (129 tasks)
├── reddit/           # reddit-like forum system (149 tasks)
├── instagram/        # instagram-like photo feed (147 tasks)
├── facebook/         # facebook-like social network (138 tasks)
├── discord/          # discord-like chat platform (127 tasks)
├── Threads/          # Threads-like microblog (20 tasks)
├── src/              # Core benchmark infrastructure
├── python_src/       # Python execution environment
├── benchmark_results/# Complete experimental results (3,045 task-model combinations)
└── lib/              # JavaScript utilities
```

### Synthetic Website Ecosystem
- **Six synthetic websites** emulating real-world platforms
- **681 distinct automation tasks** across interaction complexity levels
- Each website includes HTML/CSS/JavaScript implementation
- Deterministic initial states with seeded data
- Consistent HTML/ARIA conventions and interaction patterns

### Benchmark Infrastructure
- `macro_automation_pipeline.py` - Core automation execution engine
- `python_src/macro_executor.py` - Macro execution environment
- `python_src/main.py` - Benchmark entry point
- `llm_integration.py` - LLM interface and prompt management
- `src/` - Task extraction and validation systems

### Experimental Results
- `benchmark_results/data/` - 3,045 clean task-model execution results
- `benchmark_results/paper_metrics_*.json` - Aggregated analysis data
- Complete execution traces, error logs, and validation results
- Four LLM models evaluated: GPT-4o-Mini, GPT-4.1, Gemini-2.5-Pro, DeepSeek-V3.1

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
pip install -r python_src/requirements.txt

# Configure API keys (copy from .env.example)
cp .env.example .env
# Edit .env with your API keys
```

### Running the Benchmark
```bash
# Run complete benchmark (all models, all websites)
python macro_automation_pipeline.py

# Analyze results
node lib/analyze_results.js
```

## 📊 Key Results

Our evaluation across **2,636 model-task combinations** spanning **681 unique tasks** reveals:

### Overall Performance (91.3% average success rate)
- **GPT-4o-Mini**: 96.8% (658/680 tasks)
- **GPT-4.1**: 95.3% (642/674 tasks)
- **Gemini-2.5-Pro**: 89.0% (593/666 tasks)
- **DeepSeek-V3.1**: 83.4% (514/616 tasks)

### Task Complexity Stratification
- **Simple tasks**: 91.7% success (2,370/2,584 runs)
- **Medium tasks**: 84.1% success (37/44 runs)
- **Complex tasks**: 0.0% success (0/8 runs)

### Website-Specific Performance
| Website | Tasks | Total Runs | Success Rate |
|---------|-------|------------|--------------|
| Discord-like | 127 | 508 | 99.5% |
| Facebook-like | 138 | 552 | 98.7% |
| Reddit-like | 149 | 593 | 94.2% |
| Threads-like | 20 | 80 | 90.0% |
| Instagram-like | 147 | 585 | 87.5% |
| TikTok-like | 129 | 727 | 81.5% |

## 🔬 Evaluation Methodology

### Three Core Competencies
1. **Code Interpretation**: Recover task-relevant structure from raw HTML (forms, inputs, buttons, links, and attributes such as id, class, name, role, labels, and hierarchy)
2. **Code Generation**: Emit correct, idiomatic Selenium with robust element location and interaction logic (waits, error handling, parameterization)
3. **Task Planning**: Decompose the goal into steps and control flow, drawing on reasoning+acting/tool-use strategies

### Evaluation Pipeline
1. **Structured Prompting**: Task specification + HTML context + technical constraints + few-shot exemplars
2. **Static Validation**: Linting, import validation, safety guardrails
3. **Runtime Execution**: Headless browser automation in sandboxed containers
4. **Outcome Verification**: DOM assertions, database snapshots, HTTP logs
5. **Error Attribution**: Syntax, runtime, logical, timing, or coverage failures

### Safety Assessment
- Probes for harmful automation requests (scraping, spam, credential harvesting, privacy violations)
- Evaluates refusal rates and "refuse-and-repair" behavior (proposing policy-compliant alternatives)
- Tests consistency under paraphrases and prompt variations

## 📁 Website Details

### TikTok-like Video Platform (129 tasks)
- Infinite scroll feed interactions
- Video like/comment/share operations
- User profile navigation
- **Challenge**: Dynamic content loading, infinite scroll handling

### reddit-like Forum (149 tasks)
- Subreddit navigation and posting
- Comment threads and voting
- User profile interactions
- **Challenge**: Nested content structures, complex thread navigation

### instagram-like Photo Feed (147 tasks)
- Photo posts and story interactions
- Follow/unfollow operations
- Comment and messaging features
- **Challenge**: Modal dialog handling, dynamic feed updates

### facebook-like Social Network (138 tasks)
- Timeline and news feed interactions
- Groups and pages management
- Event creation and participation
- **Challenge**: Complex navigation patterns, multi-step workflows

### discord-like Chat Platform (127 tasks)
- Server and channel navigation
- Message posting and reactions
- Role and permission management
- **Challenge**: Real-time UI updates, complex server hierarchies

### Threads-like Microblog (20 tasks)
- Timeline browsing and posting
- Reply threading interactions
- Follow relationships
- **Challenge**: Dynamic thread expansion, conversation threading

## 🔍 Key Findings

### Code Quality Gap
Despite high functional completion rates, **no model achieved production-quality code standards**. All generated macros lacked essential robustness features:
- Missing explicit wait strategies
- Absence of structured error handling
- Lack of code parameterization
- Poor maintainability structure

### Error Analysis
Among 229 failed attempts:
- DeepSeek-V3.1: 16.6% failure rate (102/616)
- GPT-4o-Mini: 3.2% failure rate (22/680)
- Most failures: Objective-mismatch (programs execute but don't meet outcome assertions)

### Safety Insights
- All models consistently refuse explicitly harmful requests
- GPT-4.1 and GPT-4o-Mini demonstrate superior "refuse-and-repair" behavior
- Ambiguous requests expose inconsistencies in safety boundaries

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

*This repository supports our paper submission on code-first web automation benchmark for Large Language Models.*