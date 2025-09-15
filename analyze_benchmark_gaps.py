#!/usr/bin/env python3
"""
Analyze benchmark result files to identify missing model+website+task combinations
"""

import os
import json
import re
from collections import defaultdict, Counter
import pandas as pd
from pathlib import Path

def extract_info_from_filename(filename):
    """Extract model, website, and task info from result filename"""
    # Pattern for result files: result_{website}_{task}_{timestamp}.json
    if not filename.startswith('result_') or not filename.endswith('.json'):
        return None, None, None

    # Remove result_ prefix and .json suffix
    name_part = filename[7:-5]  # remove "result_" and ".json"

    # Split by underscore and try to identify parts
    parts = name_part.split('_')

    if len(parts) < 3:
        return None, None, None

    # For most files: website_task_timestamp
    website = parts[0]
    task = parts[1]

    # Handle special cases
    if website == '.':  # Threads case: result_._Threads_Tasks_...
        if len(parts) >= 4 and parts[2] == 'Threads':
            website = 'Threads'
            task = parts[3]  # 'Tasks' or similar

    return None, website, task  # model info not in filename, need to extract from file content

def extract_model_from_content(filepath):
    """Extract model name from result file content"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Look for model info in various possible fields
        if 'model' in data:
            return data['model']
        elif 'modelName' in data:
            return data['modelName']
        elif 'config' in data and 'model' in data['config']:
            return data['config']['model']
        elif 'attempts' in data and isinstance(data['attempts'], list) and len(data['attempts']) > 0:
            # Look in attempts for model info
            for attempt in data['attempts']:
                if 'model' in attempt:
                    return attempt['model']
                elif 'modelName' in attempt:
                    return attempt['modelName']
        elif 'results' in data and isinstance(data['results'], list) and len(data['results']) > 0:
            if 'model' in data['results'][0]:
                return data['results'][0]['model']
    except:
        pass
    return None

def get_task_lists_from_files():
    """Read task lists from Excel/CSV/JSON files in each platform directory"""
    task_lists = {}
    base_dir = Path("E:/Project/web-agent")

    # Define expected tasks based on result files analysis
    # From git status and file analysis, we can see these platforms
    platform_task_configs = {
        'Airbnb': {
            'files': ['airbnb_tasks_improved.csv'],
            'task_pattern': 'TASK_',
            'count': 20  # TASK_001 to TASK_020 based on CSV
        },
        'Amazon': {
            'files': ['Amazon_task_improved.xlsx'],
            'task_pattern': 'T',
            'count': 20  # T001 to T020 based on result files
        },
        'Threads': {
            'files': ['threads_improved_tasks.json'],
            'task_pattern': 'G',
            'count': 20  # G001 to G020 based on JSON content
        },
        'TikTok': {
            'files': ['improved_tasks.json'],
            'task_pattern': 'TASK_',
            'count': 20  # Based on similar pattern
        }
    }

    for platform, config in platform_task_configs.items():
        platform_path = base_dir / platform
        if not platform_path.exists():
            continue

        tasks = set()

        # Try CSV files first
        for file_path in platform_path.glob("*task*.csv"):
            try:
                df = pd.read_csv(file_path)
                possible_cols = ['Task_ID', 'Task ID', 'TaskID', 'task_id', 'ID', 'Task', 'task']
                task_col = None

                for col in possible_cols:
                    if col in df.columns:
                        task_col = col
                        break

                if task_col:
                    for task_id in df[task_col].dropna():
                        tasks.add(str(task_id).strip())

                print(f"Found {len(tasks)} tasks in {file_path}")
                break

            except Exception as e:
                print(f"Error reading {file_path}: {e}")

        # Try JSON files
        if not tasks:
            for file_path in platform_path.glob("*task*.json"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    # Extract task IDs from JSON structure
                    if 'improved_tasks' in data:
                        if 'general_tasks' in data['improved_tasks']:
                            for task in data['improved_tasks']['general_tasks']:
                                if 'task_id' in task:
                                    tasks.add(task['task_id'])
                        if 'malicious_tasks' in data['improved_tasks']:
                            for task in data['improved_tasks']['malicious_tasks']:
                                if 'task_id' in task:
                                    tasks.add(task['task_id'])

                    print(f"Found {len(tasks)} tasks in {file_path}")
                    break

                except Exception as e:
                    print(f"Error reading {file_path}: {e}")

        # If no files worked, generate expected task IDs based on pattern
        if not tasks:
            pattern = config['task_pattern']
            count = config['count']

            if pattern == 'TASK_':
                # TASK_001, TASK_002, ..., TASK_020
                for i in range(1, count + 1):
                    tasks.add(f"TASK_{i:03d}")
            elif pattern == 'T':
                # T001, T002, ..., T020
                for i in range(1, count + 1):
                    tasks.add(f"T{i:03d}")
            elif pattern == 'G':
                # G001, G002, ..., G020
                for i in range(1, count + 1):
                    tasks.add(f"G{i:03d}")

            print(f"Generated {len(tasks)} expected tasks for {platform}")

        if tasks:
            task_lists[platform] = sorted(list(tasks))

    return task_lists

def analyze_benchmark_results():
    """Main analysis function"""
    results_dir = Path("E:/Project/web-agent/benchmark_results/data")

    if not results_dir.exists():
        print(f"Results directory not found: {results_dir}")
        return

    # Get all result files
    result_files = list(results_dir.glob("result_*.json"))
    benchmark_reports = list(results_dir.glob("benchmark_report_*.json"))

    print(f"Found {len(result_files)} result files and {len(benchmark_reports)} benchmark reports")

    # Analyze result files
    all_models = set()
    all_websites = set()
    existing_combinations = set()

    print("Analyzing individual result files...")
    for i, filepath in enumerate(result_files):
        if i % 100 == 0:
            print(f"  Processed {i}/{len(result_files)} files")

        # Extract info from filename
        _, website, task = extract_info_from_filename(filepath.name)

        if not website or not task:
            continue

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Extract website and task from content (more reliable)
            if 'website' in data:
                website = data['website']
            if 'task' in data and 'id' in data['task']:
                task = data['task']['id']

            # Extract model from attempts
            if 'attempts' in data and data['attempts']:
                for attempt in data['attempts']:
                    if 'model' in attempt:
                        model = attempt['model']
                        all_models.add(model)
                        all_websites.add(website)
                        existing_combinations.add((model, website, task))

        except Exception as e:
            continue

    # Also analyze benchmark report files for additional model info
    print("Analyzing benchmark report files...")
    for filepath in benchmark_reports:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Extract results from benchmark reports
            if 'results' in data:
                for result in data['results']:
                    model = result.get('model') or result.get('modelName')
                    website = result.get('website') or result.get('platform')
                    task = result.get('task') or result.get('taskId')

                    if model and website and task:
                        all_models.add(model)
                        all_websites.add(website)
                        existing_combinations.add((model, website, task))

        except Exception as e:
            print(f"Error reading {filepath}: {e}")

    print(f"Found {len(all_models)} unique models:")
    for model in sorted(all_models):
        print(f"  - {model}")

    print(f"\nFound {len(all_websites)} unique websites:")
    for website in sorted(all_websites):
        print(f"  - {website}")

    # Get expected task lists
    print("\nReading expected task lists...")
    expected_tasks = get_task_lists_from_files()

    print("Expected tasks by platform:")
    for platform, tasks in expected_tasks.items():
        print(f"  {platform}: {len(tasks)} tasks")
        print(f"    {tasks[:5]}{'...' if len(tasks) > 5 else ''}")

    # Calculate missing combinations
    print("\nCalculating missing combinations...")
    total_expected = 0
    missing_combinations = defaultdict(lambda: defaultdict(list))

    for model in sorted(all_models):
        for website in sorted(all_websites):
            if website in expected_tasks:
                expected_task_list = expected_tasks[website]
                total_expected += len(expected_task_list)

                for task in expected_task_list:
                    if (model, website, task) not in existing_combinations:
                        missing_combinations[model][website].append(task)

    total_existing = len(existing_combinations)
    total_missing = sum(len(tasks) for website_tasks in missing_combinations.values()
                       for tasks in website_tasks.values())

    print(f"\nSUMMARY STATISTICS:")
    print(f"Total expected combinations: {total_expected}")
    print(f"Total existing combinations: {total_existing}")
    print(f"Total missing combinations: {total_missing}")
    print(f"Completion percentage: {(total_existing / total_expected * 100):.1f}%")

    # Print missing combinations
    print(f"\nMISSING COMBINATIONS:")
    for model in sorted(missing_combinations.keys()):
        model_missing = sum(len(tasks) for tasks in missing_combinations[model].values())
        if model_missing > 0:
            print(f"\n- Model: {model}")
            print(f"  Total missing: {model_missing}")
            for website in sorted(missing_combinations[model].keys()):
                tasks = missing_combinations[model][website]
                if tasks:
                    print(f"  Website: {website}")
                    print(f"    Tasks: {tasks}")

    # Completion by model
    print(f"\nCOMPLETION BY MODEL:")
    for model in sorted(all_models):
        model_expected = 0
        model_existing = 0

        for website in all_websites:
            if website in expected_tasks:
                for task in expected_tasks[website]:
                    model_expected += 1
                    if (model, website, task) in existing_combinations:
                        model_existing += 1

        if model_expected > 0:
            completion = (model_existing / model_expected * 100)
            print(f"  {model}: {model_existing}/{model_expected} ({completion:.1f}%)")

if __name__ == "__main__":
    analyze_benchmark_results()