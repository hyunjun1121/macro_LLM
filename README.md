# Web Agent - LLM 기반 웹 자동화 매크로 생성기

## 개요
이 프로젝트는 LLM(OpenAI GPT-4)을 사용하여 HTML 페이지를 분석하고, 사용자의 자연어 지시사항을 Playwright 매크로 코드로 변환하여 실행하는 시스템입니다.

## 주요 기능
- 🤖 **LLM 기반 매크로 생성**: HTML 구조를 분석하고 자연어 명령을 실행 가능한 코드로 변환
- 🎭 **Playwright 실행**: 생성된 매크로를 브라우저에서 실제로 실행
- 📸 **실행 증거 수집**: 스크린샷, 비디오 녹화, 실행 로그 자동 저장
- 📊 **상세 보고서**: HTML 형식의 실행 결과 보고서 자동 생성

## 설치 방법

1. OpenAI API 키 설정
   ```
   .env 파일을 열고 OPENAI_API_KEY를 실제 키로 변경
   ```

2. Playwright 브라우저 설치
   ```bash
   npx playwright install chromium
   ```

## 사용 방법

### 1. 기본 실행
```bash
npm start
```

### 2. 커스텀 명령 실행
```bash
node src/main.js "클릭할 버튼 찾기" "./facebook/home.html"
```

### 3. 테스트 실행
```bash
npm test
```

## 프로젝트 구조
```
web-agent/
├── src/
│   ├── macroGenerator.js  # LLM을 통한 매크로 코드 생성
│   ├── macroExecutor.js   # Playwright를 통한 매크로 실행
│   ├── reportGenerator.js # HTML 보고서 생성
│   ├── main.js            # 메인 실행 파일
│   └── test.js            # 테스트 케이스
├── generated/             # 생성된 매크로 코드 저장
├── screenshots/           # 실행 중 캡처한 스크린샷
├── recordings/            # 실행 비디오 녹화
├── reports/               # HTML 실행 보고서
└── [사이트 폴더들]/       # 테스트용 HTML 파일들
```

## 실행 결과 확인
- `reports/` 폴더의 HTML 파일을 브라우저에서 열면 상세한 실행 결과를 확인할 수 있습니다
- 스크린샷과 비디오를 통해 매크로가 실제로 어떻게 동작했는지 시각적으로 확인 가능합니다
- 실행 로그를 통해 각 단계별 상세 정보를 확인할 수 있습니다