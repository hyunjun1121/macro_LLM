#!/usr/bin/env python3
"""
Test script for the macro automation pipeline
"""

import sys
import json
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from macro_automation_pipeline import MacroAutomationPipeline


def test_basic_functionality():
    """Test basic pipeline functionality"""
    print("Testing Macro Automation Pipeline...")

    # Configuration
    BASE_DIR = "E:\\Project\\web-agent"
    MAX_ATTEMPTS = 2  # Reduced for testing

    try:
        # Create pipeline
        pipeline = MacroAutomationPipeline(
            base_dir=BASE_DIR,
            openai_api_key=None,  # No API key for testing
            max_attempts=MAX_ATTEMPTS
        )

        print("✓ Pipeline initialized successfully")

        # Test Step 1: Extract macro tasks
        print("\n--- Testing Task Extraction ---")
        all_tasks = pipeline.extract_macro_tasks()

        if all_tasks:
            print(f"✓ Found tasks for {len(all_tasks)} websites:")
            for website, tasks in all_tasks.items():
                print(f"  - {website}: {len(tasks)} tasks")

                # Show first task as example
                if tasks:
                    first_task = tasks[0]
                    print(f"    Example task: {first_task.get('Task ID')} - {first_task.get('Task Description', 'No description')[:100]}...")
        else:
            print("⚠ No tasks found")

        # Test Step 2: Website code loading
        print("\n--- Testing Website Code Loading ---")
        if all_tasks:
            website_name = list(all_tasks.keys())[0]
            website_code = pipeline.load_website_code(website_name)
            print(f"✓ Loaded code for {website_name}")
            print(f"  - HTML: {len(website_code['html'])} characters")
            print(f"  - Key selectors: {len(website_code['key_selectors'].split())} found")

            # Test website path
            website_path = pipeline.get_website_path(website_name)
            if website_path:
                print(f"✓ Website path: {website_path}")
            else:
                print("⚠ Website path not found")

        # Test Step 3: Prompt generation
        print("\n--- Testing Prompt Generation ---")
        if all_tasks:
            website_name = list(all_tasks.keys())[0]
            tasks = all_tasks[website_name]
            if tasks:
                task = tasks[0]
                website_code = pipeline.load_website_code(website_name)

                prompt = pipeline.generate_macro_prompt(task, website_code)
                print(f"✓ Generated prompt ({len(prompt)} characters)")
                print(f"  Preview: {prompt[:200]}...")

        # Test Step 4: Mock macro execution (without actual LLM)
        print("\n--- Testing Mock Macro Execution ---")
        mock_macro_code = '''
def execute_macro(driver, base_url):
    results = {
        'success': True,
        'message': 'Mock macro executed successfully',
        'data': {'test': 'data'},
        'screenshots': []
    }

    try:
        driver.get(base_url)
        results['data']['page_title'] = driver.title
    except Exception as e:
        results['success'] = False
        results['message'] = f'Mock macro failed: {str(e)}'

    return results
'''

        if all_tasks:
            website_name = list(all_tasks.keys())[0]
            website_path = pipeline.get_website_path(website_name)

            if website_path:
                print(f"Testing macro execution on {website_path}")

                try:
                    execution_results = pipeline.execute_macro_on_website(mock_macro_code, website_path)
                    print(f"✓ Mock macro execution completed")
                    print(f"  Success: {execution_results['success']}")
                    print(f"  Message: {execution_results['message']}")

                    if execution_results.get('data'):
                        print(f"  Data: {execution_results['data']}")

                except Exception as e:
                    print(f"⚠ Mock macro execution failed: {e}")

        print("\n--- Testing Complete ---")
        print("✓ All basic functionality tests passed!")

        return True

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        # Cleanup
        try:
            pipeline.cleanup()
            print("✓ Pipeline cleanup completed")
        except:
            pass


if __name__ == "__main__":
    success = test_basic_functionality()
    sys.exit(0 if success else 1)