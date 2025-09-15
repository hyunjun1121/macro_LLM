#!/usr/bin/env python3
"""
Final comprehensive analysis of missing model+website+task combinations
"""

import os
import json
from collections import defaultdict
from pathlib import Path

def analyze_gaps():
    """Analyze missing combinations comprehensively"""
    results_dir = Path("E:/Project/web-agent/benchmark_results/data")
    result_files = list(results_dir.glob("result_*.json"))

    # Collect all existing combinations
    existing_combinations = set()
    all_models = set()
    all_websites = set()
    all_tasks = defaultdict(set)

    print(f"Analyzing {len(result_files)} result files...")

    for i, filepath in enumerate(result_files):
        if i % 500 == 0:
            print(f"Processed {i}/{len(result_files)} files")

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

            website = data.get('website')
            task_data = data.get('task', {})
            task_id = task_data.get('id')

            if not website or not task_id:
                continue

            # Skip invalid websites
            if website == '.':
                continue

            # Get models from attempts
            if 'attempts' in data and data['attempts']:
                for attempt in data['attempts']:
                    model = attempt.get('model')
                    if model:
                        all_models.add(model)
                        all_websites.add(website)
                        all_tasks[website].add(task_id)
                        existing_combinations.add((model, website, task_id))

        except Exception as e:
            continue

    print(f"\nFound data:")
    print(f"- {len(all_models)} unique models: {sorted(all_models)}")
    print(f"- {len(all_websites)} unique websites: {sorted(all_websites)}")
    print(f"- {len(existing_combinations)} existing combinations")

    print(f"\nTasks by website:")
    for website in sorted(all_websites):
        tasks = sorted(all_tasks[website])
        print(f"- {website}: {len(tasks)} tasks ({tasks[:5]}...{tasks[-5:] if len(tasks) > 5 else ''})")

    # Define expected tasks based on actual data
    expected_tasks = {
        'Airbnb': [f'TASK_{i:03d}' for i in range(1, 21)],  # TASK_001 to TASK_020
        'Amazon': [f'T{i:03d}' for i in range(1, 21)],      # T001 to T020
        'Threads': [f'G{i:03d}' for i in range(1, 21)],     # G001 to G020 (general tasks)
        'TikTok': [],  # Will determine from actual data
    }

    # Adjust expected tasks based on actual data
    for website in all_websites:
        if website not in expected_tasks:
            expected_tasks[website] = sorted(all_tasks[website])

    # For TikTok, use actual data if available
    if 'TikTok' in all_tasks and all_tasks['TikTok']:
        expected_tasks['TikTok'] = sorted(all_tasks['TikTok'])
    else:
        expected_tasks['TikTok'] = [f'TASK_{i:03d}' for i in range(1, 21)]

    print(f"\nExpected tasks:")
    for website, tasks in expected_tasks.items():
        if website in all_websites:
            print(f"- {website}: {len(tasks)} tasks")

    # Calculate missing combinations
    missing_combinations = defaultdict(lambda: defaultdict(list))
    total_expected = 0
    total_missing = 0

    for model in sorted(all_models):
        for website in sorted(all_websites):
            if website in expected_tasks:
                website_expected_tasks = expected_tasks[website]
                total_expected += len(website_expected_tasks)

                for task_id in website_expected_tasks:
                    if (model, website, task_id) not in existing_combinations:
                        missing_combinations[model][website].append(task_id)
                        total_missing += 1

    total_existing = len(existing_combinations)

    print(f"\n=== SUMMARY STATISTICS ===")
    print(f"Total expected combinations: {total_expected}")
    print(f"Total existing combinations: {total_existing}")
    print(f"Total missing combinations: {total_missing}")
    if total_expected > 0:
        print(f"Completion percentage: {(total_existing / total_expected * 100):.1f}%")

    print(f"\n=== MISSING COMBINATIONS ===")
    for model in sorted(missing_combinations.keys()):
        model_missing = sum(len(tasks) for tasks in missing_combinations[model].values())
        if model_missing > 0:
            print(f"\n- Model: {model}")
            print(f"  Total missing: {model_missing}")
            for website in sorted(missing_combinations[model].keys()):
                tasks = missing_combinations[model][website]
                if tasks:
                    print(f"  Website: {website}")
                    if len(tasks) <= 5:
                        print(f"    Tasks: {tasks}")
                    else:
                        print(f"    Tasks: {tasks[:3]} ... {tasks[-2:]} ({len(tasks)} total)")

    print(f"\n=== COMPLETION BY MODEL ===")
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
    analyze_gaps()