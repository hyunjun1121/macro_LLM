# 🐧 Linux Server Deployment Guide

## 📋 Overview
Linux 서버에서 LLM Web Automation Benchmark를 실행하기 위한 완전한 가이드입니다.

## 🚀 Quick Start

### 1. **초기 서버 설정**
```bash
# 실행 권한 부여
chmod +x *.sh

# 서버 환경 설정 (pip 기반)
./setup_server.sh

# API 키 설정
./setup_api.sh
```

### 2. **실행 방법 선택**

#### Option A: Tmux 세션 (권장)
```bash
# 대화형 tmux 세션 시작
./tmux_benchmark.sh start

# 자동으로 모든 모델 실행
./tmux_benchmark.sh auto

# 세션 상태 확인
./tmux_benchmark.sh list

# 세션 종료
./tmux_benchmark.sh kill
```

#### Option B: 직접 실행
```bash
# 단일 모델 실행
node run_server_benchmark.js "openai/gpt-4.1" resume

# 32개 프로세스로 모든 모델 실행
node run_server_multiprocess.js
```

## 🛠️ 상세 설정

### **시스템 요구사항**
- Ubuntu 18.04+ / CentOS 7+
- RAM: 16GB+ 권장 (multiprocess 시 32GB+)
- CPU: 8코어+ 권장 (32 프로세스 사용)
- 디스크: 10GB+ 여유 공간

### **설치 과정**

#### 1. **서버 환경 설정**
```bash
./setup_server.sh
```
**수행 작업:**
- Python3 & pip 설치
- Node.js 20.x 설치
- Playwright (pip 방식)
- Tmux, htop 등 유틸리티
- Xvfb (가상 디스플레이)
- 시스템 의존성

#### 2. **API 설정**
```bash
./setup_api.sh
```
**입력 필요:**
- API Key
- Base URL (기본값: http://5.78.122.79:10000/v1/)

생성되는 `.env` 파일:
```
API_KEY=your_api_key_here
BASE_URL=http://5.78.122.79:10000/v1/
SERVER_MODE=true
HEADLESS=true
DISPLAY=:99
NODE_ENV=production
```

## 📺 Tmux 세션 관리

### **세션 구조**
```
llm_benchmark
├── 0: dashboard   - 메인 대시보드
├── 1: gpt4.1      - GPT-4.1 모델
├── 2: gemini      - Gemini-2.5-Pro
├── 3: deepseek    - DeepSeek-V3.1
├── 4: gpt4mini    - GPT-4o-Mini
├── 5: multiproc   - 멀티프로세스 실행
└── 6: logs        - 로그 모니터링
```

### **Tmux 명령어**
```bash
# 세션 시작/연결
./tmux_benchmark.sh start

# 자동 실행 (백그라운드)
./tmux_benchmark.sh auto

# 세션 목록
./tmux_benchmark.sh list

# 세션 종료
./tmux_benchmark.sh kill

# 수동으로 세션 연결
tmux attach -t llm_benchmark
```

### **Tmux 내부 조작**
- `Ctrl+B then 0-6`: 윈도우 전환
- `Ctrl+B then d`: 세션 분리 (백그라운드 실행)
- `Ctrl+B then [`: 스크롤 모드 (q로 종료)
- `Ctrl+B then c`: 새 윈도우 생성

## ⚡ 실행 모드

### **1. 단일 모델**
```bash
node run_server_benchmark.js "openai/gpt-4.1" resume
```
- 메모리 효율적
- 안정성 최고
- 한 번에 한 모델만

### **2. 멀티프로세스 (32 프로세스)**
```bash
node run_server_multiprocess.js
```
- 최대 성능
- 4개 모델 동시 실행
- 32개 worker 프로세스
- **Trial 수: 3회** (서버 최적화)

### **3. 병렬 실행**
```bash
# Tmux 자동 모드 사용
./tmux_benchmark.sh auto
```
- 4개 개별 프로세스
- 각각 독립적 실행
- 모니터링 용이

## 📊 모니터링 & 로그

### **실시간 모니터링**
```bash
# 시스템 리소스
htop

# 모든 로그 실시간 확인
tail -f *.log

# 특정 모델 로그
tail -f benchmark_openai_gpt-4.1_*.log

# 결과 확인
ls -la benchmark_results/
```

### **로그 파일 구조**
```
benchmark_openai_gpt-4.1_20250915_143052.log
benchmark_google_gemini-2.5-pro-thinking-on_20250915_143052.log
benchmark_deepseek-ai_DeepSeek-V3.1-thinking-on_20250915_143052.log
benchmark_openai_gpt-4o-mini_20250915_143052.log
```

## 🔧 서버 최적화

### **성능 튜닝**
1. **Trial 수 감소**: 5 → 3 (서버용)
2. **Headless 모드**: 강제 활성화
3. **메모리 관리**: 브라우저 최적화 플래그
4. **Process 격리**: 각 모델 독립 실행

### **브라우저 최적화 플래그**
```javascript
args: [
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--no-zygote',
  '--single-process',
  '--disable-gpu',
  '--memory-pressure-off'
]
```

## 📈 결과 파일

### **저장 위치**
```
benchmark_results/
├── data/           # 개별 task 결과
├── reports/        # 종합 보고서
└── screenshots/    # 스크린샷 (필요시)
```

### **보고서 종류**
- `server_openai_gpt-4.1_*.json` - 개별 모델 보고서
- `server_multiprocess_*.json` - 멀티프로세스 종합 보고서

## 🚨 문제 해결

### **일반적인 문제**

#### 1. **Playwright 설치 실패**
```bash
pip3 install playwright
python3 -m playwright install
python3 -m playwright install-deps
```

#### 2. **Display 관련 오류**
```bash
# Xvfb 재시작
sudo systemctl restart xvfb

# 수동 실행
Xvfb :99 -screen 0 1280x720x24 -ac +extension GLX +render -noreset &
export DISPLAY=:99
```

#### 3. **메모리 부족**
```bash
# 스왑 확인
free -h

# 프로세스 수 줄이기 (multiprocess에서)
# MAX_PROCESSES = 16  (32에서 줄임)
```

#### 4. **Permission 오류**
```bash
chmod +x *.sh
chmod 600 .env
```

## 🎯 권장 사용법

### **대용량 실험**
```bash
# 1. 모든 설정 완료
./setup_server.sh && ./setup_api.sh

# 2. Tmux 자동 실행
./tmux_benchmark.sh auto

# 3. 진행 상황 모니터링
tmux attach -t llm_benchmark
```

### **테스트 실행**
```bash
# 단일 모델로 먼저 테스트
node run_server_benchmark.js "openai/gpt-4o-mini" resume

# 정상 작동 확인 후 full 실행
./tmux_benchmark.sh auto
```

## ⚡ 최종 명령어 요약

```bash
# 완전 자동화 실행
./setup_server.sh && ./setup_api.sh && ./tmux_benchmark.sh auto

# 상황 확인
./tmux_benchmark.sh list

# 세션 접속
tmux attach -t llm_benchmark

# 모든 종료
./tmux_benchmark.sh kill
```

이제 Linux 서버에서 완전하게 자동화된 LLM 벤치마크를 실행할 수 있습니다! 🚀