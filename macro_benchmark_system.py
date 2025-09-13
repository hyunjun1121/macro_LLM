import os
import json
import pandas as pd
import time
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
import traceback
import re
import subprocess
import threading
from pathlib import Path

class MacroBenchmarkSystem:
    def __init__(self, base_path="E:\\Project\\web-agent"):
        self.base_path = Path(base_path)
        self.results_dir = self.base_path / "benchmark_results"
        self.results_dir.mkdir(exist_ok=True)

        # Setup logging
        self.setup_logging()

        # Initialize result storage
        self.experiment_results = []
        self.current_experiment = {}

        # Selenium setup
        self.driver = None
        self.wait = None

    def setup_logging(self):
        """Setup logging configuration"""
        log_file = self.results_dir / f"benchmark_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def initialize_driver(self):
        """Initialize Chrome WebDriver with proper settings"""
        try:
            from selenium.webdriver.chrome.options import Options
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])
            chrome_options.add_experimental_option('useAutomationExtension', False)

            self.driver = webdriver.Chrome(options=chrome_options)
            self.wait = WebDriverWait(self.driver, 10)
            self.logger.info("Chrome WebDriver initialized successfully")

        except Exception as e:
            self.logger.error(f"Failed to initialize WebDriver: {str(e)}")
            raise

    def extract_tasks_from_xlsx(self, website_name):
        """Extract macro tasks from xlsx file"""
        xlsx_path = self.base_path / website_name / f"{website_name}_task.xlsx"

        if not xlsx_path.exists():
            self.logger.error(f"Task file not found: {xlsx_path}")
            return []

        try:
            df = pd.read_excel(xlsx_path)
            tasks = df.to_dict('records')
            self.logger.info(f"Extracted {len(tasks)} tasks from {xlsx_path}")
            return tasks
        except Exception as e:
            self.logger.error(f"Failed to extract tasks from {xlsx_path}: {str(e)}")
            return []

    def read_website_code(self, website_name):
        """Read all website code (HTML, CSS, JS)"""
        website_dir = self.base_path / website_name
        code_content = {}

        # Read HTML files
        for html_file in website_dir.glob("*.html"):
            try:
                with open(html_file, 'r', encoding='utf-8') as f:
                    code_content[f"html_{html_file.name}"] = f.read()
            except Exception as e:
                self.logger.warning(f"Failed to read {html_file}: {str(e)}")

        # Read CSS files
        for css_file in website_dir.glob("*.css"):
            try:
                with open(css_file, 'r', encoding='utf-8') as f:
                    code_content[f"css_{css_file.name}"] = f.read()
            except Exception as e:
                self.logger.warning(f"Failed to read {css_file}: {str(e)}")

        # Read JS files
        for js_file in website_dir.glob("*.js"):
            try:
                with open(js_file, 'r', encoding='utf-8') as f:
                    code_content[f"js_{js_file.name}"] = f.read()
            except Exception as e:
                self.logger.warning(f"Failed to read {js_file}: {str(e)}")

        self.logger.info(f"Read {len(code_content)} code files from {website_dir}")
        return code_content

    def create_macro_prompt(self, task, website_code, attempt_num=1, previous_logs=None):
        """Create prompt for LLM to generate macro code"""

        code_summary = ""
        for filename, content in website_code.items():
            # Truncate very long files for prompt efficiency
            truncated_content = content[:2000] + "..." if len(content) > 2000 else content
            code_summary += f"\n--- {filename} ---\n{truncated_content}\n"

        previous_attempt_info = ""
        if attempt_num > 1 and previous_logs:
            previous_attempt_info = f"""
Previous Attempt #{attempt_num-1} Failed:
ERROR LOGS:
{previous_logs.get('error_log', 'No error log available')}

EXECUTION LOGS:
{previous_logs.get('execution_log', 'No execution log available')}

SELENIUM ACTIONS ATTEMPTED:
{previous_logs.get('selenium_actions', 'No action log available')}

Please analyze the errors and create an improved macro that addresses these issues.
"""

        prompt = f"""
TASK: Create a Selenium Python macro for web automation

OBJECTIVE: {task.get('Task_Description', 'No description provided')}
CATEGORY: {task.get('Category', 'Unknown')}
DIFFICULTY: {task.get('Difficulty', 'Unknown')}
KEY ELEMENTS: {task.get('Key_Elements', 'Not specified')}
TARGET SELECTORS: {task.get('Target_Selectors', 'Not specified')}
EXPECTED ACTIONS: {task.get('Expected_Actions', 'Not specified')}
SUCCESS CRITERIA: {task.get('Success_Criteria', 'Not specified')}

{previous_attempt_info}

WEBSITE CODE FILES:
{code_summary}

REQUIREMENTS:
1. Use Python + Selenium WebDriver
2. Code should be self-contained and executable
3. Include proper error handling and logging
4. Use explicit waits instead of time.sleep()
5. Return meaningful results/status
6. Website URL: http://localhost:8080

IMPORTANT FORMATTING:
- Wrap your complete macro code between ```python and ```
- Include all necessary imports
- Create a main function that can be executed standalone
- Add detailed comments explaining the automation steps

```python
# Your complete macro code here
```

Generate a robust Selenium macro that accomplishes the specified task.
"""

        return prompt

    def extract_code_from_response(self, llm_response):
        """Extract Python code from LLM response"""
        # Look for code blocks between ```python and ```
        pattern = r'```python\s*\n(.*?)\n```'
        matches = re.findall(pattern, llm_response, re.DOTALL)

        if matches:
            return matches[0].strip()

        # Fallback: look for any code block
        pattern = r'```\s*\n(.*?)\n```'
        matches = re.findall(pattern, llm_response, re.DOTALL)

        if matches:
            return matches[0].strip()

        # If no code blocks found, return the entire response
        return llm_response.strip()

    def execute_macro(self, macro_code, timeout=60):
        """Execute the macro code and capture results"""
        execution_log = []
        error_log = []
        selenium_actions = []
        success = False

        # Create a temporary file for the macro
        temp_macro_file = self.results_dir / "temp_macro.py"

        try:
            # Modify the macro code to include logging
            instrumented_code = self.instrument_macro_code(macro_code)

            # Write the macro to a temporary file
            with open(temp_macro_file, 'w', encoding='utf-8') as f:
                f.write(instrumented_code)

            # Execute the macro in a separate process
            start_time = time.time()

            # Set up environment variables for the subprocess
            env = os.environ.copy()
            env['MACRO_LOG_FILE'] = str(self.results_dir / "macro_execution.log")

            # Run the macro
            process = subprocess.Popen(
                ['python', str(temp_macro_file)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=env
            )

            # Wait for completion with timeout
            try:
                stdout, stderr = process.communicate(timeout=timeout)
                execution_time = time.time() - start_time

                if process.returncode == 0:
                    success = True
                    execution_log.append(f"Macro executed successfully in {execution_time:.2f} seconds")
                    execution_log.append(f"STDOUT: {stdout}")
                else:
                    error_log.append(f"Macro failed with return code {process.returncode}")
                    error_log.append(f"STDERR: {stderr}")
                    execution_log.append(f"STDOUT: {stdout}")

            except subprocess.TimeoutExpired:
                process.kill()
                error_log.append(f"Macro execution timed out after {timeout} seconds")

        except Exception as e:
            error_log.append(f"Failed to execute macro: {str(e)}")
            error_log.append(f"Traceback: {traceback.format_exc()}")

        finally:
            # Clean up temporary file
            if temp_macro_file.exists():
                temp_macro_file.unlink()

        return {
            'success': success,
            'execution_log': '\n'.join(execution_log),
            'error_log': '\n'.join(error_log),
            'selenium_actions': '\n'.join(selenium_actions)
        }

    def instrument_macro_code(self, macro_code):
        """Add logging instrumentation to the macro code"""
        instrumented_code = f"""
import logging
import os
import sys
from datetime import datetime

# Setup logging for macro execution
log_file = os.environ.get('MACRO_LOG_FILE', 'macro_execution.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Original macro code with instrumentation
{macro_code}

if __name__ == "__main__":
    try:
        logger.info("Starting macro execution")
        main()  # Assuming the macro has a main function
        logger.info("Macro execution completed successfully")
    except Exception as e:
        logger.error(f"Macro execution failed: {{str(e)}}")
        logger.error(f"Traceback: {{traceback.format_exc()}}")
        sys.exit(1)
"""
        return instrumented_code

    def simulate_llm_response(self, prompt):
        """Simulate LLM response for testing - replace with actual LLM API call"""
        # This is a placeholder - replace with actual LLM API integration
        return """
Here's a Selenium macro for your task:

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import logging

def main():
    driver = None
    try:
        # Initialize Chrome driver
        options = webdriver.ChromeOptions()
        options.add_argument("--no-sandbox")
        driver = webdriver.Chrome(options=options)

        # Navigate to the website
        driver.get("http://localhost:8080")

        # Wait for page to load
        wait = WebDriverWait(driver, 10)

        # Example: Click on search input
        search_input = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "search-input")))
        search_input.click()
        search_input.send_keys("test search")

        # Example: Click search button
        search_btn = driver.find_element(By.CLASS_NAME, "search-btn")
        search_btn.click()

        logging.info("Macro executed successfully")

    except Exception as e:
        logging.error(f"Error during execution: {str(e)}")
        raise
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    main()
```
"""

    def run_single_task(self, website_name, task, max_attempts=5):
        """Run a single macro task with multi-turn retry logic"""
        self.logger.info(f"Starting task: {task.get('Task_ID', 'Unknown')} - {task.get('Task_Description', 'No description')[:50]}...")

        # Read website code
        website_code = self.read_website_code(website_name)

        experiment_data = {
            'task_id': task.get('Task_ID', 'Unknown'),
            'website_name': website_name,
            'task_description': task.get('Task_Description', ''),
            'category': task.get('Category', ''),
            'difficulty': task.get('Difficulty', ''),
            'attempts': [],
            'final_success': False,
            'start_time': datetime.now().isoformat()
        }

        previous_logs = None

        for attempt in range(1, max_attempts + 1):
            self.logger.info(f"Attempt {attempt}/{max_attempts}")

            try:
                # Create prompt for LLM
                prompt = self.create_macro_prompt(task, website_code, attempt, previous_logs)

                # Get LLM response (replace with actual API call)
                llm_response = self.simulate_llm_response(prompt)

                # Extract macro code
                macro_code = self.extract_code_from_response(llm_response)

                # Execute macro
                execution_result = self.execute_macro(macro_code)

                # Store attempt data
                attempt_data = {
                    'attempt_number': attempt,
                    'prompt': prompt,
                    'llm_response': llm_response,
                    'macro_code': macro_code,
                    'execution_result': execution_result,
                    'timestamp': datetime.now().isoformat()
                }

                experiment_data['attempts'].append(attempt_data)

                # Check if successful
                if execution_result['success']:
                    experiment_data['final_success'] = True
                    self.logger.info(f"Task completed successfully on attempt {attempt}")
                    break
                else:
                    # Prepare logs for next attempt
                    previous_logs = execution_result
                    self.logger.warning(f"Attempt {attempt} failed, preparing for retry...")

            except Exception as e:
                self.logger.error(f"Error in attempt {attempt}: {str(e)}")
                # Continue to next attempt
                continue

        experiment_data['end_time'] = datetime.now().isoformat()

        if not experiment_data['final_success']:
            self.logger.error(f"Task failed after {max_attempts} attempts")

        return experiment_data

    def run_benchmark(self, website_name, task_filter=None):
        """Run the complete benchmark for a website"""
        self.logger.info(f"Starting benchmark for website: {website_name}")

        # Extract tasks
        tasks = self.extract_tasks_from_xlsx(website_name)

        if not tasks:
            self.logger.error(f"No tasks found for website: {website_name}")
            return

        # Filter tasks if specified
        if task_filter:
            if isinstance(task_filter, str):
                tasks = [t for t in tasks if task_filter.lower() in t.get('Task_ID', '').lower()]
            elif isinstance(task_filter, list):
                tasks = [t for t in tasks if t.get('Task_ID', '') in task_filter]

        self.logger.info(f"Running benchmark on {len(tasks)} tasks")

        # Run each task
        for i, task in enumerate(tasks, 1):
            self.logger.info(f"Processing task {i}/{len(tasks)}")

            try:
                result = self.run_single_task(website_name, task)
                self.experiment_results.append(result)

                # Save intermediate results
                self.save_results()

            except Exception as e:
                self.logger.error(f"Failed to process task {task.get('Task_ID', 'Unknown')}: {str(e)}")

        self.logger.info(f"Benchmark completed. Processed {len(self.experiment_results)} tasks")

    def save_results(self):
        """Save experiment results to files"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        # Save as JSON
        json_file = self.results_dir / f"benchmark_results_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(self.experiment_results, f, indent=2, ensure_ascii=False)

        # Save as Excel for easy analysis
        excel_file = self.results_dir / f"benchmark_results_{timestamp}.xlsx"

        # Flatten results for DataFrame
        flattened_results = []
        for result in self.experiment_results:
            base_data = {
                'task_id': result['task_id'],
                'website_name': result['website_name'],
                'task_description': result['task_description'],
                'category': result['category'],
                'difficulty': result['difficulty'],
                'final_success': result['final_success'],
                'total_attempts': len(result['attempts']),
                'start_time': result['start_time'],
                'end_time': result['end_time']
            }

            for attempt in result['attempts']:
                attempt_data = base_data.copy()
                attempt_data.update({
                    'attempt_number': attempt['attempt_number'],
                    'execution_success': attempt['execution_result']['success'],
                    'error_log': attempt['execution_result']['error_log'],
                    'timestamp': attempt['timestamp']
                })
                flattened_results.append(attempt_data)

        df = pd.DataFrame(flattened_results)
        df.to_excel(excel_file, index=False)

        self.logger.info(f"Results saved to {json_file} and {excel_file}")

    def cleanup(self):
        """Cleanup resources"""
        if self.driver:
            self.driver.quit()
        self.logger.info("Cleanup completed")

# Example usage
def main():
    benchmark = MacroBenchmarkSystem()

    try:
        # Run benchmark for YouTube
        benchmark.run_benchmark('youtube', task_filter=['YT_BEN_001'])  # Test with one task first

    except Exception as e:
        logging.error(f"Benchmark failed: {str(e)}")

    finally:
        benchmark.cleanup()

if __name__ == "__main__":
    main()