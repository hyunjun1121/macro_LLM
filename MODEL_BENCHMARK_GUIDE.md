# 🚀 Individual Model Benchmark Guide

## Overview
중간에 끊어진 실험을 resume하고, 각 모델을 개별적으로 실행할 수 있는 기능입니다.

## ✅ Resume 기능 특징

### 🔄 자동 Resume
- **완료된 task 자동 건너뛰기**: 이미 성공한 task들을 자동 감지하여 건너뜀
- **모델별 개별 tracking**: 각 모델의 완료 상태를 독립적으로 관리
- **중단점부터 재시작**: 실험이 중간에 끊어져도 처음부터 다시 시작하지 않음
- **메모리 효율성**: 각 task마다 개별 저장으로 안정적인 실행

### 📊 Resume 예시 출력
```
🔄 Resume mode: Analyzing completed tasks...
✅ Found 313 completed tasks for model openai/gpt-4.1
   🔄 when2meet: 15 tasks already completed, 5 remaining
   🔄 youtube: 20 tasks already completed, 0 remaining
   🔄 Airbnb: 20 tasks already completed, 0 remaining
📊 Resume Summary: 55 tasks skipped, continuing with remaining tasks
```

## 🎯 사용 방법

### Method 1: Node.js 직접 실행
```bash
# 새로 시작
node run_single_model_benchmark.js "openai/gpt-4.1"

# Resume 모드로 시작 (권장)
node run_single_model_benchmark.js "openai/gpt-4.1" resume
node run_single_model_benchmark.js "google/gemini-2.5-pro-thinking-on" resume
node run_single_model_benchmark.js "deepseek-ai/DeepSeek-V3.1-thinking-on" resume
node run_single_model_benchmark.js "openai/gpt-4o-mini" resume
```

### Method 2: Batch Files (더 쉬움)
Windows에서 더블클릭으로 실행:
- **run_gpt4.bat** - GPT-4.1 실행
- **run_gemini.bat** - Gemini-2.5-Pro-Thinking 실행
- **run_deepseek.bat** - DeepSeek-V3.1-Thinking 실행
- **run_gpt4mini.bat** - GPT-4o-Mini 실행

## 🔧 Multi-Terminal 실행 방법

### 각 모델을 별도 터미널에서 동시 실행
1. **Terminal 1**: `run_gpt4.bat` 더블클릭 또는 `node run_single_model_benchmark.js "openai/gpt-4.1" resume`
2. **Terminal 2**: `run_gemini.bat` 더블클릭 또는 `node run_single_model_benchmark.js "google/gemini-2.5-pro-thinking-on" resume`
3. **Terminal 3**: `run_deepseek.bat` 더블클릭 또는 `node run_single_model_benchmark.js "deepseek-ai/DeepSeek-V3.1-thinking-on" resume`
4. **Terminal 4**: `run_gpt4mini.bat` 더블클릭 또는 `node run_single_model_benchmark.js "openai/gpt-4o-mini" resume`

### 장점
- **안정성**: Single process로 browser 충돌 방지
- **병렬성**: 4개 모델이 독립적으로 동시 실행
- **Resume 지원**: 중단된 지점부터 자동 재시작
- **개별 모니터링**: 각 모델의 진행 상황을 개별적으로 확인

## 📊 결과 파일

### 개별 모델 보고서
각 모델 실행 후 자동 생성:
```
benchmark_results/reports/single_model_openai_gpt-4.1_2025-09-14T15-30-45-123Z.json
benchmark_results/reports/single_model_google_gemini-2.5-pro-thinking-on_2025-09-14T15-30-45-123Z.json
```

### Task별 상세 결과
```
benchmark_results/data/result_youtube_YT_MAL_001_1757867557718.json
benchmark_results/data/result_when2meet_T001_1757867590306.json
```

## ⚡ 성능 정보

### Resume 효율성
- **200개 작업 중 55개 건너뛰기** = 27.5% 시간 절약
- **완료된 작업 자동 감지**: 중복 실행 방지
- **안정적인 재시작**: 메모리 문제나 네트워크 오류 후에도 안전하게 재시작

### 실행 시간 예상
- **Full run**: 약 60-90분/모델
- **Resume run**: 남은 작업에 비례하여 단축

## 🔍 사용 예시

### 1. 새로운 모델 실행
```bash
node run_single_model_benchmark.js "google/gemini-2.5-pro-thinking-on"
```

### 2. 중단된 실험 재개
```bash
node run_single_model_benchmark.js "google/gemini-2.5-pro-thinking-on" resume
```

### 3. 여러 모델 동시 실행
4개 터미널에서 각각:
```bash
# Terminal 1
run_gpt4.bat

# Terminal 2
run_gemini.bat

# Terminal 3
run_deepseek.bat

# Terminal 4
run_gpt4mini.bat
```

## ❗ 중요 사항

1. **Resume 모드 권장**: 항상 `resume` 옵션을 사용하세요 (완료된 작업이 없어도 문제없음)
2. **Single Process**: 한 터미널당 하나의 모델만 실행 (안정성 위해)
3. **환경 변수**: `.env` 파일에 `API_KEY`와 `BASE_URL` 설정 필요
4. **결과 저장**: 각 task마다 자동 저장되므로 중간에 중단되어도 안전

## 🎉 완료!
이제 각 모델을 개별적으로, 안정적으로, 그리고 resume 기능과 함께 실행할 수 있습니다!