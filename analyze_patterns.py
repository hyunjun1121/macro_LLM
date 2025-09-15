import json
import os
from collections import defaultdict
from datetime import datetime

def analyze_duplicate_patterns():
    """Analyze patterns in duplicate files to understand why they exist"""
    data_dir = r"E:\Project\web-agent\benchmark_results\data"

    # Skip benchmark report files, focus on individual result files
    result_files = [f for f in os.listdir(data_dir)
                   if f.startswith('result_') and f.endswith('.json')]

    print(f"Analyzing {len(result_files)} result files for duplication patterns\n")

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

            # Extract model from the first attempt
            model = 'Unknown'
            if data.get('attempts') and len(data['attempts']) > 0:
                model = data['attempts'][0].get('model', 'Unknown')

            # Create combination key
            combination_key = (model, website, task_id)

            # Store detailed file info
            file_info = {
                'filename': filename,
                'timestamp': data.get('timestamp', ''),
                'savedAt': data.get('savedAt', ''),
                'success': data.get('success', False),
                'attempts_count': len(data.get('attempts', [])),
                'total_execution_time': data.get('totalExecutionTime', 0),
                'id': data.get('id', '')
            }

            combinations[combination_key].append(file_info)

        except Exception as e:
            print(f"Error parsing {filename}: {e}")

    # Find duplicates
    duplicates = {k: v for k, v in combinations.items() if len(v) > 1}

    print(f"=== DUPLICATION PATTERN ANALYSIS ===")
    print(f"Total combinations: {len(combinations)}")
    print(f"Duplicated combinations: {len(duplicates)}")
    print()

    # Pattern 1: Timestamp clustering - are duplicates run at the same time?
    print("=== PATTERN 1: TIMESTAMP CLUSTERING ===")
    same_second_duplicates = 0
    same_minute_duplicates = 0

    for (model, website, task_id), files in duplicates.items():
        if len(files) <= 1:
            continue

        # Sort by timestamp
        files_sorted = sorted(files, key=lambda x: x['timestamp'])

        # Check if files were created within the same second/minute
        timestamps = [f['timestamp'] for f in files_sorted if f['timestamp']]
        if len(timestamps) >= 2:
            # Parse timestamps and check clustering
            first_time = timestamps[0][:19]  # YYYY-MM-DDTHH:MM:SS
            last_time = timestamps[-1][:19]

            # Same second check
            if first_time == last_time:
                same_second_duplicates += 1

            # Same minute check
            first_minute = first_time[:16]  # YYYY-MM-DDTHH:MM
            last_minute = last_time[:16]
            if first_minute == last_minute:
                same_minute_duplicates += 1

    print(f"Combinations with duplicates in same second: {same_second_duplicates}")
    print(f"Combinations with duplicates in same minute: {same_minute_duplicates}")
    print(f"Total duplicated combinations: {len(duplicates)}")

    # Pattern 2: Filename analysis
    print("\n=== PATTERN 2: FILENAME PATTERNS ===")
    # Look at some duplicate filenames to understand the pattern
    example_combo = list(duplicates.keys())[0]
    example_files = duplicates[example_combo]

    print(f"Example combination: {example_combo}")
    print("Filenames:")
    for file_info in sorted(example_files, key=lambda x: x['filename'])[:5]:
        print(f"  {file_info['filename']}")
        print(f"    ID: {file_info['id']}")
        print(f"    Timestamp: {file_info['timestamp']}")

    # Pattern 3: ID pattern analysis
    print("\n=== PATTERN 3: ID PATTERNS ===")
    id_patterns = defaultdict(int)

    for (model, website, task_id), files in duplicates.items():
        # Check if IDs are different (indicating separate runs)
        ids = [f['id'] for f in files if f['id']]
        unique_ids = len(set(ids))

        if unique_ids == len(files):
            id_patterns['all_unique_ids'] += 1
        elif unique_ids == 1:
            id_patterns['same_id'] += 1
        else:
            id_patterns['mixed_ids'] += 1

    for pattern, count in id_patterns.items():
        print(f"{pattern}: {count} combinations")

    # Pattern 4: Check for concurrent execution indicators
    print("\n=== PATTERN 4: CONCURRENT EXECUTION ANALYSIS ===")

    # Look for cases where multiple files have very close timestamps
    concurrent_patterns = 0

    for (model, website, task_id), files in duplicates.items():
        if len(files) < 2:
            continue

        # Sort by timestamp
        files_sorted = sorted(files, key=lambda x: x['timestamp'])

        # Check if multiple files were started within a few seconds of each other
        timestamps = [f['timestamp'] for f in files_sorted if f['timestamp']]

        if len(timestamps) >= 2:
            try:
                first_dt = datetime.fromisoformat(timestamps[0].replace('Z', '+00:00'))

                # Count how many files started within 10 seconds of the first
                concurrent_count = 0
                for ts in timestamps:
                    dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                    if (dt - first_dt).total_seconds() <= 10:
                        concurrent_count += 1

                if concurrent_count >= 3:  # 3 or more files started within 10 seconds
                    concurrent_patterns += 1
            except:
                pass

    print(f"Combinations with concurrent execution patterns: {concurrent_patterns}")

    # Pattern 5: Check specific high-duplicate cases
    print("\n=== PATTERN 5: HIGH-DUPLICATE CASE ANALYSIS ===")

    # Find combinations with 10+ duplicates
    high_duplicate_cases = [(k, v) for k, v in duplicates.items() if len(v) >= 10]
    high_duplicate_cases.sort(key=lambda x: len(x[1]), reverse=True)

    print(f"Found {len(high_duplicate_cases)} combinations with 10+ duplicate files")

    if high_duplicate_cases:
        # Analyze the top case
        top_case_key, top_case_files = high_duplicate_cases[0]
        print(f"\nTop case: {top_case_key} with {len(top_case_files)} files")

        # Show timestamp distribution
        timestamps = [f['timestamp'] for f in top_case_files if f['timestamp']]
        timestamps.sort()

        print("Timestamp distribution:")
        for i, ts in enumerate(timestamps[:10]):  # Show first 10
            print(f"  {i+1}. {ts}")

        # Check execution times
        exec_times = [f['total_execution_time'] for f in top_case_files]
        print(f"\nExecution times range: {min(exec_times)}ms - {max(exec_times)}ms")
        print(f"Average execution time: {sum(exec_times)/len(exec_times):.0f}ms")

if __name__ == "__main__":
    analyze_duplicate_patterns()