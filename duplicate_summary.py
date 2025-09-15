import json
import os
from collections import defaultdict

def analyze_duplicates_summary():
    """Analyze benchmark result files for duplicates - summary version"""
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
                'success': data.get('success', False),
                'attempts_count': len(data.get('attempts', []))
            }

            combinations[combination_key].append(file_info)

        except Exception as e:
            print(f"Error parsing {filename}: {e}")

    # Analyze duplicates
    duplicates = {k: v for k, v in combinations.items() if len(v) > 1}

    print(f"=== DUPLICATE ANALYSIS SUMMARY ===")
    print(f"Total unique combinations: {len(combinations)}")
    print(f"Combinations with duplicates: {len(duplicates)}")
    print(f"Total duplicate files: {sum(len(files) - 1 for files in duplicates.values())}")
    print()

    # Count by website
    print("=== DUPLICATES BY WEBSITE ===")
    website_stats = defaultdict(lambda: {'combinations': 0, 'duplicate_files': 0})
    for (model, website, task_id), files in duplicates.items():
        website_stats[website]['combinations'] += 1
        website_stats[website]['duplicate_files'] += len(files) - 1

    for website, stats in sorted(website_stats.items()):
        print(f"{website}: {stats['combinations']} combinations, {stats['duplicate_files']} duplicate files")

    # Count by model
    print("\n=== DUPLICATES BY MODEL ===")
    model_stats = defaultdict(lambda: {'combinations': 0, 'duplicate_files': 0})
    for (model, website, task_id), files in duplicates.items():
        model_stats[model]['combinations'] += 1
        model_stats[model]['duplicate_files'] += len(files) - 1

    for model, stats in sorted(model_stats.items()):
        print(f"{model}: {stats['combinations']} combinations, {stats['duplicate_files']} duplicate files")

    # Find extreme duplicates
    print("\n=== EXTREME DUPLICATES (10+ files) ===")
    extreme_duplicates = [(k, v) for k, v in duplicates.items() if len(v) >= 10]
    extreme_duplicates.sort(key=lambda x: len(x[1]), reverse=True)

    for (model, website, task_id), files in extreme_duplicates[:10]:  # Top 10
        print(f"{model} + {website} + {task_id}: {len(files)} files")

    # Check success rates
    print("\n=== SUCCESS RATE ANALYSIS ===")
    total_success = 0
    total_files = 0
    success_by_attempts = defaultdict(lambda: {'success': 0, 'total': 0})

    for combination_key, files in combinations.items():
        for file_info in files:
            total_files += 1
            if file_info['success']:
                total_success += 1

            attempts = file_info['attempts_count']
            success_by_attempts[attempts]['total'] += 1
            if file_info['success']:
                success_by_attempts[attempts]['success'] += 1

    print(f"Overall success rate: {total_success}/{total_files} ({100*total_success/total_files:.1f}%)")

    print("\nSuccess rate by number of attempts:")
    for attempts in sorted(success_by_attempts.keys()):
        stats = success_by_attempts[attempts]
        rate = 100 * stats['success'] / stats['total'] if stats['total'] > 0 else 0
        print(f"  {attempts} attempts: {stats['success']}/{stats['total']} ({rate:.1f}%)")

    return combinations, duplicates

if __name__ == "__main__":
    combinations, duplicates = analyze_duplicates_summary()