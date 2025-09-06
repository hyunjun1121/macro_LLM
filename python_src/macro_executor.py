import os
import json
import asyncio
from datetime import datetime
from pathlib import Path
from playwright.async_api import async_playwright

class MacroExecutor:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        self.execution_log = []
    
    async def initialize(self):
        """브라우저 초기화"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=False,
            slow_mo=500
        )
        
        # 녹화 디렉토리 생성
        recordings_dir = Path('recordings')
        recordings_dir.mkdir(exist_ok=True)
        
        self.context = await self.browser.new_context(
            record_video_dir=str(recordings_dir)
        )
        self.page = await self.context.new_page()
        
        # 콘솔 로그 수집
        self.page.on('console', lambda msg: self.execution_log.append({
            'type': 'console',
            'level': msg.type,
            'text': msg.text,
            'timestamp': datetime.now().isoformat()
        }))
        
        # 에러 로그 수집
        self.page.on('pageerror', lambda error: self.execution_log.append({
            'type': 'error',
            'message': str(error),
            'timestamp': datetime.now().isoformat()
        }))
    
    async def execute_macro(self, macro_code, html_path):
        """매크로 실행"""
        try:
            await self.initialize()
            
            # 스크린샷 디렉토리 생성
            screenshots_dir = Path('screenshots') / str(int(datetime.now().timestamp()))
            screenshots_dir.mkdir(parents=True, exist_ok=True)
            
            # 파일 URL 생성
            file_url = Path(html_path).absolute().as_uri()
            
            self.execution_log.append({
                'type': 'start',
                'html_path': html_path,
                'file_url': file_url,
                'timestamp': datetime.now().isoformat()
            })
            
            # 매크로 코드 실행
            exec_globals = {
                'page': self.page,
                'file_url': file_url,
                'screenshots_dir': str(screenshots_dir)
            }
            exec(macro_code, exec_globals)
            
            # 매크로 함수가 있다면 실행
            if 'execute_macro' in exec_globals:
                result = await exec_globals['execute_macro'](
                    self.page, file_url, str(screenshots_dir)
                )
            else:
                # 코드 직접 실행
                result = None
            
            self.execution_log.append({
                'type': 'complete',
                'result': result,
                'timestamp': datetime.now().isoformat()
            })
            
            # 최종 스크린샷
            await self.page.screenshot(
                path=str(screenshots_dir / 'final.png'),
                full_page=True
            )
            
            # 비디오 경로 가져오기
            video_path = None
            if self.page.video:
                video = self.page.video
                video_path = await video.path()
            
            return {
                'success': True,
                'result': result,
                'execution_log': self.execution_log,
                'screenshots_dir': str(screenshots_dir),
                'video_path': video_path
            }
            
        except Exception as e:
            self.execution_log.append({
                'type': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            })
            
            return {
                'success': False,
                'error': str(e),
                'execution_log': self.execution_log
            }
        
        finally:
            await self.cleanup()
    
    async def cleanup(self):
        """리소스 정리"""
        if self.page:
            await self.page.close()
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()