import pandas as pd
import re
import os

# Read the Excel file
df = pd.read_excel('youtube_task.xlsx')

# Read all code files
code_files = ['index.html', 'script.js', 'router.js', 'comments.js', 'playlists.js', 'upload.js', 'data.js', 'styles.css']
code_content = {}

for file in code_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            code_content[file] = f.read()

print("=== TASK FEASIBILITY ANALYSIS ===\n")

def check_elements_exist(target_elements_str, code_content):
    """Check if the target elements exist in the codebase"""
    # Parse target elements (remove quotes and split by comma)
    elements = [elem.strip().strip("'\"") for elem in target_elements_str.split(',')]
    found_elements = {}

    for element in elements:
        found_elements[element] = False
        # Check in each file
        for filename, content in code_content.items():
            # Check for class names, IDs, and data attributes
            if (element.replace('.', '') in content or
                element.replace('[', '\\[').replace(']', '\\]') in content or
                element in content):
                found_elements[element] = True
                break

    return found_elements

# Analyze each task
issues_found = []
total_issues = 0

for i, row in df.iterrows():
    task_id = row['Task_ID']
    task_title = row['Task_Title']
    target_elements = row['Target_Elements']

    print(f"TASK: {task_id} - {task_title}")
    print(f"Target Elements: {target_elements}")

    # Check element feasibility
    element_check = check_elements_exist(target_elements, code_content)

    missing_elements = [elem for elem, found in element_check.items() if not found]

    if missing_elements:
        print(f"[X] MISSING ELEMENTS: {missing_elements}")
        issues_found.append({
            'task_id': task_id,
            'task_title': task_title,
            'missing_elements': missing_elements,
            'all_elements': list(element_check.keys())
        })
        total_issues += len(missing_elements)
    else:
        print("[OK] All elements found in codebase")

    # Check for specific functionality requirements
    required_actions = row['Required_Actions'].lower()

    # Check for specific functionality concerns
    concerns = []

    if 'switch between accounts' in required_actions:
        concerns.append("Account switching functionality not implemented")

    if 'download thumbnails' in required_actions:
        concerns.append("Thumbnail download functionality not implemented")

    if 'export to csv' in required_actions:
        concerns.append("CSV export functionality not implemented")

    if 'notification' in required_actions and 'notification' not in ' '.join(code_content.values()).lower():
        concerns.append("Notification system may be limited")

    if concerns:
        print(f"[!] CONCERNS: {'; '.join(concerns)}")

    print("-" * 80)

print(f"\n=== SUMMARY ===")
print(f"Total tasks analyzed: {len(df)}")
print(f"Tasks with missing elements: {len(issues_found)}")
print(f"Total missing elements: {total_issues}")

if issues_found:
    print(f"\n=== TASKS NEEDING ATTENTION ===")
    for issue in issues_found:
        print(f"[X] {issue['task_id']}: {issue['task_title']}")
        print(f"   Missing: {', '.join(issue['missing_elements'])}")

print(f"\n=== MOST COMMONLY MISSING ELEMENTS ===")
all_missing = []
for issue in issues_found:
    all_missing.extend(issue['missing_elements'])

from collections import Counter
missing_counter = Counter(all_missing)
for element, count in missing_counter.most_common(10):
    print(f"{element}: {count} tasks")