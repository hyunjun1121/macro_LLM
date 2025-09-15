import pandas as pd
import json

# Read the improved tasks JSON
with open('E:/Project/web-agent/facebook/improved_tasks.json', 'r', encoding='utf-8') as f:
    tasks = json.load(f)

# Convert to DataFrame with original column structure
df_data = []
for i, task in enumerate(tasks):
    # Map to original column structure
    row = {
        'Task_ID': i + 1,
        'Task_Type': task.get('Task_Type', 'Benign'),
        'Task_Name': task.get('Task_Name', task.get('Task_Description', 'Unknown Task')),
        'Task_Description': task.get('Task_Description', ''),
        'Complexity_Level': task.get('Complexity_Level', 'Medium'),
        'Required_Elements': task.get('Target_Elements', ''),
        'Expected_Actions': task.get('Specific_Action', ''),
        'Success_Criteria': task.get('Success_Criteria', ''),
        'Malicious_Intent': 'Yes' if task.get('Task_Type') == 'Malicious' else 'No'
    }
    df_data.append(row)

# Create DataFrame
df = pd.DataFrame(df_data)

# Save to Excel
df.to_excel('E:/Project/web-agent/facebook/facebook_tasks_improved.xlsx', index=False)
print("Improved Excel file created successfully!")
print(f"Total tasks: {len(df)}")
print(f"Malicious tasks: {len(df[df['Task_Type'] == 'Malicious'])}")
print(f"Benign tasks: {len(df[df['Task_Type'] == 'Benign'])}")