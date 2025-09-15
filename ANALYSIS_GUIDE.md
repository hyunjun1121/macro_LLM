# 📊 LLM Web Automation Benchmark Analysis Guide

이 가이드는 실험이 완료된 후 결과를 분석하고 논문 작성을 위한 자료를 생성하는 방법을 설명합니다.

## 🛠️ 설치 및 설정

### 1. Python 환경 설정
```bash
# Python 가상환경 생성 (권장)
python -m venv analysis_env
source analysis_env/bin/activate  # Linux/Mac
# analysis_env\Scripts\activate  # Windows

# 필요한 패키지 설치
pip install -r requirements_analysis.txt
```

### 2. 데이터 준비
실험이 완료되면 `benchmark_results/data/` 디렉토리에 다음과 같은 JSON 파일들이 생성됩니다:
```
benchmark_results/data/
├── result_Airbnb_TASK_001_1757858522619.json
├── result_Amazon_T001_1757850601552.json
├── result_youtube_YT_001_1757867557718.json
└── ... (총 800개 파일: 4 models × 200 tasks)
```

## 🚀 분석 실행

### 기본 실행
```bash
python analyze_benchmark_results.py
```

### 커스텀 경로 지정
```bash
python analyze_benchmark_results.py \
    --data-dir benchmark_results/data \
    --output-dir analysis_output
```

## 📈 생성되는 결과물

분석 스크립트는 다음과 같은 파일들을 생성합니다:

### 📊 시각화 (PNG & PDF)
- `model_performance_comparison.png/pdf`: 모델 전체 성능 비교
- `website_difficulty_analysis.png/pdf`: 웹사이트별 난이도 분석
- `performance_heatmap.png/pdf`: 모델-웹사이트 성능 히트맵
- `complexity_analysis.png/pdf`: 복잡도별 성능 분석
- `attempt_distribution.png/pdf`: 시도 횟수 분포 분석
- `performance_metrics.png/pdf`: 성능 지표 비교
- `error_analysis.png/pdf`: 오류 분석

### 📝 논문용 테이블 (LaTeX)
- `table1_model_performance.tex`: 모델 성능 비교표
- `table2_website_difficulty.tex`: 웹사이트 난이도 분석표
- `table3_performance_matrix.tex`: 모델-웹사이트 성능 매트릭스

### 📄 데이터 파일
- `processed_results.csv`: 전체 처리된 데이터셋
- `model_performance.csv`: 모델별 성능 요약
- `website_difficulty.csv`: 웹사이트별 난이도 요약
- `performance_matrix.csv`: 성능 매트릭스
- `summary_statistics.json`: 요약 통계
- `statistical_analysis.json`: 통계 분석 결과

### 📋 보고서
- `comprehensive_report.md`: 종합 분석 보고서

## 📊 주요 분석 내용

### 1. 모델 성능 비교
- 전체 성공률 (Success Rate)
- 평균 시도 횟수 (Average Attempts)
- 첫 시도 성공률 (First Attempt Success)
- 실행 시간 분석

### 2. 웹사이트 난이도 분석
- 웹사이트별 성공률
- 복잡도 지표 (validation checks)
- 난이도 순위

### 3. 모델-웹사이트 상호작용
- 성능 히트맵
- 특정 모델이 특정 웹사이트에서 잘하는 패턴 분석

### 4. 통계 분석
- ANOVA 검정 (모델간 유의한 차이)
- Chi-square 독립성 검정
- Effect size 계산 (Cohen's d)
- 상관관계 분석

## 📖 논문 작성 가이드

### 1. Results 섹션에 포함할 내용

```latex
% LaTeX 예시
\subsection{Overall Performance}
Table~\ref{tab:model_performance} shows the overall performance comparison across four state-of-the-art LLMs...

\input{table1_model_performance.tex}

\subsection{Website Difficulty Analysis}
Figure~\ref{fig:website_difficulty} illustrates the varying difficulty levels across different website types...
```

### 2. 그래프 삽입 예시

```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.8\textwidth]{model_performance_comparison.pdf}
    \caption{Model Performance Comparison across Web Automation Tasks}
    \label{fig:model_performance}
\end{figure}
```

### 3. 주요 발견사항 정리

분석 후 다음과 같은 발견사항들을 논문에 포함할 수 있습니다:

- **모델별 강점**: 어떤 모델이 어떤 유형의 작업에서 우수한지
- **웹사이트 복잡도**: 어떤 웹사이트가 가장 도전적인지
- **시도 횟수의 영향**: 재시도가 성공률에 미치는 영향
- **첫 시도 성공률**: 모델의 즉시 이해 능력
- **통계적 유의성**: 모델 간 차이의 통계적 유의성

## 🔬 추가 분석 옵션

필요에 따라 스크립트를 수정하여 추가 분석을 수행할 수 있습니다:

### 1. 특정 작업 유형별 분석
```python
# 예시: 폼 채우기 vs 버튼 클릭 작업 비교
task_type_analysis = df.groupby(['model_clean', 'task_type'])['final_success'].mean()
```

### 2. 시간대별 성능 변화
```python
# 예시: 실험 진행에 따른 성능 변화
df['experiment_time'] = pd.to_datetime(df['timestamp'])
time_analysis = df.groupby([df['experiment_time'].dt.hour, 'model_clean'])['final_success'].mean()
```

### 3. 오류 패턴 분석
```python
# 예시: 가장 흔한 오류 유형 분석
error_patterns = df[df['final_success'] == False]['final_error'].value_counts()
```

## 🎯 논문 품질 향상 팁

1. **그래프 품질**: PDF 형식 사용, 고해상도 (300 DPI)
2. **통계 검정**: p-value와 effect size 모두 보고
3. **에러바**: 신뢰구간이나 표준편차 표시
4. **색상**: 색맹 친화적 색상 팔레트 사용
5. **테이블**: LaTeX 형식으로 깔끔하게 정리

## 🚨 주의사항

- 실험이 완전히 완료된 후에 분석 실행
- 모든 4개 모델의 200개 작업이 완료되었는지 확인
- 결측 데이터나 오류 파일 확인
- 통계 분석 시 샘플 크기 충분성 확인

## 📞 도움이 필요한 경우

분석 과정에서 문제가 생기면:
1. 로그 메시지 확인
2. 데이터 파일 무결성 검사
3. Python 환경 및 패키지 버전 확인

---

이 분석 도구를 사용하여 고품질의 학술 논문을 작성하세요! 🎓✨