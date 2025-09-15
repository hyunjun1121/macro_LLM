#!/usr/bin/env python3
"""
Sample a few result files to understand the actual structure
"""

import os
import json
from pathlib import Path

def sample_result_files():
    """Sample a few result files to understand their structure"""
    results_dir = Path("E:/Project/web-agent/benchmark_results/data")
    result_files = list(results_dir.glob("result_*.json"))

    # Sample files from different platforms
    samples = {}
    for filepath in result_files[:50]:  # Just sample first 50
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

            website = data.get('website', 'unknown')
            task_id = data.get('task', {}).get('id', 'unknown')

            # Get model from attempts
            models = set()
            if 'attempts' in data and data['attempts']:
                for attempt in data['attempts']:
                    if 'model' in attempt:
                        models.add(attempt['model'])

            if website not in samples:
                samples[website] = {'tasks': set(), 'models': set()}

            samples[website]['tasks'].add(task_id)
            samples[website]['models'].update(models)

        except Exception as e:
            continue

    # Print samples
    for website, info in samples.items():
        print(f"\n=== {website} ===")
        print(f"Tasks found: {sorted(list(info['tasks']))[:10]}...")
        print(f"Models: {info['models']}")

if __name__ == "__main__":
    sample_result_files()