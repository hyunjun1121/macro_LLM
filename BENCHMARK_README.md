# 🤖 LLM Web Automation Benchmark System

본 시스템은 LLM이 HTML 코드만을 바탕으로 웹 자동화 매크로를 생성하고 실행하는 능력을 평가하는 벤치마크입니다.

## 🎯 핵심 특징

- **Vision-free 접근**: 스크린샷 없이 순수 HTML/CSS/JavaScript 코드만 분석
- **멀티턴 재시도**: 실패시 최대 5번까지 자동 재시도 (이전 오류 정보 포함)
- **포괄적 로깅**: 실행 과정의 모든 단계를 스크린샷, 비디오, 로그로 기록
- **다양한 웹사이트**: YouTube, Facebook, Instagram, Reddit, Amazon 등
- **자동화된 평가**: 성공률, 시도 횟수, 실행 시간 등 상세 분석

## 🛠 시스템 구조

### 1. Task 추출 (TaskExtractor)
- `.xlsx` 파일에서 매크로 작업 목표 추출
- 각 웹사이트별 task 파일: `{website}/{website}_task.xlsx`

### 2. LLM 매크로 생성 (EnhancedMacroGenerator)
- HTML 구조 분석 및 요소 추출
- 멀티턴 대화로 이전 실패 정보 활용
- 파싱하기 쉬운 출력 형식

### 3. 매크로 실행 (BenchmarkExecutor)
- Playwright 기반 브라우저 자동화
- 실시간 로깅 및 스크린샷 촬영
- 타임아웃 및 오류 처리

### 4. 결과 저장 (ResultStorage)
- JSON 데이터 저장
- HTML 보고서 생성
- 실행 통계 및 분석

## 🚀 사용 방법

### 설정
```bash
# 의존성 설치
npm install

# OpenAI API 키 설정 (.env 파일)
OPENAI_API_KEY=your_openai_api_key_here

# Playwright 브라우저 설치
npx playwright install chromium
```

### 실행 명령어

```bash
# 단일 테스트 (권장: 처음 테스트용)
npm run benchmark:test

# 특정 웹사이트 벤치마크
npm run benchmark:youtube

# 모든 웹사이트 벤치마크
npm run benchmark:all

# 작업 목록 확인
npm run extract-tasks
```

### 고급 실행

```bash
# 특정 웹사이트만, 최대 3개 작업
node src/benchmarkRunner.js "youtube,facebook" 3

# 여러 웹사이트
node src/benchmarkRunner.js "youtube,reddit,Amazon"
```

## 📁 결과 파일 구조

```
benchmark_results/
├── data/                          # JSON 원본 데이터
│   ├── result_youtube_task1.json
│   └── benchmark_report_*.json
├── reports/                       # HTML 보고서
│   └── benchmark_report_*.html
├── screenshots/                   # 실행 과정 스크린샷
│   └── {task_id}_attempt_{n}/
└── recordings/                    # 비디오 녹화
```

## 📊 벤치마크 지표

### 성공률 지표
- **전체 성공률**: 성공한 작업 / 전체 작업
- **웹사이트별 성공률**: 각 사이트별 성능
- **난이도별 성공률**: easy/medium/hard 작업별 분석

### 효율성 지표
- **평균 시도 횟수**: 성공까지 필요한 재시도 횟수
- **실행 시간**: 작업 완료까지 소요 시간
- **첫 시도 성공률**: 재시도 없이 성공한 비율

### 상세 분석
- **실패 원인 분석**: 셀렉터 오류, 타이밍 이슈, 로직 오류 등
- **학습 효과**: 재시도에서 개선되는 패턴
- **웹사이트 복잡도**: 사이트별 난이도 분석

## 🎯 벤치마크 작업 예시

### YouTube 작업들
- 검색창에 특정 키워드 입력
- 비디오 재생 버튼 클릭
- 좋아요 버튼 클릭
- 댓글 작성

### Facebook 작업들
- 로그인 폼 입력
- 게시물 작성
- 친구 검색
- 메시지 보내기

### Amazon 작업들
- 상품 검색
- 장바구니 추가
- 필터 적용
- 리뷰 읽기

## 🔧 설정 옵션

```javascript
const config = {
  maxRetries: 5,           // 최대 재시도 횟수
  timeoutMs: 30000,        // 각 시도별 타임아웃 (30초)
  screenshotOnError: true, // 오류시 스크린샷 촬영
  saveAllLogs: true        // 모든 로그 저장
};
```

## 📈 논문 활용 방안

### 1. LLM 웹 자동화 능력 평가
- 다양한 LLM 모델 비교 (GPT-4, Claude, Gemini 등)
- 프롬프트 엔지니어링 기법 비교
- 컨텍스트 길이가 성능에 미치는 영향

### 2. 웹사이트 복잡도 분석
- HTML 구조 복잡성과 성공률 상관관계
- JavaScript 의존성이 자동화 난이도에 미치는 영향
- 웹 접근성과 자동화 용이성

### 3. Safety & Security 연구
- 악성 자동화 탐지
- 웹사이트 보호 메커니즘 효과
- LLM의 의도하지 않은 행동 패턴

## 🤝 기여 방법

1. 새로운 웹사이트 추가
2. 복잡한 작업 시나리오 작성
3. 평가 지표 개선
4. 다른 LLM 모델 지원

## ⚠️ 주의사항

- 모든 웹사이트는 연구 목적으로 제작된 가상 사이트입니다
- 실제 웹사이트에서 무단 자동화 금지
- API 사용량에 따른 비용 발생 가능
- 브라우저 자동화로 인한 시스템 리소스 사용

## 📝 라이센스

MIT License - 연구 및 교육 목적으로 자유롭게 사용 가능