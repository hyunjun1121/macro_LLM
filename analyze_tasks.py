#!/usr/bin/env python3
"""
Task Analysis Script for web-agent project
Analyzes all xlsx task files and provides comprehensive analysis
"""

import pandas as pd
import os
import glob
import json
from pathlib import Path

def analyze_xlsx_file(filepath):
    """Analyze a single xlsx file and extract task information."""
    try:
        # Read the xlsx file
        df = pd.read_excel(filepath, engine='openpyxl')

        # Get basic information
        filename = os.path.basename(filepath)
        website_name = filename.replace('_task.xlsx', '').replace('_tasks.xlsx', '').replace('_Tasks.xlsx', '')

        # Clean column names
        df.columns = df.columns.str.strip()

        analysis = {
            'website': website_name,
            'filepath': filepath,
            'total_tasks': len(df),
            'columns': list(df.columns),
            'tasks': []
        }

        # Analyze each task
        malicious_count = 0
        benign_count = 0
        difficulty_counts = {}
        category_counts = {}

        for index, row in df.iterrows():
            task_data = {}
            for col in df.columns:
                task_data[col] = row[col]

            # Categorize malicious vs benign
            malicious_intent = str(row.get('Malicious_Intent', row.get('Category', ''))).lower()
            if 'yes' in malicious_intent or 'malicious' in malicious_intent:
                malicious_count += 1
                task_data['is_malicious'] = True
            else:
                benign_count += 1
                task_data['is_malicious'] = False

            # Count difficulties
            difficulty = str(row.get('Difficulty', 'Unknown'))
            difficulty_counts[difficulty] = difficulty_counts.get(difficulty, 0) + 1

            # Count categories
            category = str(row.get('Category', row.get('Task_Title', 'Unknown')))
            category_counts[category] = category_counts.get(category, 0) + 1

            analysis['tasks'].append(task_data)

        analysis['malicious_count'] = malicious_count
        analysis['benign_count'] = benign_count
        analysis['difficulty_distribution'] = difficulty_counts
        analysis['category_distribution'] = category_counts

        return analysis

    except Exception as e:
        return {
            'website': os.path.basename(filepath).replace('.xlsx', ''),
            'filepath': filepath,
            'error': str(e),
            'total_tasks': 0,
            'columns': [],
            'tasks': []
        }

def main():
    """Main analysis function."""
    # Find all xlsx files
    xlsx_files = glob.glob('**/*.xlsx', recursive=True)

    # Filter out validation reports and focus on task files
    task_files = [f for f in xlsx_files if 'validation' not in f.lower() and ('task' in f.lower() or 'Task' in f)]

    all_analyses = []

    print(f"Found {len(task_files)} task files to analyze:")
    for filepath in task_files:
        print(f"  - {filepath}")

    print("\n" + "="*80)
    print("DETAILED ANALYSIS BY WEBSITE")
    print("="*80)

    for filepath in task_files:
        print(f"\nAnalyzing: {filepath}")
        analysis = analyze_xlsx_file(filepath)
        all_analyses.append(analysis)

        if 'error' in analysis:
            print(f"ERROR: {analysis['error']}")
            continue

        print(f"Website: {analysis['website']}")
        print(f"Total tasks: {analysis['total_tasks']}")
        print(f"Benign tasks: {analysis['benign_count']}")
        print(f"Malicious tasks: {analysis['malicious_count']}")
        print(f"Columns: {', '.join(analysis['columns'])}")
        print(f"Difficulty distribution: {analysis['difficulty_distribution']}")

        # Show sample tasks
        if analysis['tasks']:
            print("\nSample tasks:")
            for i, task in enumerate(analysis['tasks'][:3]):  # Show first 3 tasks
                task_id = task.get('Task_ID', task.get('ID', f'Task_{i+1}'))
                title = task.get('Task_Title', task.get('Title', task.get('objective', 'No title')))
                difficulty = task.get('Difficulty', task.get('difficulty', 'Unknown'))
                malicious = "MALICIOUS" if task['is_malicious'] else "BENIGN"
                print(f"  {task_id}: {title} [{difficulty}] ({malicious})")

        print("-" * 60)

    # Overall summary
    print("\n" + "="*80)
    print("OVERALL SUMMARY")
    print("="*80)

    total_tasks = sum(a.get('total_tasks', 0) for a in all_analyses)
    total_malicious = sum(a.get('malicious_count', 0) for a in all_analyses)
    total_benign = sum(a.get('benign_count', 0) for a in all_analyses)

    print(f"Total websites analyzed: {len([a for a in all_analyses if 'error' not in a])}")
    print(f"Total tasks across all websites: {total_tasks}")
    print(f"Total benign tasks: {total_benign}")
    print(f"Total malicious tasks: {total_malicious}")

    if total_tasks > 0:
        print(f"Malicious task percentage: {(total_malicious/total_tasks)*100:.1f}%")

    # Save detailed analysis to JSON
    with open('task_analysis_results.json', 'w', encoding='utf-8') as f:
        json.dump(all_analyses, f, indent=2, ensure_ascii=False, default=str)

    print(f"\nDetailed analysis saved to: task_analysis_results.json")

if __name__ == "__main__":
    main()