import asyncio
from pathlib import Path
from main import WebAgent

async def run_tests():
    """테스트 케이스 실행"""
    agent = WebAgent()
    
    test_cases = [
        {
            'name': 'Facebook 로그인 테스트',
            'instruction': 'Facebook 페이지에서 로그인 버튼을 찾아 클릭하세요',
            'html_path': Path('..') / 'facebook' / 'home.html'
        },
        {
            'name': 'Instagram 검색 테스트',
            'instruction': '검색창을 찾아서 "nature photography"를 입력하세요',
            'html_path': Path('..') / 'instagram' / 'index.html'
        },
        {
            'name': 'YouTube 비디오 테스트',
            'instruction': '첫 번째 비디오 썸네일을 클릭하세요',
            'html_path': Path('..') / 'youtube' / 'index.html'
        },
        {
            'name': 'Reddit 네비게이션 테스트',
            'instruction': '프로필 링크를 클릭하세요',
            'html_path': Path('..') / 'reddit' / 'index.html'
        }
    ]
    
    print('🧪 웹 에이전트 테스트 시작\n')
    print('=' * 70)
    
    for test in test_cases:
        print(f'\n📝 테스트: {test["name"]}')
        print('-' * 50)
        
        try:
            result = await agent.run_macro(
                test['instruction'],
                str(test['html_path'])
            )
            
            if result['success']:
                print(f'✅ {test["name"]} - 통과')
            else:
                print(f'❌ {test["name"]} - 실패')
        except Exception as e:
            print(f'💥 {test["name"]} - 오류: {e}')
        
        print('-' * 50)
    
    print('\n🎯 모든 테스트 완료!')
    print('reports 폴더에서 상세한 실행 보고서를 확인하세요.')

if __name__ == '__main__':
    asyncio.run(run_tests())