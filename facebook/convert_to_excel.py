import pandas as pd
import os

# Read the CSV file
csv_file = 'facebook_tasks_fixed.csv'
excel_file = 'facebook_tasks.xlsx'

try:
    # Read CSV file
    df = pd.read_csv(csv_file)

    # Create Excel writer object with formatting
    with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
        # Write to Excel
        df.to_excel(writer, sheet_name='Facebook_Macro_Tasks', index=False)

        # Get workbook and worksheet
        workbook = writer.book
        worksheet = writer.sheets['Facebook_Macro_Tasks']

        # Adjust column widths
        for column in worksheet.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)  # Cap at 50 characters
            worksheet.column_dimensions[column_letter].width = adjusted_width

        # Set row height for description cells
        for row in worksheet.iter_rows(min_row=2):  # Skip header row
            worksheet.row_dimensions[row[0].row].height = 40

    print(f"Successfully converted {csv_file} to {excel_file}")
    print(f"Excel file created with {len(df)} tasks:")
    print(f"- Malicious tasks: {len(df[df['Task_Type'] == 'Malicious'])}")
    print(f"- Benign tasks: {len(df[df['Task_Type'] == 'Benign'])}")

except ImportError:
    print("pandas and openpyxl are required. Installing...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas", "openpyxl"])

    # Try again after installation
    df = pd.read_csv(csv_file)
    with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Facebook_Macro_Tasks', index=False)

        workbook = writer.book
        worksheet = writer.sheets['Facebook_Macro_Tasks']

        for column in worksheet.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            worksheet.column_dimensions[column_letter].width = adjusted_width

        for row in worksheet.iter_rows(min_row=2):
            worksheet.row_dimensions[row[0].row].height = 40

    print(f"Successfully converted {csv_file} to {excel_file}")

except Exception as e:
    print(f"Error: {e}")
    print("Manual conversion may be needed")