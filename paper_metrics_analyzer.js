import fs from 'fs/promises';
import path from 'path';

class PaperMetricsAnalyzer {
  constructor() {
    this.resultsDir = './benchmark_results/data';
    this.targetWebsites = ['Airbnb', 'TikTok', 'reddit', 'instagram', 'facebook', 'discord', 'Threads'];
    this.models = [
      'openai/gpt-4.1',
      'google/gemini-2.5-pro-thinking-on',
      'deepseek-ai/DeepSeek-V3.1-thinking-on',
      'openai/gpt-4o-mini'
    ];
  }

  getModelDisplayName(modelId) {
    const mapping = {
      'openai/gpt-4.1': 'GPT-4.1',
      'google/gemini-2.5-pro-thinking-on': 'Gemini-2.5-Pro',
      'deepseek-ai/DeepSeek-V3.1-thinking-on': 'DeepSeek-V3.1',
      'openai/gpt-4o-mini': 'GPT-4o-Mini'
    };
    return mapping[modelId] || modelId;
  }

  async loadResultData() {
    console.log('📊 결과 데이터 로딩...');

    const files = await fs.readdir(this.resultsDir);
    const resultFiles = files.filter(file =>
      file.startsWith('result_') && file.endsWith('.json') &&
      this.targetWebsites.some(website => file.includes(website))
    );

    console.log(`📄 분석 대상 파일: ${resultFiles.length}개`);

    const results = [];
    const corruptedFiles = [];

    for (const filename of resultFiles) {
      try {
        const filePath = path.join(this.resultsDir, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const result = JSON.parse(content);

        if (result.model && result.website && result.task && result.task.id) {
          results.push({
            filename,
            model: result.model,
            website: result.website,
            taskId: result.task.id,
            success: result.success === true,
            attempt: result.attempt || 1,
            timestamp: result.timestamp,
            errorType: result.errorType || 'unknown',
            executionLogs: result.executionLogs || [],
            generatedCode: result.generatedCode || '',
            task: result.task,
            validationResults: result.validationResults || {}
          });
        }
      } catch (error) {
        corruptedFiles.push(filename);
      }
    }

    console.log(`✅ 유효한 결과: ${results.length}개`);
    console.log(`❌ 손상된 파일: ${corruptedFiles.length}개`);

    return results;
  }

  analyzeOverallPerformance(results) {
    console.log('\n=== 전체 성능 분석 ===');

    // Get unique combinations (latest attempt only)
    const uniqueCombinations = new Map();

    results.forEach(result => {
      const key = `${result.model}__${result.website}__${result.taskId}`;
      if (!uniqueCombinations.has(key) ||
          (result.attempt || 1) > (uniqueCombinations.get(key).attempt || 1)) {
        uniqueCombinations.set(key, result);
      }
    });

    const finalResults = Array.from(uniqueCombinations.values());
    console.log(`🎯 최종 고유 조합: ${finalResults.length}개`);

    // Overall completion rates by model
    const modelPerformance = {};
    this.models.forEach(model => {
      const modelResults = finalResults.filter(r => r.model === model);
      const successCount = modelResults.filter(r => r.success).length;
      const totalCount = modelResults.length;
      const successRate = totalCount > 0 ? (successCount / totalCount * 100).toFixed(1) : '0.0';

      modelPerformance[model] = {
        total: totalCount,
        success: successCount,
        successRate: parseFloat(successRate)
      };
    });

    // Print overall performance table
    console.log('\n📊 Table: Overall Performance');
    console.log('Model\t\t\tTotal\tSuccess\tRate(%)');
    console.log('-'.repeat(50));
    Object.entries(modelPerformance).forEach(([model, stats]) => {
      const displayName = this.getModelDisplayName(model).padEnd(20);
      console.log(`${displayName}\t${stats.total}\t${stats.success}\t${stats.successRate}`);
    });

    return { modelPerformance, finalResults };
  }

  analyzeTaskComplexity(results) {
    console.log('\n=== Task 복잡도별 분석 ===');

    // Simple heuristic for task complexity based on task description length and keywords
    const categorizeComplexity = (task) => {
      const description = (task.description || '').toLowerCase();
      const objective = (task.objective || '').toLowerCase();
      const text = description + ' ' + objective;

      // Complex keywords
      const complexKeywords = ['multiple', 'navigate through', 'sequence', 'workflow', 'conditional', 'loop', 'iterate'];
      // Medium keywords
      const mediumKeywords = ['form', 'submit', 'search', 'filter', 'upload', 'download'];

      const hasComplex = complexKeywords.some(keyword => text.includes(keyword));
      const hasMedium = mediumKeywords.some(keyword => text.includes(keyword));

      if (hasComplex || text.length > 200) return 'Complex';
      if (hasMedium || text.length > 100) return 'Medium';
      return 'Simple';
    };

    const complexityStats = {};

    results.forEach(result => {
      const complexity = categorizeComplexity(result.task);
      if (!complexityStats[complexity]) {
        complexityStats[complexity] = { total: 0, success: 0 };
      }
      complexityStats[complexity].total++;
      if (result.success) complexityStats[complexity].success++;
    });

    console.log('\n📊 복잡도별 성공률:');
    Object.entries(complexityStats).forEach(([complexity, stats]) => {
      const rate = (stats.success / stats.total * 100).toFixed(1);
      console.log(`${complexity}: ${stats.success}/${stats.total} (${rate}%)`);
    });

    return complexityStats;
  }

  analyzeWebsitePerformance(results) {
    console.log('\n=== 웹사이트별 성능 분석 ===');

    const websiteStats = {};

    this.targetWebsites.forEach(website => {
      const websiteResults = results.filter(r => r.website === website);
      const successCount = websiteResults.filter(r => r.success).length;
      const totalCount = websiteResults.length;
      const successRate = totalCount > 0 ? (successCount / totalCount * 100).toFixed(1) : '0.0';

      // Get unique tasks for this website
      const uniqueTasks = new Set(websiteResults.map(r => r.taskId));

      // Best and worst performing models for this website
      const modelStats = {};
      this.models.forEach(model => {
        const modelResults = websiteResults.filter(r => r.model === model);
        const modelSuccess = modelResults.filter(r => r.success).length;
        const modelTotal = modelResults.length;
        modelStats[model] = modelTotal > 0 ? (modelSuccess / modelTotal * 100) : 0;
      });

      const bestModel = Object.entries(modelStats).reduce((a, b) => modelStats[a[0]] > modelStats[b[0]] ? a : b);
      const worstModel = Object.entries(modelStats).reduce((a, b) => modelStats[a[0]] < modelStats[b[0]] ? a : b);

      websiteStats[website] = {
        taskCount: uniqueTasks.size,
        total: totalCount,
        success: successCount,
        successRate: parseFloat(successRate),
        bestModel: this.getModelDisplayName(bestModel[0]),
        worstModel: this.getModelDisplayName(worstModel[0])
      };
    });

    console.log('\n📊 Table: Website Performance');
    console.log('Website\t\t\tTasks\tTotal\tSuccess\tRate(%)\tBest\t\tWorst');
    console.log('-'.repeat(80));
    Object.entries(websiteStats).forEach(([website, stats]) => {
      const name = website.padEnd(15);
      console.log(`${name}\t${stats.taskCount}\t${stats.total}\t${stats.success}\t${stats.successRate}\t${stats.bestModel}\t${stats.worstModel}`);
    });

    return websiteStats;
  }

  analyzeErrorPatterns(results) {
    console.log('\n=== 에러 패턴 분석 ===');

    const failedResults = results.filter(r => !r.success);
    console.log(`❌ 총 실패 케이스: ${failedResults.length}개`);

    // Error type distribution
    const errorTypes = {};
    failedResults.forEach(result => {
      const errorType = result.errorType || 'unknown';
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });

    console.log('\n📊 에러 타입별 분포:');
    Object.entries(errorTypes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const percentage = (count / failedResults.length * 100).toFixed(1);
        console.log(`${type}: ${count}개 (${percentage}%)`);
      });

    // Model-specific error patterns
    console.log('\n📊 모델별 에러 패턴:');
    this.models.forEach(model => {
      const modelFailures = failedResults.filter(r => r.model === model);
      const modelTotal = results.filter(r => r.model === model).length;
      const failureRate = modelTotal > 0 ? (modelFailures.length / modelTotal * 100).toFixed(1) : '0.0';

      console.log(`${this.getModelDisplayName(model)}: ${modelFailures.length}/${modelTotal} 실패 (${failureRate}%)`);

      // Top error types for this model
      const modelErrors = {};
      modelFailures.forEach(result => {
        const errorType = result.errorType || 'unknown';
        modelErrors[errorType] = (modelErrors[errorType] || 0) + 1;
      });

      const topErrors = Object.entries(modelErrors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      topErrors.forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}개`);
      });
    });

    return { errorTypes, failedResults };
  }

  analyzeCodeQuality(results) {
    console.log('\n=== 코드 품질 분석 ===');

    const successfulResults = results.filter(r => r.success);
    console.log(`✅ 성공한 케이스: ${successfulResults.length}개`);

    // Code quality metrics (simplified heuristics)
    const codeQualityMetrics = {};

    this.models.forEach(model => {
      const modelResults = successfulResults.filter(r => r.model === model);
      const metrics = {
        syntaxCorrectness: 0,
        seleniumBestPractices: 0,
        errorHandling: 0,
        waitStrategy: 0,
        maintainability: 0
      };

      modelResults.forEach(result => {
        const code = result.generatedCode || '';

        // Simple heuristics for code quality
        if (!code.includes('SyntaxError') && code.length > 50) {
          metrics.syntaxCorrectness++;
        }
        if (code.includes('WebDriverWait') || code.includes('expected_conditions')) {
          metrics.seleniumBestPractices++;
        }
        if (code.includes('try') && code.includes('except')) {
          metrics.errorHandling++;
        }
        if (code.includes('WebDriverWait') && !code.includes('time.sleep')) {
          metrics.waitStrategy++;
        }
        if (code.split('\n').length < 100 && code.includes('def ')) {
          metrics.maintainability++;
        }
      });

      // Convert to percentages
      Object.keys(metrics).forEach(key => {
        metrics[key] = modelResults.length > 0 ?
          (metrics[key] / modelResults.length * 100).toFixed(1) : '0.0';
      });

      codeQualityMetrics[model] = metrics;
    });

    console.log('\n📊 Table: Code Quality Metrics (%)');
    console.log('Model\t\t\tSyntax\tSelenium\tError\tWait\tMaintain');
    console.log('-'.repeat(70));
    Object.entries(codeQualityMetrics).forEach(([model, metrics]) => {
      const displayName = this.getModelDisplayName(model).padEnd(20);
      console.log(`${displayName}\t${metrics.syntaxCorrectness}\t${metrics.seleniumBestPractices}\t${metrics.errorHandling}\t${metrics.waitStrategy}\t${metrics.maintainability}`);
    });

    return codeQualityMetrics;
  }

  generatePaperMetrics(results) {
    console.log('\n=== 논문용 메트릭 생성 ===');

    const { modelPerformance, finalResults } = this.analyzeOverallPerformance(results);
    const complexityStats = this.analyzeTaskComplexity(finalResults);
    const websiteStats = this.analyzeWebsitePerformance(finalResults);
    const { errorTypes } = this.analyzeErrorPatterns(finalResults);
    const codeQualityMetrics = this.analyzeCodeQuality(finalResults);

    // Generate summary for paper
    const paperMetrics = {
      timestamp: new Date().toISOString(),
      totalEvaluations: finalResults.length,
      totalUniqueWebsites: this.targetWebsites.length,
      totalModels: this.models.length,

      overallPerformance: modelPerformance,
      taskComplexityBreakdown: complexityStats,
      websitePerformanceBreakdown: websiteStats,
      errorPatterns: errorTypes,
      codeQualityAssessment: codeQualityMetrics,

      keyFindings: {
        bestPerformingModel: Object.entries(modelPerformance)
          .reduce((a, b) => modelPerformance[a[0]].successRate > modelPerformance[b[0]].successRate ? a : b)[0],
        worstPerformingModel: Object.entries(modelPerformance)
          .reduce((a, b) => modelPerformance[a[0]].successRate < modelPerformance[b[0]].successRate ? a : b)[0],
        mostChallengingWebsite: Object.entries(websiteStats)
          .reduce((a, b) => websiteStats[a[0]].successRate < websiteStats[b[0]].successRate ? a : b)[0],
        mostCommonErrorType: Object.entries(errorTypes)
          .reduce((a, b) => errorTypes[a[0]] > errorTypes[b[0]] ? a : b)[0]
      }
    };

    // Save metrics to file
    const metricsPath = path.join('./benchmark_results', `paper_metrics_${Date.now()}.json`);
    await fs.writeFile(metricsPath, JSON.stringify(paperMetrics, null, 2));

    console.log(`\n📄 논문 메트릭 저장됨: ${metricsPath}`);

    // Print key findings
    console.log('\n🔍 주요 발견사항:');
    console.log(`- 최고 성능 모델: ${this.getModelDisplayName(paperMetrics.keyFindings.bestPerformingModel)}`);
    console.log(`- 최저 성능 모델: ${this.getModelDisplayName(paperMetrics.keyFindings.worstPerformingModel)}`);
    console.log(`- 가장 어려운 웹사이트: ${paperMetrics.keyFindings.mostChallengingWebsite}`);
    console.log(`- 가장 흔한 에러: ${paperMetrics.keyFindings.mostCommonErrorType}`);

    return paperMetrics;
  }

  async runFullAnalysis() {
    console.log('🚀 MacroBench 논문 메트릭 분석 시작\n');

    try {
      const results = await this.loadResultData();

      if (results.length === 0) {
        console.log('❌ 분석할 데이터가 없습니다.');
        return null;
      }

      const paperMetrics = this.generatePaperMetrics(results);

      console.log('\n✅ 분석 완료!');
      return paperMetrics;

    } catch (error) {
      console.error('❌ 분석 중 오류 발생:', error);
      throw error;
    }
  }
}

// Usage
const analyzer = new PaperMetricsAnalyzer();
await analyzer.runFullAnalysis();

export { PaperMetricsAnalyzer };