import os
import sys
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from macro_generator import MacroGenerator
from macro_executor import MacroExecutor
from report_generator import ReportGenerator

load_dotenv()

class WebAgent:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.")
        
        self.generator = MacroGenerator(api_key)
        self.executor = MacroExecutor()
        self.reporter = ReportGenerator()
    
    async def run_macro(self, instruction, html_path):
        """매크로 실행 메인 함수"""
        print('=' * 60)
        print(f'📋 작업: {instruction}')
        print(f'📄 대상 HTML: {html_path}')
        print('=' * 60)
        
        try:
            # 1. 매크로 코드 생성
            print('\n1️⃣ LLM으로 매크로 코드 생성 중...')
            macro_code = self.generator.generate_macro_code(instruction, html_path)
            
            # 생성된 코드 저장
            generated_dir = Path('generated')
            generated_dir.mkdir(exist_ok=True)
            code_path = generated_dir / f'macro_{int(datetime.now().timestamp())}.py'
            
            with open(code_path, 'w', encoding='utf-8') as f:
                f.write(macro_code)
            print(f'   ✅ 매크로 코드 저장: {code_path}')
            
            # 2. 매크로 실행
            print('\n2️⃣ 매크로 실행 중...')
            execution_result = await self.executor.execute_macro(macro_code, html_path)
            
            if execution_result['success']:
                print('   ✅ 매크로 실행 성공!')
                print(f'   결과: {execution_result.get("result")}')
            else:
                print('   ❌ 매크로 실행 실패!')
                print(f'   오류: {execution_result.get("error")}')
            
            # 3. 보고서 생성
            print('\n3️⃣ 실행 보고서 생성 중...')
            report_path = self.reporter.generate_html_report(
                execution_result,
                instruction,
                macro_code
            )
            print(f'   ✅ 보고서 저장: {report_path}')
            
            return {
                'success': execution_result['success'],
                'macro_code_path': str(code_path),
                'report_path': report_path,
                'execution_result': execution_result
            }
            
        except Exception as e:
            print(f'❌ 오류 발생: {e}')
            raise

async def main():
    """메인 실행 함수"""
    agent = WebAgent()
    
    # 명령행 인자 처리
    instruction = sys.argv[1] if len(sys.argv) > 1 else "로그인 버튼 클릭하기"
    html_path = sys.argv[2] if len(sys.argv) > 2 else "./facebook/home.html"
    
    try:
        result = await agent.run_macro(instruction, html_path)
        print('\n✨ 작업 완료!')
        print('브라우저에서 보고서 파일을 열어 상세 결과를 확인하세요.')
    except Exception as e:
        print(f'\n💥 치명적 오류: {e}')
        sys.exit(1)

if __name__ == '__main__':
    from datetime import datetime
    asyncio.run(main())