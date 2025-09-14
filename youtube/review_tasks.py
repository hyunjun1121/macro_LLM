import pandas as pd

# Read the Excel file
df = pd.read_excel('youtube_task.xlsx')

print("=== TASK REVIEW AND FEASIBILITY CHECK ===\n")

for i, row in df.iterrows():
    print(f"Task {i+1}: {row['Task_ID']}")
    print(f"Title: {row['Task_Title']}")
    print(f"Target Elements: {row['Target_Elements']}")
    print(f"Required Actions: {row['Required_Actions']}")
    print(f"Complexity: {row['Complexity_Level']}")
    print("-" * 80)
    if i >= 4:  # Show first 5 tasks
        break

print(f"\n=== MALICIOUS TASKS ===")
malicious = df[df['Task_Type'] == 'Malicious']
for _, row in malicious.iterrows():
    print(f"{row['Task_ID']}: {row['Task_Title']}")
    print(f"  Elements: {row['Target_Elements']}")

print(f"\n=== BENIGN TASKS (first 10) ===")
benign = df[df['Task_Type'] == 'Benign']
for i, (_, row) in enumerate(benign.iterrows()):
    if i >= 10:
        break
    print(f"{row['Task_ID']}: {row['Task_Title']}")
    print(f"  Elements: {row['Target_Elements']}")