#!/usr/bin/env python3
"""
Amazon Website Completeness Check
Verifies all required files and dependencies are present
"""

import os
import re
from pathlib import Path

def check_file_completeness():
    """Check if all required files are present and properly referenced"""
    
    print("🔍 AMAZON WEBSITE COMPLETENESS CHECK")
    print("=" * 50)
    
    # Define required files
    required_files = {
        'index.html': 'Main HTML file',
        'styles.css': 'CSS stylesheet', 
        'script.js': 'Main JavaScript file',
        'data.js': 'Data definitions',
        'README.md': 'Documentation',
        'Amazon_task.xlsx': 'Macro tasks',
        'Amazon_task_validation_report.xlsx': 'Validation report'
    }
    
    issues = []
    all_good = []
    
    # Check file existence
    print("\n📁 FILE EXISTENCE CHECK:")
    for filename, description in required_files.items():
        if os.path.exists(filename):
            print(f"  ✅ {filename:<40} - {description}")
            all_good.append(filename)
        else:
            print(f"  ❌ {filename:<40} - MISSING: {description}")
            issues.append(f"Missing file: {filename}")
    
    # Check HTML file references
    print("\n🔗 HTML REFERENCE CHECK:")
    if os.path.exists('index.html'):
        with open('index.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Check CSS reference
        if 'href="styles.css"' in html_content:
            print("  ✅ styles.css reference found")
        else:
            print("  ❌ styles.css reference missing")
            issues.append("HTML missing styles.css reference")
        
        # Check JS references
        if 'src="data.js"' in html_content:
            print("  ✅ data.js reference found")
        else:
            print("  ❌ data.js reference missing")
            issues.append("HTML missing data.js reference")
            
        if 'src="script.js"' in html_content:
            print("  ✅ script.js reference found")
        else:
            print("  ❌ script.js reference missing")
            issues.append("HTML missing script.js reference")
        
        # Check Font Awesome CDN
        if 'font-awesome' in html_content:
            print("  ✅ Font Awesome CDN reference found")
        else:
            print("  ❌ Font Awesome CDN reference missing")
            issues.append("HTML missing Font Awesome CDN")
    
    # Check JavaScript function dependencies
    print("\n🔧 JAVASCRIPT DEPENDENCY CHECK:")
    if os.path.exists('script.js') and os.path.exists('index.html'):
        
        # Extract onclick functions from HTML
        with open('index.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        onclick_pattern = r'onclick="(\w+)\([^"]*\)'
        onclick_functions = re.findall(onclick_pattern, html_content)
        onclick_functions = list(set(onclick_functions))  # Remove duplicates
        
        # Check if functions exist in script.js
        with open('script.js', 'r', encoding='utf-8') as f:
            js_content = f.read()
        
        for func_name in onclick_functions:
            if f'function {func_name}(' in js_content:
                print(f"  ✅ {func_name}() function found")
            else:
                print(f"  ❌ {func_name}() function missing")
                issues.append(f"JavaScript function missing: {func_name}()")
    
    # Check data.js variables in script.js
    print("\n📊 DATA VARIABLE CHECK:")
    if os.path.exists('data.js') and os.path.exists('script.js'):
        
        with open('data.js', 'r', encoding='utf-8') as f:
            data_content = f.read()
        
        with open('script.js', 'r', encoding='utf-8') as f:
            script_content = f.read()
        
        # Extract variable definitions from data.js
        var_pattern = r'(?:const|let|var)\s+(\w+)\s*='
        data_variables = re.findall(var_pattern, data_content)
        
        critical_vars = ['allProducts', 'junProfile', 'junProducts', 'junReviews', 
                        'cart', 'wishlist', 'categories', 'orderHistory']
        
        for var_name in critical_vars:
            if var_name in script_content:
                print(f"  ✅ {var_name} variable used in script.js")
            else:
                print(f"  ❌ {var_name} variable not used in script.js")
                issues.append(f"Data variable not used: {var_name}")
    
    # Check external image links
    print("\n🖼️  EXTERNAL RESOURCE CHECK:")
    if os.path.exists('index.html'):
        with open('index.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Count external image references
        external_images = re.findall(r'src="https?://[^"]+\.(jpg|jpeg|png|gif|webp)"', html_content)
        if external_images:
            print(f"  ✅ {len(external_images)} external images referenced")
            print("  ℹ️  Note: External images require internet connection")
        else:
            print("  ⚠️  No external images found")
    
    # Final summary
    print(f"\n📋 SUMMARY:")
    print(f"  Files checked: {len(required_files)}")
    print(f"  Files present: {len(all_good)}")
    print(f"  Issues found: {len(issues)}")
    
    if issues:
        print("\n❌ ISSUES DETECTED:")
        for issue in issues:
            print(f"  - {issue}")
        print("\n🚨 Website may not function correctly!")
        return False
    else:
        print("\n🎉 ALL CHECKS PASSED!")
        print("  ✅ All required files present")
        print("  ✅ All references properly linked")
        print("  ✅ All functions properly defined")
        print("  ✅ All data variables properly used")
        print("\n✨ Website is COMPLETE and ready for use!")
        return True

if __name__ == "__main__":
    success = check_file_completeness()
    exit(0 if success else 1)
