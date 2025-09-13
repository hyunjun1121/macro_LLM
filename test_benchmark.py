#!/usr/bin/env python3
"""
Test script for the macro benchmark system
Run this to test the pipeline with a simple task
"""

import os
import sys
import logging
import subprocess
import time
from pathlib import Path

# Add current directory to path for imports
sys.path.append(str(Path(__file__).parent))

from macro_benchmark_system import MacroBenchmarkSystem

def check_prerequisites():
    """Check if all prerequisites are met"""
    print("Checking prerequisites...")

    # Check if Chrome/Chromium is installed
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options

        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        driver = webdriver.Chrome(options=options)
        driver.quit()
        print("✓ Chrome WebDriver is working")
    except Exception as e:
        print(f"✗ Chrome WebDriver issue: {e}")
        print("Please install ChromeDriver and ensure it's in PATH")
        return False

    # Check if YouTube website server is running
    try:
        import requests
        response = requests.get("http://localhost:8080", timeout=5)
        if response.status_code == 200:
            print("✓ YouTube website server is running")
        else:
            print("✗ YouTube website server returned non-200 status")
            return False
    except Exception as e:
        print(f"✗ Cannot reach YouTube website server: {e}")
        print("Please start the server with: cd youtube && python -m http.server 8080")
        return False

    # Check if task file exists
    task_file = Path("youtube/youtube_task.xlsx")
    if task_file.exists():
        print("✓ Task file exists")
    else:
        print("✗ Task file not found")
        return False

    return True

def start_youtube_server():
    """Start the YouTube website server"""
    try:
        youtube_dir = Path("youtube")
        if not youtube_dir.exists():
            print("YouTube directory not found")
            return None

        print("Starting YouTube server...")
        process = subprocess.Popen(
            [sys.executable, "-m", "http.server", "8080"],
            cwd=youtube_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # Wait a moment for server to start
        time.sleep(2)

        # Check if server is running
        try:
            import requests
            response = requests.get("http://localhost:8080", timeout=3)
            if response.status_code == 200:
                print("✓ YouTube server started successfully")
                return process
        except:
            pass

        print("Failed to start YouTube server")
        process.terminate()
        return None

    except Exception as e:
        print(f"Error starting server: {e}")
        return None

def run_simple_test():
    """Run a simple test with one benign task"""
    print("\n" + "="*50)
    print("RUNNING SIMPLE BENCHMARK TEST")
    print("="*50)

    # Initialize benchmark system
    benchmark = MacroBenchmarkSystem()

    try:
        # Read one simple task for testing
        tasks = benchmark.extract_tasks_from_xlsx('youtube')

        if not tasks:
            print("No tasks found!")
            return False

        # Find a simple benign task
        simple_task = None
        for task in tasks:
            if (task.get('Category') == 'Benign' and
                task.get('Difficulty') == 'Easy' and
                'YT_BEN_007' in task.get('Task_ID', '')):  # Keyboard navigation task
                simple_task = task
                break

        if not simple_task:
            # Fallback to first benign task
            for task in tasks:
                if task.get('Category') == 'Benign':
                    simple_task = task
                    break

        if not simple_task:
            print("No suitable test task found!")
            return False

        print(f"Testing with task: {simple_task.get('Task_ID')} - {simple_task.get('Task_Description')[:60]}...")

        # Run the task
        result = benchmark.run_single_task('youtube', simple_task, max_attempts=2)

        # Print results
        print(f"\nTest Results:")
        print(f"Task ID: {result['task_id']}")
        print(f"Success: {result['final_success']}")
        print(f"Attempts: {len(result['attempts'])}")

        for i, attempt in enumerate(result['attempts'], 1):
            print(f"\nAttempt {i}:")
            print(f"  Success: {attempt['execution_result']['success']}")
            if attempt['execution_result']['error_log']:
                print(f"  Errors: {attempt['execution_result']['error_log'][:200]}...")

        # Save test results
        benchmark.experiment_results = [result]
        benchmark.save_results()

        return result['final_success']

    except Exception as e:
        print(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        benchmark.cleanup()

def main():
    """Main test function"""
    print("MACRO BENCHMARK SYSTEM - TEST")
    print("="*40)

    # Check if server is already running
    server_process = None
    server_running = False

    try:
        import requests
        response = requests.get("http://localhost:8080", timeout=2)
        if response.status_code == 200:
            server_running = True
            print("Server is already running")
    except:
        # Start server
        server_process = start_youtube_server()
        if server_process:
            server_running = True

    if not server_running:
        print("Cannot start or reach server. Exiting.")
        return 1

    try:
        # Check prerequisites
        if not check_prerequisites():
            print("\nPrerequisites not met. Please fix the issues above.")
            return 1

        # Run simple test
        success = run_simple_test()

        if success:
            print("\n✓ Test completed successfully!")
            print("The benchmark system is working correctly.")
        else:
            print("\n✗ Test failed.")
            print("Check the logs for details.")

        return 0 if success else 1

    finally:
        # Clean up server if we started it
        if server_process:
            print("Stopping server...")
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_process.kill()

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)