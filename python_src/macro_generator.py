import os
import json
from openai import OpenAI
from bs4 import BeautifulSoup
from pathlib import Path

class MacroGenerator:
    def __init__(self, api_key):
        self.client = OpenAI(api_key=api_key)
    
    def analyze_html(self, html_path):
        """HTML 파일을 분석하여 구조 정보 추출"""
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, 'lxml')
        
        structure = {
            'forms': [],
            'buttons': [],
            'inputs': [],
            'links': []
        }
        
        # Forms 분석
        for form in soup.find_all('form'):
            structure['forms'].append({
                'id': form.get('id'),
                'action': form.get('action'),
                'method': form.get('method')
            })
        
        # Buttons 분석
        for button in soup.find_all(['button', 'input']):
            if button.name == 'input' and button.get('type') != 'submit':
                continue
            structure['buttons'].append({
                'text': button.text.strip() if button.text else button.get('value'),
                'id': button.get('id'),
                'class': ' '.join(button.get('class', [])),
                'type': button.get('type')
            })
        
        # Inputs 분석
        for input_elem in soup.find_all('input'):
            if input_elem.get('type') == 'submit':
                continue
            structure['inputs'].append({
                'name': input_elem.get('name'),
                'id': input_elem.get('id'),
                'type': input_elem.get('type'),
                'placeholder': input_elem.get('placeholder')
            })
        
        # Links 분석
        for link in soup.find_all('a'):
            structure['links'].append({
                'text': link.text.strip(),
                'href': link.get('href'),
                'id': link.get('id')
            })
        
        return html_content, structure
    
    def generate_macro_code(self, instruction, html_path):
        """LLM을 사용하여 매크로 코드 생성"""
        html_content, structure = self.analyze_html(html_path)
        
        prompt = f"""
You are a web automation expert. Generate Python Playwright code to perform the following task:

Task: {instruction}

Page Structure:
{json.dumps(structure, indent=2)}

HTML Content (first 2000 chars):
{html_content[:2000]}

Generate clean, working Python Playwright code that:
1. Opens the HTML file
2. Performs the requested action
3. Includes proper waits and error handling
4. Takes screenshots to document the action
5. Returns the result of the action

Return only the Python code without any markdown formatting or explanation.
The code should be a function that takes page, file_url, and screenshots_dir as parameters.
"""
        
        response = self.client.chat.completions.create(
            model='gpt-4-turbo-preview',
            messages=[{'role': 'user', 'content': prompt}],
            temperature=0.3,
        )
        
        return response.choices[0].message.content