#!/usr/bin/env python3
"""
Web Macro Automation Pipeline for LLM Benchmarking
Complete pipeline for generating, executing, and evaluating web macros
"""

import os
import json
import time
import logging
import pandas as pd
from datetime import datetime
from pathlib import Path
import subprocess
import re
import traceback
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
import openai
from typing import Dict, List, Optional, Tuple

class MacroAutomationPipeline:
    def __init__(self, base_dir: str, openai_api_key: str = None, max_attempts: int = 5):
        """Initialize the pipeline"""
        self.base_dir = Path(base_dir)
        self.max_attempts = max_attempts
        self.results_dir = self.base_dir / "macro_results"
        self.results_dir.mkdir(exist_ok=True)

        # Setup logging
        self.setup_logging()

        # OpenAI client (if API key provided)
        if openai_api_key:
            openai.api_key = openai_api_key

        # Selenium driver
        self.driver = None
        self.setup_selenium()

    def setup_logging(self):
        """Setup logging configuration"""
        log_file = self.results_dir / f"pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def setup_selenium(self):
        """Setup Selenium WebDriver"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            # chrome_options.add_argument("--headless")  # Comment out for debugging

            # Try to find Chrome driver automatically
            try:
                from webdriver_manager.chrome import ChromeDriverManager
                service = Service(ChromeDriverManager().install())
            except:
                # Fallback to default location
                service = Service()

            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.implicitly_wait(10)
            self.logger.info("Selenium WebDriver initialized successfully")
        except Exception as e:
            self.logger.error(f"Failed to initialize Selenium: {e}")
            raise

    # Step 1: Extract macro tasks from Excel files
    def extract_macro_tasks(self) -> Dict[str, List[Dict]]:
        """Extract macro tasks from all Excel files in website folders"""
        self.logger.info("Step 1: Extracting macro tasks from Excel files")

        all_tasks = {}
        website_dirs = [d for d in self.base_dir.iterdir() if d.is_dir() and d.name != "macro_results"]

        for website_dir in website_dirs:
            website_name = website_dir.name
            task_files = list(website_dir.glob("*_task*.xlsx"))

            if not task_files:
                self.logger.warning(f"No task file found for {website_name}")
                continue

            task_file = task_files[0]  # Take the first task file found

            try:
                df = pd.read_excel(task_file)
                tasks = df.to_dict('records')
                all_tasks[website_name] = tasks
                self.logger.info(f"Loaded {len(tasks)} tasks for {website_name}")
            except Exception as e:
                self.logger.error(f"Failed to load tasks from {task_file}: {e}")

        return all_tasks

    # Step 2: Generate prompt for LLM to create macro
    def generate_macro_prompt(self, task: Dict, website_code: Dict) -> str:
        """Generate prompt for LLM to create macro code"""

        prompt = f"""# Web Macro Generation Task

## Task Information
- **Task ID**: {task.get('Task ID', 'Unknown')}
- **Category**: {task.get('Category', 'Unknown')}
- **Description**: {task.get('Task Description', 'No description')}
- **Difficulty**: {task.get('Difficulty', 'Unknown')}
- **Key Elements**: {task.get('Key Elements', 'None specified')}
- **Expected Actions**: {task.get('Expected Actions', 'None specified')}

## Website Code Information
### HTML Structure:
```html
{website_code.get('html', 'Not available')}
```

### CSS Classes and IDs (Key Elements):
```css
{website_code.get('key_selectors', 'Not available')}
```

### JavaScript Functions:
```javascript
{website_code.get('js_functions', 'Not available')}
```

## Requirements
Create a complete Python + Selenium macro that:
1. Opens the website (use file:// protocol for local HTML files)
2. Performs the specified task actions
3. Includes proper error handling and logging
4. Uses explicit waits for dynamic content
5. Captures screenshots at key steps
6. Returns success/failure status and results

## Output Format
Please provide ONLY the Python code between the markers:

```python
# MACRO_CODE_START
import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def execute_macro(driver, base_url):
    \"\"\"
    Execute the macro task
    Args:
        driver: Selenium WebDriver instance
        base_url: Base URL of the website
    Returns:
        dict: {{
            'success': bool,
            'message': str,
            'data': dict,
            'screenshots': list
        }}
    \"\"\"
    results = {{
        'success': False,
        'message': '',
        'data': {{}},
        'screenshots': []
    }}

    try:
        # Your macro implementation here
        # Example structure:
        driver.get(base_url)

        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Implement task-specific logic here

        results['success'] = True
        results['message'] = "Macro executed successfully"

    except Exception as e:
        results['success'] = False
        results['message'] = f"Macro failed: {{str(e)}}"
        logging.error(f"Macro execution error: {{e}}")

    return results
# MACRO_CODE_END
```

Generate the macro code now:"""

        return prompt

    # Step 3: Extract macro code from LLM response
    def extract_macro_code(self, llm_response: str) -> Optional[str]:
        """Extract macro code from LLM response"""
        try:
            # Look for code between MACRO_CODE_START and MACRO_CODE_END
            pattern = r'# MACRO_CODE_START(.*?)# MACRO_CODE_END'
            match = re.search(pattern, llm_response, re.DOTALL)

            if match:
                return match.group(1).strip()

            # Fallback: look for python code blocks
            pattern = r'```python(.*?)```'
            matches = re.findall(pattern, llm_response, re.DOTALL)

            if matches:
                return matches[-1].strip()  # Take the last code block

            self.logger.error("Could not extract macro code from LLM response")
            return None

        except Exception as e:
            self.logger.error(f"Error extracting macro code: {e}")
            return None

    # Step 4: Execute macro on website
    def execute_macro_on_website(self, macro_code: str, website_path: str) -> Dict:
        """Execute the generated macro on the website"""
        self.logger.info("Step 4: Executing macro on website")

        execution_results = {
            'success': False,
            'message': '',
            'data': {},
            'screenshots': [],
            'execution_log': [],
            'errors': []
        }

        try:
            # Create a temporary file with the macro code
            temp_macro_file = self.results_dir / "temp_macro.py"

            # Add necessary imports and setup
            full_macro_code = f"""
import time
import logging
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Setup logging for macro execution
logging.basicConfig(level=logging.INFO)

{macro_code}

# Execute the macro
if __name__ == "__main__":
    # This will be called by the pipeline
    pass
"""

            # Write macro to temporary file
            with open(temp_macro_file, 'w', encoding='utf-8') as f:
                f.write(full_macro_code)

            # Execute macro using the current driver
            base_url = f"file:///{website_path.replace(os.sep, '/')}"

            # Import and execute the macro function
            import importlib.util
            spec = importlib.util.spec_from_file_location("temp_macro", temp_macro_file)
            temp_macro = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(temp_macro)

            # Execute the macro
            if hasattr(temp_macro, 'execute_macro'):
                results = temp_macro.execute_macro(self.driver, base_url)
                execution_results.update(results)
            else:
                execution_results['message'] = "No execute_macro function found"

            # Clean up temporary file
            temp_macro_file.unlink(missing_ok=True)

        except Exception as e:
            execution_results['success'] = False
            execution_results['message'] = f"Macro execution failed: {str(e)}"
            execution_results['errors'].append(traceback.format_exc())
            self.logger.error(f"Macro execution error: {e}")

        return execution_results

    # Step 5: Multi-turn retry mechanism
    def retry_macro_with_feedback(self, task: Dict, website_code: Dict,
                                 previous_attempts: List[Dict]) -> Tuple[bool, Dict]:
        """Retry macro generation with feedback from previous attempts"""
        self.logger.info(f"Step 5: Retrying macro generation (Attempt {len(previous_attempts) + 1})")

        # Create feedback prompt with previous attempt results
        feedback_prompt = self.generate_macro_prompt(task, website_code)

        # Add feedback from previous attempts
        feedback_prompt += "\n\n## Previous Attempt Results\n"
        for i, attempt in enumerate(previous_attempts, 1):
            feedback_prompt += f"\n### Attempt {i}:\n"
            feedback_prompt += f"- **Status**: {'SUCCESS' if attempt['execution_results']['success'] else 'FAILED'}\n"
            feedback_prompt += f"- **Error Message**: {attempt['execution_results']['message']}\n"

            if attempt['execution_results']['errors']:
                feedback_prompt += f"- **Technical Errors**: {attempt['execution_results']['errors'][0][:500]}...\n"

        feedback_prompt += "\n**Please analyze the errors above and generate an improved macro that addresses these issues.**\n"

        # Get LLM response (placeholder - implement your LLM API call)
        llm_response = self.call_llm_api(feedback_prompt)

        if not llm_response:
            return False, {'error': 'Failed to get LLM response'}

        # Extract macro code
        macro_code = self.extract_macro_code(llm_response)

        if not macro_code:
            return False, {'error': 'Failed to extract macro code from LLM response'}

        return True, {
            'prompt': feedback_prompt,
            'llm_response': llm_response,
            'macro_code': macro_code
        }

    # Step 6: Pipeline orchestration with max 5 attempts
    def run_macro_pipeline(self, task: Dict, website_name: str) -> Dict:
        """Run the complete macro pipeline for a single task"""
        self.logger.info(f"Running pipeline for task {task.get('Task ID')} on {website_name}")

        pipeline_results = {
            'task': task,
            'website': website_name,
            'attempts': [],
            'final_success': False,
            'total_attempts': 0,
            'start_time': datetime.now().isoformat(),
            'end_time': None
        }

        # Load website code
        website_code = self.load_website_code(website_name)
        website_path = self.get_website_path(website_name)

        if not website_path:
            pipeline_results['error'] = f"Website path not found for {website_name}"
            return pipeline_results

        # Attempt macro generation and execution up to max_attempts times
        for attempt_num in range(1, self.max_attempts + 1):
            self.logger.info(f"Pipeline attempt {attempt_num}/{self.max_attempts}")

            attempt_results = {
                'attempt_number': attempt_num,
                'timestamp': datetime.now().isoformat(),
                'prompt': '',
                'llm_response': '',
                'macro_code': '',
                'execution_results': {},
                'success': False
            }

            try:
                if attempt_num == 1:
                    # First attempt - generate initial prompt
                    prompt = self.generate_macro_prompt(task, website_code)
                    llm_response = self.call_llm_api(prompt)
                else:
                    # Retry with feedback from previous attempts
                    success, retry_data = self.retry_macro_with_feedback(
                        task, website_code, pipeline_results['attempts']
                    )
                    if not success:
                        attempt_results['error'] = retry_data.get('error', 'Retry failed')
                        pipeline_results['attempts'].append(attempt_results)
                        continue

                    prompt = retry_data['prompt']
                    llm_response = retry_data['llm_response']
                    macro_code = retry_data['macro_code']

                # Extract macro code (for first attempt)
                if attempt_num == 1:
                    if not llm_response:
                        attempt_results['error'] = 'Failed to get LLM response'
                        pipeline_results['attempts'].append(attempt_results)
                        continue

                    macro_code = self.extract_macro_code(llm_response)
                    if not macro_code:
                        attempt_results['error'] = 'Failed to extract macro code'
                        pipeline_results['attempts'].append(attempt_results)
                        continue

                # Store attempt data
                attempt_results['prompt'] = prompt
                attempt_results['llm_response'] = llm_response
                attempt_results['macro_code'] = macro_code

                # Execute macro
                execution_results = self.execute_macro_on_website(macro_code, website_path)
                attempt_results['execution_results'] = execution_results
                attempt_results['success'] = execution_results['success']

                # Check if successful
                if execution_results['success']:
                    pipeline_results['final_success'] = True
                    pipeline_results['attempts'].append(attempt_results)
                    self.logger.info(f"Pipeline succeeded on attempt {attempt_num}")
                    break

                pipeline_results['attempts'].append(attempt_results)
                self.logger.info(f"Attempt {attempt_num} failed: {execution_results['message']}")

            except Exception as e:
                attempt_results['error'] = f"Attempt failed with exception: {str(e)}"
                pipeline_results['attempts'].append(attempt_results)
                self.logger.error(f"Pipeline attempt {attempt_num} failed: {e}")

        pipeline_results['total_attempts'] = len(pipeline_results['attempts'])
        pipeline_results['end_time'] = datetime.now().isoformat()

        return pipeline_results

    # Step 7: Save all experiment results
    def save_experiment_results(self, all_results: List[Dict]):
        """Save all experiment results to files"""
        self.logger.info("Step 7: Saving experiment results")

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        # Save detailed JSON results
        json_file = self.results_dir / f"experiment_results_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_results, f, indent=2, ensure_ascii=False, default=str)

        # Create summary CSV
        summary_data = []
        for result in all_results:
            summary_data.append({
                'Task_ID': result['task'].get('Task ID'),
                'Website': result['website'],
                'Task_Type': result['task'].get('Type'),
                'Category': result['task'].get('Category'),
                'Difficulty': result['task'].get('Difficulty'),
                'Final_Success': result['final_success'],
                'Total_Attempts': result['total_attempts'],
                'First_Attempt_Success': result['attempts'][0]['success'] if result['attempts'] else False,
                'Duration_Minutes': self.calculate_duration(result.get('start_time'), result.get('end_time')),
                'Final_Error': result['attempts'][-1]['execution_results'].get('message', '') if result['attempts'] and not result['final_success'] else ''
            })

        # Save summary CSV
        summary_df = pd.DataFrame(summary_data)
        csv_file = self.results_dir / f"experiment_summary_{timestamp}.csv"
        summary_df.to_csv(csv_file, index=False)

        # Generate statistics
        stats = {
            'total_tasks': len(all_results),
            'successful_tasks': sum(1 for r in all_results if r['final_success']),
            'failed_tasks': sum(1 for r in all_results if not r['final_success']),
            'success_rate': sum(1 for r in all_results if r['final_success']) / len(all_results) if all_results else 0,
            'average_attempts': sum(r['total_attempts'] for r in all_results) / len(all_results) if all_results else 0,
            'first_attempt_success_rate': sum(1 for r in all_results if r['attempts'] and r['attempts'][0]['success']) / len(all_results) if all_results else 0
        }

        # Save statistics
        stats_file = self.results_dir / f"experiment_stats_{timestamp}.json"
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2)

        self.logger.info(f"Results saved to {json_file}")
        self.logger.info(f"Summary saved to {csv_file}")
        self.logger.info(f"Statistics: {stats}")

    # Utility functions
    def load_website_code(self, website_name: str) -> Dict:
        """Load website code for analysis"""
        website_dir = self.base_dir / website_name

        code_info = {
            'html': '',
            'css': '',
            'js_functions': '',
            'key_selectors': ''
        }

        # Load HTML
        html_files = list(website_dir.glob("*.html"))
        if html_files:
            with open(html_files[0], 'r', encoding='utf-8') as f:
                code_info['html'] = f.read()[:2000]  # Limit to first 2000 chars

        # Load CSS
        css_files = list(website_dir.glob("*.css"))
        if css_files:
            with open(css_files[0], 'r', encoding='utf-8') as f:
                css_content = f.read()
                # Extract key selectors (classes and IDs)
                import re
                selectors = re.findall(r'[.#][\w-]+', css_content)
                code_info['key_selectors'] = '\n'.join(set(selectors))

        # Load JS functions
        js_files = list(website_dir.glob("*.js"))
        if js_files:
            with open(js_files[0], 'r', encoding='utf-8') as f:
                js_content = f.read()
                # Extract function names
                functions = re.findall(r'function\s+(\w+)', js_content)
                code_info['js_functions'] = '\n'.join(functions)

        return code_info

    def get_website_path(self, website_name: str) -> Optional[str]:
        """Get the path to the main HTML file of the website"""
        website_dir = self.base_dir / website_name
        html_files = list(website_dir.glob("index.html"))

        if not html_files:
            html_files = list(website_dir.glob("*.html"))

        if html_files:
            return str(html_files[0].resolve())

        return None

    def call_llm_api(self, prompt: str) -> Optional[str]:
        """Call LLM API to generate macro code"""
        # Placeholder for LLM API call
        # Replace this with your actual LLM API implementation

        # For testing, return a simple macro template
        return f"""
Here's a macro for the task:

```python
# MACRO_CODE_START
import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def execute_macro(driver, base_url):
    results = {{
        'success': False,
        'message': '',
        'data': {{}},
        'screenshots': []
    }}

    try:
        driver.get(base_url)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Simple test - just verify page loads
        title = driver.title
        results['success'] = True
        results['message'] = f"Page loaded successfully. Title: {{title}}"
        results['data']['page_title'] = title

    except Exception as e:
        results['success'] = False
        results['message'] = f"Macro failed: {{str(e)}}"
        logging.error(f"Macro execution error: {{e}}")

    return results
# MACRO_CODE_END
```
"""

    def calculate_duration(self, start_time: str, end_time: str) -> float:
        """Calculate duration in minutes between two timestamps"""
        if not start_time or not end_time:
            return 0

        try:
            start = datetime.fromisoformat(start_time)
            end = datetime.fromisoformat(end_time)
            return (end - start).total_seconds() / 60
        except:
            return 0

    def run_full_pipeline(self):
        """Run the complete pipeline for all tasks"""
        self.logger.info("Starting full macro automation pipeline")

        # Step 1: Extract all tasks
        all_tasks = self.extract_macro_tasks()

        if not all_tasks:
            self.logger.error("No tasks found!")
            return

        # Run pipeline for each task
        all_results = []

        for website_name, tasks in all_tasks.items():
            self.logger.info(f"Processing {len(tasks)} tasks for {website_name}")

            for task in tasks:
                try:
                    result = self.run_macro_pipeline(task, website_name)
                    all_results.append(result)
                except Exception as e:
                    self.logger.error(f"Failed to process task {task.get('Task ID')}: {e}")
                    all_results.append({
                        'task': task,
                        'website': website_name,
                        'error': str(e),
                        'final_success': False
                    })

        # Step 7: Save all results
        self.save_experiment_results(all_results)

        self.logger.info("Pipeline completed successfully")
        return all_results

    def cleanup(self):
        """Cleanup resources"""
        if self.driver:
            self.driver.quit()


def main():
    """Main function to run the pipeline"""

    # Configuration
    BASE_DIR = "E:\\Project\\web-agent"
    OPENAI_API_KEY = None  # Set your OpenAI API key here
    MAX_ATTEMPTS = 5

    # Create and run pipeline
    pipeline = MacroAutomationPipeline(
        base_dir=BASE_DIR,
        openai_api_key=OPENAI_API_KEY,
        max_attempts=MAX_ATTEMPTS
    )

    try:
        results = pipeline.run_full_pipeline()
        print(f"Pipeline completed! Processed {len(results)} tasks.")
    except Exception as e:
        logging.error(f"Pipeline failed: {e}")
    finally:
        pipeline.cleanup()


if __name__ == "__main__":
    main()