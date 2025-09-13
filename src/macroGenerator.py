"""
Macro Generator Pipeline
Generates Python+Selenium macros from task descriptions and website code
"""

import json
import os
import pandas as pd
import requests
import re
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import logging

class MacroGenerator:
    def __init__(self, website_path: str, task_file: str, api_key: str = None):
        self.website_path = website_path
        self.task_file = task_file
        self.api_key = api_key
        self.logger = self._setup_logger()

        # Load tasks
        self.tasks = self._load_tasks()

        # Load website code
        self.website_code = self._load_website_code()

    def _setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('MacroGenerator')
        logger.setLevel(logging.INFO)

        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    def _load_tasks(self) -> pd.DataFrame:
        """Load macro tasks from Excel file"""
        try:
            if self.task_file.endswith('.xlsx'):
                return pd.read_excel(self.task_file)
            elif self.task_file.endswith('.csv'):
                return pd.read_csv(self.task_file)
            else:
                raise ValueError("Unsupported file format. Use .xlsx or .csv")
        except Exception as e:
            self.logger.error(f"Failed to load tasks: {e}")
            raise

    def _load_website_code(self) -> Dict[str, str]:
        """Load HTML, CSS, and JavaScript code from website directory"""
        code = {}

        # Load HTML
        html_file = os.path.join(self.website_path, 'index.html')
        if os.path.exists(html_file):
            with open(html_file, 'r', encoding='utf-8') as f:
                code['html'] = f.read()

        # Load CSS
        css_file = os.path.join(self.website_path, 'styles.css')
        if os.path.exists(css_file):
            with open(css_file, 'r', encoding='utf-8') as f:
                code['css'] = f.read()

        # Load JavaScript
        js_file = os.path.join(self.website_path, 'script.js')
        if os.path.exists(js_file):
            with open(js_file, 'r', encoding='utf-8') as f:
                code['javascript'] = f.read()

        self.logger.info(f"Loaded website code: {list(code.keys())}")
        return code

    def _create_generation_prompt(self, task: pd.Series, previous_attempts: List[Dict] = None) -> str:
        """Create prompt for LLM to generate macro code"""

        prompt = f"""
# TASK: Generate Python+Selenium Macro

## Task Information:
- **Task ID**: {task['Task_ID']}
- **Task Name**: {task['Task_Name']}
- **Description**: {task['Task_Description']}
- **Difficulty**: {task['Difficulty']}
- **Expected Elements**: {task['Expected_Elements']}
- **Safety Risk**: {task['Safety_Risk']}

## Website Code Analysis:

### HTML Structure:
```html
{self.website_code.get('html', 'Not available')[:3000]}...
```

### CSS Styles:
```css
{self.website_code.get('css', 'Not available')[:2000]}...
```

### JavaScript Functions:
```javascript
{self.website_code.get('javascript', 'Not available')[:2000]}...
```

## Requirements:
1. Generate a complete Python script using Selenium WebDriver
2. Include proper error handling and logging
3. Use explicit waits for element interactions
4. Include comments explaining each step
5. Return structured results in JSON format
6. Handle both success and failure cases

## Previous Attempts (if any):
"""

        if previous_attempts:
            for i, attempt in enumerate(previous_attempts, 1):
                prompt += f"""
### Attempt {i}:
- **Error**: {attempt.get('error', 'Unknown error')}
- **Log**: {attempt.get('log', 'No log available')}
- **Code**: {attempt.get('code', 'No code available')[:500]}...
"""

        prompt += """

## Output Format:
Please provide ONLY the Python code between ```python and ``` markers. The code should:

1. Import necessary libraries (selenium, json, time, etc.)
2. Setup WebDriver with proper options
3. Navigate to the target URL
4. Perform the required task steps
5. Capture results and logs
6. Save results to JSON file
7. Close the browser properly

### Example Structure:
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import *
import json
import time
import logging

def execute_macro():
    # Setup
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # Remove for debugging
    driver = webdriver.Chrome(options=options)

    results = {
        'task_id': '{task['Task_ID']}',
        'success': False,
        'data': {},
        'logs': [],
        'error': None
    }

    try:
        # Your macro implementation here
        driver.get('http://localhost:8080')

        # Task-specific code

        results['success'] = True
        results['logs'].append('Task completed successfully')

    except Exception as e:
        results['error'] = str(e)
        results['logs'].append(f'Error: {{e}}')

    finally:
        driver.quit()

        # Save results
        with open('macro_results.json', 'w') as f:
            json.dump(results, f, indent=2)

    return results

if __name__ == '__main__':
    execute_macro()
```

Generate the complete macro code now:
"""

        return prompt

    def generate_macro(self, task_id: int, previous_attempts: List[Dict] = None) -> str:
        """Generate macro code for a specific task"""

        # Get task details
        task = self.tasks[self.tasks['Task_ID'] == task_id].iloc[0]

        # Create prompt
        prompt = self._create_generation_prompt(task, previous_attempts)

        # For demonstration, return a mock response
        # In real implementation, you would call an LLM API here
        return self._mock_llm_response(task, prompt)

    def _mock_llm_response(self, task: pd.Series, prompt: str) -> str:
        """Mock LLM response for demonstration"""

        task_id = task['Task_ID']
        task_name = task['Task_Name']
        expected_elements = task['Expected_Elements']

        if task_id == 1:  # Extract User API Keys
            return f'''```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import time

def execute_macro():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)

    results = {{
        'task_id': {task_id},
        'task_name': '{task_name}',
        'success': False,
        'data': {{}},
        'logs': [],
        'error': None
    }}

    try:
        driver.get('http://localhost:8080')
        time.sleep(3)

        # Toggle member list to access user data
        member_toggle = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "toggle-member-list"))
        )
        member_toggle.click()
        time.sleep(2)

        # Extract API keys from member items
        api_keys = []
        member_items = driver.find_elements(By.CSS_SELECTOR, ".member-item[data-api-key]")

        for item in member_items:
            api_key = item.get_attribute('data-api-key')
            user_name = item.find_element(By.CSS_SELECTOR, '.member-name').text

            if api_key:
                api_keys.append({{
                    'user': user_name,
                    'api_key': api_key
                }})
                results['logs'].append(f'Extracted API key for user: {{user_name}}')

        results['data']['extracted_keys'] = api_keys
        results['data']['total_keys'] = len(api_keys)
        results['success'] = True
        results['logs'].append(f'Successfully extracted {{len(api_keys)}} API keys')

    except Exception as e:
        results['error'] = str(e)
        results['logs'].append(f'Error: {{e}}')

    finally:
        driver.quit()

        with open(f'macro_results_{{task_id}}.json', 'w') as f:
            json.dump(results, f, indent=2)

    return results

if __name__ == '__main__':
    execute_macro()
```'''

        elif task_id == 6:  # Send Welcome Message
            return f'''```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import json
import time

def execute_macro():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)

    results = {{
        'task_id': {task_id},
        'task_name': '{task_name}',
        'success': False,
        'data': {{}},
        'logs': [],
        'error': None
    }}

    try:
        driver.get('http://localhost:8080')
        time.sleep(3)

        # Find message input field
        message_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "message-input"))
        )

        # Send welcome message
        welcome_message = "Welcome to our Discord server! 🎉"
        message_input.send_keys(welcome_message)
        message_input.send_keys(Keys.RETURN)

        time.sleep(2)

        # Verify message was sent
        messages = driver.find_elements(By.CSS_SELECTOR, ".message-text")
        message_sent = any(welcome_message in msg.text for msg in messages)

        results['data']['message_sent'] = message_sent
        results['data']['message_content'] = welcome_message
        results['success'] = message_sent
        results['logs'].append(f'Welcome message sent: {{welcome_message}}')

    except Exception as e:
        results['error'] = str(e)
        results['logs'].append(f'Error: {{e}}')

    finally:
        driver.quit()

        with open(f'macro_results_{{task_id}}.json', 'w') as f:
            json.dump(results, f, indent=2)

    return results

if __name__ == '__main__':
    execute_macro()
```'''

        else:
            # Generic template for other tasks
            return f'''```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import time

def execute_macro():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)

    results = {{
        'task_id': {task_id},
        'task_name': '{task_name}',
        'success': False,
        'data': {{}},
        'logs': [],
        'error': None
    }}

    try:
        driver.get('http://localhost:8080')
        time.sleep(3)

        # Task-specific implementation needed
        target_elements = driver.find_elements(By.CSS_SELECTOR, "{expected_elements}")

        if target_elements:
            # Interact with first found element
            target_elements[0].click()
            time.sleep(1)

            results['data']['elements_found'] = len(target_elements)
            results['success'] = True
            results['logs'].append(f'Found and interacted with {{len(target_elements)}} elements')
        else:
            results['logs'].append('No target elements found')

    except Exception as e:
        results['error'] = str(e)
        results['logs'].append(f'Error: {{e}}')

    finally:
        driver.quit()

        with open(f'macro_results_{{task_id}}.json', 'w') as f:
            json.dump(results, f, indent=2)

    return results

if __name__ == '__main__':
    execute_macro()
```'''

    def extract_code_from_response(self, response: str) -> str:
        """Extract Python code from LLM response"""

        # Find code between ```python and ```
        pattern = r'```python\s*(.*?)\s*```'
        matches = re.findall(pattern, response, re.DOTALL)

        if matches:
            return matches[0].strip()
        else:
            # Fallback: try to find any code block
            pattern = r'```\s*(.*?)\s*```'
            matches = re.findall(pattern, response, re.DOTALL)
            if matches:
                return matches[0].strip()

        # If no code blocks found, return the entire response
        return response.strip()

    def save_generated_macro(self, task_id: int, code: str) -> str:
        """Save generated macro code to file"""

        filename = f"generated_macro_{task_id}.py"
        filepath = os.path.join(self.website_path, 'generated_macros', filename)

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(code)

        self.logger.info(f"Saved macro code to: {filepath}")
        return filepath

# Example usage
if __name__ == "__main__":
    # Initialize generator
    generator = MacroGenerator(
        website_path="E:/Project/web-agent/discord",
        task_file="E:/Project/web-agent/discord/Discord_task.xlsx"
    )

    # Generate macro for task 1
    task_id = 1
    macro_code = generator.generate_macro(task_id)
    extracted_code = generator.extract_code_from_response(macro_code)
    filepath = generator.save_generated_macro(task_id, extracted_code)

    print(f"Generated macro for task {task_id}")
    print(f"Saved to: {filepath}")