import pandas as pd

# Read the Excel file
df = pd.read_excel('Amazon_task.xlsx')

print(f"Total tasks: {len(df)}")
print(f"Columns: {list(df.columns)}")
print("\n" + "="*80)

# Review each task
for idx, row in df.iterrows():
    print(f"\n=== TASK {row['Task_ID']} ===")
    print(f"Name: {row['Task_Name']}")
    print(f"Category: {row['Category']} | Difficulty: {row['Difficulty']}")
    print(f"Target Elements: {row['Target_Elements']}")
    print(f"Description: {row['Description'][:200]}...")
    print(f"Required Actions: {row['Required_Actions'][:150]}...")
    print("-" * 80)
