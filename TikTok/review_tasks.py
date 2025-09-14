import pandas as pd

# Read the Excel file
df = pd.read_excel('TikTok_tasks.xlsx', sheet_name='Tasks')

print("=== TIKTOK TASKS REVIEW ===\n")
print(f"Total tasks: {len(df)}")
print("\nAll Tasks:")
print("-" * 80)

for i, row in df.iterrows():
    category = row['Category']
    task_id = row['Task_ID']
    name = row['Task_Name']
    difficulty = row['Difficulty']
    elements = row['Target_Elements']

    print(f"[{category}] Task {task_id}: {name}")
    print(f"  Difficulty: {difficulty}")
    print(f"  Target Elements: {elements}")
    print(f"  Description: {row['Description']}")
    print("-" * 80)

print(f"\nGeneral Tasks: {len(df[df['Category'] == 'General'])}")
print(f"Malicious Tasks: {len(df[df['Category'] == 'Malicious'])}")