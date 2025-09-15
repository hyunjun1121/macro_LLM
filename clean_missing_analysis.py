#!/usr/bin/env python3
"""
Clean analysis focusing on the main task sets that matter for benchmarking
"""

import os
import json
from collections import defaultdict
from pathlib import Path

def clean_analysis():
    """Focus on the main benchmark tasks that actually matter"""
    results_dir = Path("E:/Project/web-agent/benchmark_results/data")
    result_files = list(results_dir.glob("result_*.json"))

    # Collect all existing combinations
    existing_combinations = set()
    all_models = set()
    platform_data = defaultdict(lambda: defaultdict(set))

    print(f"Analyzing {len(result_files)} result files...")

    for i, filepath in enumerate(result_files):
        if i % 1000 == 0:
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
                        platform_data[website]['tasks'].add(task_id)
                        platform_data[website]['models'].add(model)
                        existing_combinations.add((model, website, task_id))

        except Exception as e:
            continue

    # Define expected core task sets (the important ones for benchmarking)
    core_expected_tasks = {
        'Airbnb': [f'TASK_{i:03d}' for i in range(1, 21)],      # 20 tasks: TASK_001 to TASK_020
        'Amazon': [f'T{i:03d}' for i in range(1, 21)],          # 20 tasks: T001 to T020
        'Threads': [f'G{i:03d}' for i in range(1, 21)],         # 20 tasks: G001 to G020 (assuming general tasks)
        'youtube': [f'YT_BEN_{i:03d}' for i in range(1, 20)],   # 19 tasks based on actual data
    }

    # Add other tasks based on patterns found in results
    if 'youtube' in platform_data:
        actual_youtube_tasks = [t for t in platform_data['youtube']['tasks'] if t.startswith('YT_')]
        if actual_youtube_tasks:
            core_expected_tasks['youtube'] = sorted(actual_youtube_tasks)

    print(f"\n=== BENCHMARK ANALYSIS RESULTS ===")
    print(f"Found {len(all_models)} models:")
    for model in sorted(all_models):
        print(f"  - {model}")

    print(f"\nCore platforms and their expected tasks:")
    total_core_combinations = 0
    for platform, tasks in core_expected_tasks.items():
        print(f"  - {platform}: {len(tasks)} tasks")
        total_core_combinations += len(tasks) * len(all_models)

    # Calculate missing combinations for core platforms
    missing_combinations = defaultdict(lambda: defaultdict(list))
    total_existing_core = 0
    total_missing_core = 0

    for model in all_models:
        for platform, expected_tasks in core_expected_tasks.items():
            for task_id in expected_tasks:
                if (model, platform, task_id) in existing_combinations:
                    total_existing_core += 1
                else:
                    missing_combinations[model][platform].append(task_id)
                    total_missing_core += 1

    print(f"\n=== CORE BENCHMARK STATISTICS ===")
    print(f"Total expected core combinations: {total_core_combinations}")
    print(f"Total existing core combinations: {total_existing_core}")
    print(f"Total missing core combinations: {total_missing_core}")
    if total_core_combinations > 0:
        completion = (total_existing_core / total_core_combinations * 100)
        print(f"Core completion percentage: {completion:.1f}%")

    print(f"\n=== MISSING CORE COMBINATIONS ===")
    for model in sorted(missing_combinations.keys()):
        model_missing = sum(len(tasks) for tasks in missing_combinations[model].values())
        if model_missing > 0:
            print(f"\n- Model: {model}")
            print(f"  Total missing: {model_missing}")
            for platform in sorted(missing_combinations[model].keys()):
                tasks = missing_combinations[model][platform]
                if tasks:
                    print(f"  Website: {platform}")
                    if len(tasks) <= 10:
                        print(f"    Tasks: {tasks}")
                    else:
                        print(f"    Tasks: {tasks[:5]} ... {tasks[-5:]} ({len(tasks)} total)")

    print(f"\n=== CORE COMPLETION BY MODEL ===")
    for model in sorted(all_models):
        model_expected = 0
        model_existing = 0

        for platform, expected_tasks in core_expected_tasks.items():
            for task in expected_tasks:
                model_expected += 1
                if (model, platform, task) in existing_combinations:
                    model_existing += 1

        if model_expected > 0:
            completion = (model_existing / model_expected * 100)
            print(f"  {model}: {model_existing}/{model_expected} ({completion:.1f}%)")

    # Additional summary of what extra experiments are running
    print(f"\n=== ADDITIONAL PLATFORM COVERAGE ===")
    extra_platforms = set(platform_data.keys()) - set(core_expected_tasks.keys())
    for platform in sorted(extra_platforms):
        task_count = len(platform_data[platform]['tasks'])
        models_count = len(platform_data[platform]['models'])
        print(f"  - {platform}: {task_count} tasks across {models_count} models")

if __name__ == "__main__":
    clean_analysis()