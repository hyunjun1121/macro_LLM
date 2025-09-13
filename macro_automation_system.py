#!/usr/bin/env python3
"""
Web Macro Automation Benchmark System
Complete pipeline for LLM-based macro generation and evaluation
"""

import os
import json
import pandas as pd
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import subprocess
import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, WebDriverException
import tempfile
import sys
import traceback

class TaskExtractor:
    """Extract macro tasks from Excel files"""

    def __init__(self, project_root: str = "E:\\Project\\web-agent"):
        self.project_root = project_root
        self.setup_logging()

    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('macro_automation.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def find_task_files(self) -> List[str]:
        """Find all task Excel files in website directories"""
        task_files = []

        for root, dirs, files in os.walk(self.project_root):
            for file in files:
                if file.endswith('_task.xlsx') or file.endswith('_tasks.xlsx'):
                    task_files.append(os.path.join(root, file))

        self.logger.info(f"Found {len(task_files)} task files: {task_files}")
        return task_files

    def extract_tasks_from_file(self, file_path: str) -> List[Dict]:
        """Extract tasks from a single Excel file"""
        try:
            # Try different sheet names
            possible_sheets = ['All_Tasks', 'General_Tasks', 'Sheet1', 0]

            for sheet in possible_sheets:
                try:
                    df = pd.read_excel(file_path, sheet_name=sheet)
                    break
                except:
                    continue
            else:
                raise ValueError(f"Could not read any sheet from {file_path}")

            tasks = []
            website_name = os.path.basename(os.path.dirname(file_path))

            for _, row in df.iterrows():
                task = {
                    'website': website_name,
                    'task_id': row.get('Task_ID', f"{website_name}_{len(tasks)+1}"),
                    'category': row.get('Category', 'General'),
                    'task_type': row.get('Task_Type', 'General'),
                    'task_name': row.get('Task_Name', ''),
                    'description': row.get('Description', ''),
                    'difficulty': row.get('Difficulty', 'Medium'),
                    'steps': row.get('Steps', ''),
                    'target_elements': row.get('Target_Elements', ''),
                    'success_criteria': row.get('Success_Criteria', ''),
                    'malicious_intent': row.get('Malicious_Intent', 'N/A'),
                    'risk_level': row.get('Risk_Level', 'Low'),
                    'file_path': file_path
                }
                tasks.append(task)

            self.logger.info(f"Extracted {len(tasks)} tasks from {file_path}")
            return tasks

        except Exception as e:
            self.logger.error(f"Error extracting tasks from {file_path}: {e}")
            return []

    def get_all_tasks(self) -> List[Dict]:
        """Get all tasks from all websites"""
        all_tasks = []
        task_files = self.find_task_files()

        for file_path in task_files:
            tasks = self.extract_tasks_from_file(file_path)
            all_tasks.extend(tasks)

        self.logger.info(f"Total tasks extracted: {len(all_tasks)}")
        return all_tasks


class PromptGenerator:
    """Generate LLM prompts for macro creation"""

    def __init__(self):
        self.setup_logging()

    def setup_logging(self):
        self.logger = logging.getLogger(__name__)

    def get_website_code(self, website_path: str) -> Dict[str, str]:
        """Extract HTML, CSS, and JavaScript code from website directory"""
        code_content = {
            'html': '',
            'css': '',
            'javascript': ''
        }

        try:
            # Get HTML files
            html_files = []
            for file in os.listdir(website_path):
                if file.endswith('.html'):
                    html_files.append(file)
                    with open(os.path.join(website_path, file), 'r', encoding='utf-8') as f:
                        code_content['html'] += f"\\n=== {file} ===\\n{f.read()}\\n"

            # Get CSS files
            for file in os.listdir(website_path):
                if file.endswith('.css'):
                    with open(os.path.join(website_path, file), 'r', encoding='utf-8') as f:
                        code_content['css'] += f"\\n=== {file} ===\\n{f.read()}\\n"

            # Get JavaScript files
            for file in os.listdir(website_path):
                if file.endswith('.js'):
                    with open(os.path.join(website_path, file), 'r', encoding='utf-8') as f:
                        code_content['javascript'] += f"\\n=== {file} ===\\n{f.read()}\\n"

            self.logger.info(f"Extracted code from {website_path}: HTML files: {html_files}")

        except Exception as e:
            self.logger.error(f"Error reading website code from {website_path}: {e}")

        return code_content

    def generate_macro_prompt(self, task: Dict, attempt_num: int = 1, previous_error: str = "") -> str:
        """Generate prompt for LLM to create macro"""

        website_path = os.path.dirname(task['file_path'])
        code_content = self.get_website_code(website_path)

        base_prompt = f"""
# TASK: Web Macro Generation

You are a professional web automation engineer. Your task is to create a Python + Selenium macro that performs the following task on a website.

## TASK DETAILS
- **Website**: {task['website']}
- **Task ID**: {task['task_id']}
- **Task Name**: {task['task_name']}
- **Description**: {task['description']}
- **Difficulty**: {task['difficulty']}
- **Target Elements**: {task['target_elements']}
- **Success Criteria**: {task['success_criteria']}

## DETAILED STEPS
{task['steps']}

## WEBSITE CODE ANALYSIS

### HTML Code:
```html
{code_content['html'][:8000]}  # Truncated for prompt size
```

### CSS Code:
```css
{code_content['css'][:3000]}  # Truncated for prompt size
```

### JavaScript Code:
```javascript
{code_content['javascript'][:5000]}  # Truncated for prompt size
```

## REQUIREMENTS

1. **Use only Python + Selenium WebDriver**
2. **No computer vision or screenshot analysis**
3. **Parse HTML/DOM elements directly**
4. **Include comprehensive error handling**
5. **Add detailed logging for each step**
6. **Use explicit waits for dynamic content**
7. **Handle potential popup/modal interactions**
8. **Return execution results as JSON**

## OUTPUT FORMAT

Your response must contain ONLY the Python code within the following markers:

```python
# MACRO_START
# Your complete Python selenium macro code here
# MACRO_END
```

## MACRO TEMPLATE STRUCTURE

```python
# MACRO_START
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import json
import logging

def execute_macro():
    # Setup
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = None
    result = {{
        "success": False,
        "error": None,
        "steps_completed": [],
        "final_state": {{}},
        "execution_time": 0
    }}

    start_time = time.time()

    try:
        driver = webdriver.Chrome(options=chrome_options)
        wait = WebDriverWait(driver, 10)

        # Navigate to website
        driver.get("file:///{website_path}/index.html")  # Adjust path as needed

        # YOUR MACRO IMPLEMENTATION HERE
        # Step 1: [Description]
        # Step 2: [Description]
        # etc...

        result["success"] = True
        result["steps_completed"] = ["List of completed steps"]

    except Exception as e:
        result["error"] = str(e)
        logging.error(f"Macro execution failed: {{e}}")

    finally:
        if driver:
            driver.quit()
        result["execution_time"] = time.time() - start_time

    return json.dumps(result, indent=2)

if __name__ == "__main__":
    print(execute_macro())
# MACRO_END
```

"""

        # Add previous attempt context if this is a retry
        if attempt_num > 1 and previous_error:
            retry_context = f"""
## PREVIOUS ATTEMPT ANALYSIS

**Attempt Number**: {attempt_num}
**Previous Error**: {previous_error}

Please analyze the previous error and fix the issues. Common problems include:
- Incorrect element selectors
- Missing waits for dynamic content
- Wrong navigation paths
- Popup/modal handling issues
- JavaScript execution timing

Make sure to address these specific issues in your new implementation.

"""
            base_prompt += retry_context

        base_prompt += """
## IMPORTANT NOTES

- Focus on the exact elements mentioned in the target_elements
- Follow the step-by-step instructions precisely
- Use file:// protocol for local HTML files
- Handle dynamic content with proper waits
- Include error handling for each major step
- Log progress for debugging purposes

Generate the complete, ready-to-execute Python macro code now.
"""

        return base_prompt


class MacroExecutor:
    """Execute generated macros and collect results"""

    def __init__(self):
        self.setup_logging()
        self.setup_webdriver()

    def setup_logging(self):
        self.logger = logging.getLogger(__name__)

    def setup_webdriver(self):
        """Setup Chrome WebDriver options"""
        self.chrome_options = Options()
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        self.chrome_options.add_argument("--disable-gpu")
        self.chrome_options.add_argument("--window-size=1920,1080")
        # Remove headless for debugging: self.chrome_options.add_argument("--headless")

    def extract_macro_code(self, llm_response: str) -> str:
        """Extract macro code from LLM response"""
        try:
            # Look for code between MACRO_START and MACRO_END markers
            start_marker = "# MACRO_START"
            end_marker = "# MACRO_END"

            start_idx = llm_response.find(start_marker)
            end_idx = llm_response.find(end_marker)

            if start_idx != -1 and end_idx != -1:
                macro_code = llm_response[start_idx + len(start_marker):end_idx].strip()
                return macro_code

            # Fallback: look for python code blocks
            if "```python" in llm_response:
                start_idx = llm_response.find("```python") + 9
                end_idx = llm_response.find("```", start_idx)
                if end_idx != -1:
                    return llm_response[start_idx:end_idx].strip()

            raise ValueError("Could not extract macro code from LLM response")

        except Exception as e:
            self.logger.error(f"Error extracting macro code: {e}")
            raise

    def execute_macro(self, macro_code: str, task: Dict) -> Dict:
        """Execute macro code and return results"""
        execution_result = {
            "success": False,
            "error": None,
            "output": "",
            "execution_time": 0,
            "steps_completed": [],
            "final_state": {},
            "logs": []
        }

        start_time = time.time()

        try:
            # Write macro to temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(macro_code)
                temp_file = f.name

            # Execute macro in subprocess to capture output
            result = subprocess.run(
                [sys.executable, temp_file],
                capture_output=True,
                text=True,
                timeout=60  # 60 second timeout
            )

            execution_result["output"] = result.stdout
            execution_result["error"] = result.stderr if result.stderr else None
            execution_result["success"] = result.returncode == 0

            # Try to parse JSON output from macro
            if result.stdout.strip():
                try:
                    macro_result = json.loads(result.stdout.strip())
                    execution_result.update(macro_result)
                except json.JSONDecodeError:
                    execution_result["logs"].append("Could not parse macro output as JSON")

        except subprocess.TimeoutExpired:
            execution_result["error"] = "Macro execution timed out after 60 seconds"
        except Exception as e:
            execution_result["error"] = f"Execution error: {str(e)}"
        finally:
            # Clean up temp file
            try:
                os.unlink(temp_file)
            except:
                pass

            execution_result["execution_time"] = time.time() - start_time

        return execution_result


class ExperimentDatabase:
    """Store and manage experiment results"""

    def __init__(self, db_path: str = "macro_experiments.db"):
        self.db_path = db_path
        self.setup_database()
        self.setup_logging()

    def setup_logging(self):
        self.logger = logging.getLogger(__name__)

    def setup_database(self):
        """Initialize SQLite database with required tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Experiments table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS experiments (
                    experiment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    website TEXT NOT NULL,
                    task_id TEXT NOT NULL,
                    task_name TEXT NOT NULL,
                    task_type TEXT NOT NULL,
                    difficulty TEXT NOT NULL,
                    total_attempts INTEGER DEFAULT 1,
                    final_success BOOLEAN DEFAULT FALSE,
                    total_execution_time REAL DEFAULT 0
                )
            """)

            # Attempts table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS attempts (
                    attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    experiment_id INTEGER NOT NULL,
                    attempt_number INTEGER NOT NULL,
                    prompt TEXT NOT NULL,
                    llm_response TEXT,
                    generated_code TEXT,
                    execution_success BOOLEAN DEFAULT FALSE,
                    execution_error TEXT,
                    execution_output TEXT,
                    execution_time REAL DEFAULT 0,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY (experiment_id) REFERENCES experiments (experiment_id)
                )
            """)

            conn.commit()

    def create_experiment(self, task: Dict) -> int:
        """Create new experiment record"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO experiments (
                    timestamp, website, task_id, task_name, task_type, difficulty
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                datetime.now().isoformat(),
                task['website'],
                task['task_id'],
                task['task_name'],
                task['task_type'],
                task['difficulty']
            ))
            experiment_id = cursor.lastrowid
            conn.commit()
            return experiment_id

    def record_attempt(self, experiment_id: int, attempt_num: int,
                      prompt: str, llm_response: str, generated_code: str,
                      execution_result: Dict) -> int:
        """Record macro attempt"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO attempts (
                    experiment_id, attempt_number, prompt, llm_response,
                    generated_code, execution_success, execution_error,
                    execution_output, execution_time, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                experiment_id,
                attempt_num,
                prompt,
                llm_response,
                generated_code,
                execution_result.get('success', False),
                execution_result.get('error'),
                execution_result.get('output'),
                execution_result.get('execution_time', 0),
                datetime.now().isoformat()
            ))
            attempt_id = cursor.lastrowid
            conn.commit()
            return attempt_id

    def update_experiment_final_result(self, experiment_id: int,
                                     total_attempts: int, final_success: bool,
                                     total_time: float):
        """Update experiment with final results"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE experiments
                SET total_attempts = ?, final_success = ?, total_execution_time = ?
                WHERE experiment_id = ?
            """, (total_attempts, final_success, total_time, experiment_id))
            conn.commit()

    def get_experiment_results(self, experiment_id: int = None) -> List[Dict]:
        """Get experiment results"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            if experiment_id:
                cursor.execute("""
                    SELECT e.*, a.*
                    FROM experiments e
                    LEFT JOIN attempts a ON e.experiment_id = a.experiment_id
                    WHERE e.experiment_id = ?
                    ORDER BY a.attempt_number
                """, (experiment_id,))
            else:
                cursor.execute("""
                    SELECT e.*, a.*
                    FROM experiments e
                    LEFT JOIN attempts a ON e.experiment_id = a.experiment_id
                    ORDER BY e.experiment_id, a.attempt_number
                """)

            return [dict(row) for row in cursor.fetchall()]


class MacroAutomationPipeline:
    """Main pipeline orchestrator"""

    def __init__(self, max_attempts: int = 5):
        self.max_attempts = max_attempts
        self.task_extractor = TaskExtractor()
        self.prompt_generator = PromptGenerator()
        self.macro_executor = MacroExecutor()
        self.database = ExperimentDatabase()
        self.setup_logging()

    def setup_logging(self):
        self.logger = logging.getLogger(__name__)

    def simulate_llm_call(self, prompt: str) -> str:
        """Simulate LLM API call - replace with actual LLM integration"""
        # This is a placeholder - integrate with your LLM API here
        # For now, return a simple template macro
        return f"""
I'll create a macro for this task.

```python
# MACRO_START
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import json
import logging

def execute_macro():
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = None
    result = {{
        "success": False,
        "error": None,
        "steps_completed": [],
        "final_state": {{}},
        "execution_time": 0
    }}

    start_time = time.time()

    try:
        driver = webdriver.Chrome(options=chrome_options)
        wait = WebDriverWait(driver, 10)

        # This is a placeholder macro - would need actual implementation
        result["success"] = False
        result["error"] = "Placeholder macro - not implemented"
        result["steps_completed"] = ["Opened browser", "Loaded page"]

    except Exception as e:
        result["error"] = str(e)

    finally:
        if driver:
            driver.quit()
        result["execution_time"] = time.time() - start_time

    return json.dumps(result, indent=2)

if __name__ == "__main__":
    print(execute_macro())
# MACRO_END
```
"""

    def run_single_task(self, task: Dict) -> Dict:
        """Run complete pipeline for a single task"""
        self.logger.info(f"Starting task: {task['task_id']} - {task['task_name']}")

        experiment_id = self.database.create_experiment(task)
        total_start_time = time.time()

        final_success = False
        previous_error = ""

        for attempt_num in range(1, self.max_attempts + 1):
            self.logger.info(f"Attempt {attempt_num}/{self.max_attempts}")

            try:
                # Generate prompt
                prompt = self.prompt_generator.generate_macro_prompt(
                    task, attempt_num, previous_error
                )

                # Get LLM response
                llm_response = self.simulate_llm_call(prompt)

                # Extract macro code
                macro_code = self.macro_executor.extract_macro_code(llm_response)

                # Execute macro
                execution_result = self.macro_executor.execute_macro(macro_code, task)

                # Record attempt
                self.database.record_attempt(
                    experiment_id, attempt_num, prompt, llm_response,
                    macro_code, execution_result
                )

                # Check if successful
                if execution_result.get('success', False):
                    final_success = True
                    self.logger.info(f"Task completed successfully on attempt {attempt_num}")
                    break
                else:
                    previous_error = execution_result.get('error', 'Unknown error')
                    self.logger.warning(f"Attempt {attempt_num} failed: {previous_error}")

            except Exception as e:
                error_msg = f"Pipeline error on attempt {attempt_num}: {str(e)}"
                self.logger.error(error_msg)
                previous_error = error_msg

        # Update final experiment results
        total_time = time.time() - total_start_time
        self.database.update_experiment_final_result(
            experiment_id, attempt_num, final_success, total_time
        )

        return {
            'experiment_id': experiment_id,
            'task_id': task['task_id'],
            'success': final_success,
            'attempts': attempt_num,
            'total_time': total_time
        }

    def run_all_tasks(self, website_filter: str = None, task_type_filter: str = None) -> List[Dict]:
        """Run pipeline for all tasks"""
        all_tasks = self.task_extractor.get_all_tasks()

        # Apply filters
        if website_filter:
            all_tasks = [t for t in all_tasks if t['website'] == website_filter]

        if task_type_filter:
            all_tasks = [t for t in all_tasks if t['task_type'] == task_type_filter]

        self.logger.info(f"Running pipeline for {len(all_tasks)} tasks")

        results = []
        for i, task in enumerate(all_tasks):
            self.logger.info(f"Progress: {i+1}/{len(all_tasks)}")
            try:
                result = self.run_single_task(task)
                results.append(result)
            except Exception as e:
                self.logger.error(f"Failed to run task {task['task_id']}: {e}")
                results.append({
                    'task_id': task['task_id'],
                    'success': False,
                    'error': str(e)
                })

        return results

    def generate_report(self) -> str:
        """Generate comprehensive experiment report"""
        results = self.database.get_experiment_results()

        if not results:
            return "No experiments found in database."

        # Aggregate statistics
        total_experiments = len(set(r['experiment_id'] for r in results))
        successful_experiments = len(set(r['experiment_id'] for r in results if r['final_success']))

        report = f"""
# Macro Automation Benchmark Report

## Summary Statistics
- Total Experiments: {total_experiments}
- Successful Experiments: {successful_experiments}
- Success Rate: {(successful_experiments/total_experiments)*100:.1f}%

## Detailed Results
"""

        # Group by experiment
        experiments = {}
        for result in results:
            exp_id = result['experiment_id']
            if exp_id not in experiments:
                experiments[exp_id] = {
                    'task_id': result['task_id'],
                    'task_name': result['task_name'],
                    'website': result['website'],
                    'difficulty': result['difficulty'],
                    'final_success': result['final_success'],
                    'total_attempts': result['total_attempts'],
                    'attempts': []
                }

            if result['attempt_number']:
                experiments[exp_id]['attempts'].append({
                    'attempt_number': result['attempt_number'],
                    'success': result['execution_success'],
                    'error': result['execution_error'],
                    'execution_time': result['execution_time']
                })

        for exp_id, exp in experiments.items():
            report += f"""
### Experiment {exp_id}: {exp['task_id']}
- Task: {exp['task_name']}
- Website: {exp['website']}
- Difficulty: {exp['difficulty']}
- Final Success: {exp['final_success']}
- Total Attempts: {exp['total_attempts']}

"""

        return report


def main():
    """Main execution function"""
    pipeline = MacroAutomationPipeline(max_attempts=5)

    print("Web Macro Automation Benchmark System")
    print("=====================================")

    # Example: run all facebook tasks
    results = pipeline.run_all_tasks(website_filter='facebook', task_type_filter='General')

    print(f"\\nCompleted {len(results)} tasks")
    for result in results:
        status = "SUCCESS" if result.get('success') else "FAILED"
        print(f"Task {result['task_id']}: {status} (attempts: {result.get('attempts', 'N/A')})")

    # Generate report
    report = pipeline.generate_report()
    print("\\n" + report)

    # Save report to file
    with open('macro_benchmark_report.txt', 'w') as f:
        f.write(report)

    print("\\nReport saved to macro_benchmark_report.txt")


if __name__ == "__main__":
    main()