import os
import json
from datetime import datetime
from pathlib import Path
from jinja2 import Template

class ReportGenerator:
    def __init__(self):
        self.template = Template('''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>매크로 실행 보고서 - {{ timestamp }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
            color: white;
        }
        .status.success { background: #28a745; }
        .status.failure { background: #dc3545; }
        .section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .code-block {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            white-space: pre-wrap;
        }
        .log-entry {
            border-left: 3px solid #007bff;
            padding: 10px;
            margin: 10px 0;
            background: #f8f9fa;
        }
        .log-entry.log-error {
            border-color: #dc3545;
            background: #fff5f5;
        }
        .log-entry.log-complete {
            border-color: #28a745;
            background: #f5fff5;
        }
        .timestamp {
            color: #6c757d;
            font-size: 12px;
            margin-right: 10px;
        }
        pre {
            margin: 5px 0;
            white-space: pre-wrap;
        }
        img {
            border: 1px solid #dee2e6;
            border-radius: 4px;
            max-width: 100%;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>매크로 실행 보고서</h1>
        <p><strong>실행 시간:</strong> {{ timestamp }}</p>
        <p><strong>상태:</strong> 
            <span class="status {{ 'success' if success else 'failure' }}">
                {{ '성공' if success else '실패' }}
            </span>
        </p>
        <p><strong>명령:</strong> {{ instruction }}</p>
    </div>
    
    <div class="section">
        <h2>생성된 매크로 코드</h2>
        <div class="code-block">{{ macro_code }}</div>
    </div>
    
    <div class="section">
        <h2>실행 결과</h2>
        {% if success %}
            <p><strong>결과:</strong> {{ result }}</p>
        {% else %}
            <p style="color: red;"><strong>오류:</strong> {{ error }}</p>
        {% endif %}
    </div>
    
    <div class="section">
        <h2>스크린샷</h2>
        {% if screenshots %}
            {% for screenshot in screenshots %}
                <img src="{{ screenshot }}" alt="Screenshot">
            {% endfor %}
        {% else %}
            <p>스크린샷이 없습니다.</p>
        {% endif %}
    </div>
    
    <div class="section">
        <h2>실행 로그</h2>
        {% for log in execution_log %}
            <div class="log-entry log-{{ log.type }}">
                <span class="timestamp">{{ log.timestamp }}</span>
                <span class="type">{{ log.type }}</span>
                <pre>{{ log | tojson(indent=2) }}</pre>
            </div>
        {% endfor %}
    </div>
    
    {% if video_path %}
    <div class="section">
        <h2>비디오 녹화</h2>
        <p><a href="{{ video_path }}">녹화 영상 보기</a></p>
    </div>
    {% endif %}
</body>
</html>
        ''')
    
    def generate_html_report(self, execution_result, instruction, macro_code):
        """HTML 보고서 생성"""
        timestamp = datetime.now().isoformat()
        report_name = f"report_{int(datetime.now().timestamp())}.html"
        
        # 스크린샷 파일 목록
        screenshots = []
        if execution_result.get('screenshots_dir'):
            screenshots_dir = Path(execution_result['screenshots_dir'])
            if screenshots_dir.exists():
                for img_file in screenshots_dir.glob('*.png'):
                    screenshots.append(str(img_file))
        
        # 보고서 생성
        html_content = self.template.render(
            timestamp=timestamp,
            success=execution_result['success'],
            instruction=instruction,
            macro_code=macro_code,
            result=json.dumps(execution_result.get('result')),
            error=execution_result.get('error'),
            screenshots=screenshots,
            execution_log=execution_result['execution_log'],
            video_path=execution_result.get('video_path')
        )
        
        # 보고서 저장
        reports_dir = Path('reports')
        reports_dir.mkdir(exist_ok=True)
        report_path = reports_dir / report_name
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return str(report_path)