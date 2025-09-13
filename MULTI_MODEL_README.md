# 🚀 Multi-Model LLM Benchmark System

Custom API를 통해 24개의 최신 LLM 모델들을 벤치마크할 수 있는 시스템입니다.

## 🤖 지원 모델 목록 (24개)

### 🔥 OpenAI Models (8개)
- `openai/gpt-4o-mini` - 비용 효율적
- `openai/gpt-4o-20240806` - 범용 목적
- `openai/gpt-4.1-nano` - 경량화
- `openai/gpt-4.1-mini` - 효율적 처리
- `openai/gpt-4.1` - 고급 성능
- `openai/o3-high` - 복잡한 추론
- `openai/o4-mini-high` - 효율적 추론
- `openai/gpt-5` - 최첨단 성능

### 🎭 Anthropic Models (4개)
- `anthropic/claude-4-sonnet-thinking-off` - 균형잡힌 성능
- `anthropic/claude-4-sonnet-thinking-on-10k` - 복잡한 추론
- `anthropic/claude-4-opus-thinking-off` - 최고 품질
- `anthropic/claude-4-opus-thinking-on-10k` - 가장 복잡한 추론

### 🔍 Google Models (4개)
- `google/gemini-2.5-flash-thinking-off` - 빠른 응답
- `google/gemini-2.5-flash-thinking-on` - 빠른 추론
- `google/gemini-2.5-pro-thinking-off` - 고품질, 멀티모달
- `google/gemini-2.5-pro-thinking-on` - 고급 추론

### 💻 DeepSeek Models (2개)
- `deepseek-ai/DeepSeek-V3.1-thinking-off` - 코딩 특화
- `deepseek-ai/DeepSeek-V3.1-thinking-on` - 복잡한 코딩 + 추론

### 🌟 Qwen Models (4개)
- `togetherai/Qwen/Qwen3-235B-A22B-FP8` - 대규모 처리
- `togetherai/Qwen/Qwen3-235B-A22B-Instruct-2507-FP8` - 명령 수행
- `togetherai/Qwen/Qwen3-235B-A22B-Thinking-2507-FP8` - 대형 컨텍스트 추론
- `togetherai/Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8` - 고급 코딩

### 🌙 기타 Models (2개)
- `togetherai/moonshotai/Kimi-K2-Instruct` - 중국어 특화
- `xai/grok-4` - 실시간 정보

## 🚀 사용 방법

### 빠른 시작
```bash
# 환경 설정 확인
cat .env
# API_KEY=sk-sgl-MH7bEVVJlBp3RT_P5cPQ6-KfC1qJElBRCfTDHy40Ue4
# BASE_URL=http://5.78.122.79:10000/v1/

# 빠른 모델 비교 (2개 최신 경량 모델)
npm run multi-model:fast

# 품질 중심 비교 (최고 품질 모델들)
npm run multi-model:quality

# 추론 능력 비교 (thinking 모델들)
npm run multi-model:reasoning

# 코딩 능력 비교 (코딩 특화 모델들)
npm run multi-model:coding
```

### 제공사별 비교
```bash
# OpenAI 모델들만 비교
npm run multi-model:openai

# Anthropic 모델들만 비교
npm run multi-model:anthropic

# Google 모델들만 비교
npm run multi-model:google
```

### 커스텀 모델 비교
```bash
# 특정 모델들만 선택해서 비교
node src/multiModelBenchmark.js custom "openai/gpt-5,anthropic/claude-4-opus-thinking-off,google/gemini-2.5-pro-thinking-on"

# DeepSeek vs Qwen 코딩 대결
node src/multiModelBenchmark.js custom "deepseek-ai/DeepSeek-V3.1-thinking-on,togetherai/Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8"
```

## 📊 벤치마크 카테고리

### 🏃‍♂️ Fast Testing
- **모델**: GPT-4o-mini, Gemini-2.5-flash
- **목적**: 빠른 프로토타이핑 및 기본 성능 확인
- **작업 수**: 각 모델당 1개 작업

### 🎯 Quality Testing
- **모델**: Claude-4-Opus, GPT-5
- **목적**: 최고 품질 출력 비교
- **작업 수**: 각 모델당 2개 작업

### 🧠 Reasoning Testing
- **모델**: Claude-4-Sonnet-thinking, O3-high
- **목적**: 복잡한 추론 능력 평가
- **작업 수**: 각 모델당 2개 작업

### 💻 Coding Testing
- **모델**: DeepSeek-V3.1-thinking, Qwen3-Coder
- **목적**: 웹 자동화 코드 생성 능력
- **작업 수**: 각 모델당 3개 작업

## 📈 결과 분석

### 생성되는 보고서
1. **HTML 대시보드**: 시각적 모델 성능 비교
2. **JSON 데이터**: 상세 벤치마크 결과
3. **차트 분석**: Chart.js 기반 성능 그래프
4. **모델 순위**: 성공률 기반 랭킹

### 평가 지표
- **성공률**: 작업 완료 비율
- **재시도 횟수**: 성공까지 필요한 시도 수
- **실행 시간**: 평균 매크로 생성/실행 시간
- **웹사이트별 성능**: 각 사이트에서의 성공률
- **난이도별 성능**: Easy/Medium/Hard 작업별 성공률

## 🔬 연구 활용

### 1. LLM 성능 비교 연구
```bash
# 모든 OpenAI 모델 성능 비교
npm run multi-model:openai

# Thinking vs Non-thinking 모델 비교
node src/multiModelBenchmark.js custom "anthropic/claude-4-sonnet-thinking-off,anthropic/claude-4-sonnet-thinking-on-10k"
```

### 2. 제공사별 특성 분석
```bash
# 각 제공사의 대표 모델 비교
node src/multiModelBenchmark.js custom "openai/gpt-5,anthropic/claude-4-opus-thinking-off,google/gemini-2.5-pro-thinking-off,deepseek-ai/DeepSeek-V3.1-thinking-on"
```

### 3. 코딩 능력 특화 분석
```bash
# 코딩 특화 vs 범용 모델 비교
npm run multi-model:coding
```

## 🛠 고급 설정

### 모델별 맞춤 설정
```javascript
// src/multiModelBenchmark.js 수정하여 모델별 파라미터 조정
const modelConfigs = {
  "openai/gpt-5": { temperature: 0.1, maxTokens: 4000 },
  "anthropic/claude-4-opus-thinking-on-10k": { temperature: 0.3, maxTokens: 8000 }
};
```

### 작업 필터링
```javascript
// 특정 난이도 또는 카테고리만 테스트
const options = {
  taskLimit: 5,
  difficultyFilter: ['hard', 'expert'],  // 어려운 작업만
  websiteFilter: ['youtube', 'amazon']    // 특정 사이트만
};
```

## 📋 벤치마크 작업

현재 **195개의 작업**이 9개 웹사이트에 걸쳐 준비되어 있습니다:

- **YouTube**: 콘텐츠 조작 vs 정상 이용 (20개)
- **Amazon**: 쇼핑 자동화 + 데이터 분석 (20개)
- **Facebook**: 소셜 미디어 자동화 (20개)
- **Instagram**: 이미지 기반 소셜 행동 (20개)
- **Discord**: 커뮤니티 관리 (20개)
- **Reddit**: 포럼 참여 (20개)
- **TikTok**: 비디오 플랫폼 (29개)
- **When2meet**: 일정 관리 (20개)
- **Threads**: 텍스트 기반 소셜 (26개)

### 작업 유형
- **Malicious**: LLM Safety 연구용 (악성 자동화 시나리오)
- **Benign/Normal**: 정상적인 사용자 행동 패턴
- **난이도**: Easy → Medium → Hard → Expert

## ⚡ 성능 최적화

### 빠른 테스트
```bash
# 1개 작업으로 빠른 검증
node src/multiModelBenchmark.js fast

# 특정 모델만 빠른 테스트
node src/multiModelBenchmark.js custom "openai/gpt-4o-mini"
```

### 정밀한 평가
```bash
# 더 많은 작업으로 정확한 평가
node src/multiModelBenchmark.js quality  # 2개 작업
node src/multiModelBenchmark.js coding   # 3개 작업
```

## 🎯 논문 활용 예시

1. **"Multi-Model LLM Web Automation Benchmark"**
2. **"Thinking vs Non-Thinking Models in Code Generation"**
3. **"Cross-Provider LLM Performance in Web Automation"**
4. **"LLM Safety Evaluation through Malicious Task Detection"**

각 연구 목적에 맞게 모델과 작업을 선별하여 벤치마크를 실행할 수 있습니다.

## 🚨 주의사항

- **API 비용**: 24개 모델 전체 테스트시 상당한 비용 발생 가능
- **실행 시간**: 품질 테스트는 모델당 10-30분 소요 예상
- **네트워크**: Custom API 서버 연결 상태 확인 필요

## 📞 지원

- 모델 추가 요청: supported_models.json 수정
- 벤치마크 커스터마이징: src/multiModelBenchmark.js 참고
- 새로운 웹사이트 추가: xlsx 파일 생성 후 자동 인식