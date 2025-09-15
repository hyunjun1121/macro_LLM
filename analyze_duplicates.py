import json
import os
from collections import defaultdict
import re
from datetime import datetime

def analyze_benchmark_duplicates():
    """Analyze benchmark result files for duplicates"""
    data_dir = r"E:\Project\web-agent\benchmark_results\data"

    # Skip benchmark report files, focus on individual result files
    result_files = [f for f in os.listdir(data_dir)
                   if f.startswith('result_') and f.endswith('.json')]

    print(f"Found {len(result_files)} result files to analyze\n")

    # Dictionary to store combinations and their files
    combinations = defaultdict(list)

    # Parse each file
    for filename in result_files:
        try:
            filepath = os.path.join(data_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Extract key information
            website = data.get('website', 'Unknown')
            task_id = data.get('task', {}).get('id', 'Unknown')

            # Extract model from the first attempt (all attempts should use same model)
            model = 'Unknown'
            if data.get('attempts') and len(data['attempts']) > 0:
                model = data['attempts'][0].get('model', 'Unknown')

            # Create combination key
            combination_key = (model, website, task_id)

            # Store file info
            file_info = {
                'filename': filename,
                'timestamp': data.get('timestamp', ''),
                'savedAt': data.get('savedAt', ''),
                'success': data.get('success', False),
                'attempts_count': len(data.get('attempts', [])),
                'total_execution_time': data.get('totalExecutionTime', 0)
            }

            combinations[combination_key].append(file_info)

        except Exception as e:
            print(f"Error parsing {filename}: {e}")

    # Analyze duplicates
    duplicates = {k: v for k, v in combinations.items() if len(v) > 1}

    print(f"=== DUPLICATE ANALYSIS ===")
    print(f"Total unique combinations: {len(combinations)}")
    print(f"Combinations with duplicates: {len(duplicates)}")
    print(f"Total duplicate files: {sum(len(files) - 1 for files in duplicates.values())}")
    print()

    # Show detailed duplicate information
    if duplicates:
        print("=== DETAILED DUPLICATE REPORT ===")
        for (model, website, task_id), files in sorted(duplicates.items()):
            print(f"\n{model} + {website} + {task_id}")
            print(f"  Files: {len(files)}")

            # Sort by timestamp
            files_sorted = sorted(files, key=lambda x: x['timestamp'])

            for i, file_info in enumerate(files_sorted):
                status = "SUCCESS" if file_info['success'] else "FAILED"
                print(f"    {i+1}. {file_info['filename']}")
                print(f"       Timestamp: {file_info['timestamp']}")
                print(f"       Status: {status}")
                print(f"       Attempts: {file_info['attempts_count']}")
                print(f"       Execution Time: {file_info['total_execution_time']}ms")

    # Count by website and model
    print("\n=== DUPLICATION BY WEBSITE ===")
    website_duplicates = defaultdict(int)
    for (model, website, task_id), files in duplicates.items():
        website_duplicates[website] += len(files) - 1

    for website, dup_count in sorted(website_duplicates.items()):
        print(f"{website}: {dup_count} duplicate files")

    print("\n=== DUPLICATION BY MODEL ===")
    model_duplicates = defaultdict(int)
    for (model, website, task_id), files in duplicates.items():
        model_duplicates[model] += len(files) - 1

    for model, dup_count in sorted(model_duplicates.items()):
        print(f"{model}: {dup_count} duplicate files")

    # Check for patterns in duplication
    print("\n=== DUPLICATION PATTERNS ===")

    # Pattern 1: Same timestamp ranges (indicating batch runs)
    timestamp_groups = defaultdict(list)
    for (model, website, task_id), files in duplicates.items():
        for file_info in files:
            # Extract date from timestamp
            if file_info['timestamp']:
                date_part = file_info['timestamp'][:10]  # YYYY-MM-DD
                timestamp_groups[date_part].append((model, website, task_id))

    print("Duplicates by date:")
    for date, combinations in sorted(timestamp_groups.items()):
        if len(combinations) > 1:
            print(f"  {date}: {len(combinations)} duplicate combinations")

    # Pattern 2: Multiple attempts vs multiple runs
    print("\nDuplicate analysis:")
    retry_pattern = 0
    multi_run_pattern = 0

    for (model, website, task_id), files in duplicates.items():
        # Check if files have different number of attempts (indicating retries)
        attempt_counts = [f['attempts_count'] for f in files]
        if len(set(attempt_counts)) > 1:
            retry_pattern += 1
        else:
            multi_run_pattern += 1

    print(f"  Likely retry patterns (different attempt counts): {retry_pattern}")
    print(f"  Likely multiple runs (same attempt counts): {multi_run_pattern}")

    return combinations, duplicates

if __name__ == "__main__":
    combinations, duplicates = analyze_benchmark_duplicates()