import { BenchmarkRunner } from './benchmarkRunner.js';
import fs from 'fs/promises';
import path from 'path';

export class MultiModelBenchmarkRunner {
  constructor() {
    this.supportedModels = null;
    this.loadSupportedModels();
  }

  async loadSupportedModels() {
    try {
      const modelsData = await fs.readFile(path.join(process.cwd(), 'supported_models.json'), 'utf-8');
      this.supportedModels = JSON.parse(modelsData);
    } catch (error) {
      console.error('Failed to load supported models:', error.message);
      throw error;
    }
  }

  getModelsByCategory(category) {
    if (!this.supportedModels) {
      throw new Error('Supported models not loaded');
    }

    const recommendations = this.supportedModels.benchmark_recommendations;
    return recommendations[category] || [];
  }

  getModelsByProvider(provider) {
    if (!this.supportedModels) {
      throw new Error('Supported models not loaded');
    }

    return this.supportedModels.supported_models
      .filter(model => model.provider === provider)
      .map(model => model.id);
  }

  async runSingleModelBenchmark(modelId, options = {}) {
    console.log(`\\n🚀 Starting benchmark with model: ${modelId}`);
    console.log('=' * 80);

    const runner = new BenchmarkRunner({
      models: [modelId]
    });

    const results = await runner.runBenchmark({
      ...options,
      taskLimit: options.taskLimit || 2 // Limit tasks for model comparison
    });

    // Add model info to results
    const modelInfo = this.supportedModels.supported_models.find(m => m.id === modelId);
    results.modelInfo = modelInfo;
    results.modelId = modelId;

    return results;
  }

  async runMultiModelComparison(models, options = {}) {
    console.log('\\n🔬 Multi-Model Benchmark Comparison');
    console.log('=' * 80);
    console.log(`Models to compare: ${models.join(', ')}`);

    const results = [];
    const errors = [];

    for (const model of models) {
      try {
        console.log(`\\n📊 Testing model: ${model}`);
        const result = await this.runSingleModelBenchmark(model, options);
        results.push(result);

        console.log(`✅ ${model} completed: ${result.summary.successRate} success rate`);
      } catch (error) {
        console.error(`❌ ${model} failed:`, error.message);
        errors.push({ model, error: error.message });
      }
    }

    // Generate comparison report
    const comparison = this.generateModelComparison(results, errors);
    await this.saveComparisonReport(comparison);

    return comparison;
  }

  generateModelComparison(results, errors) {
    const comparison = {
      timestamp: new Date().toISOString(),
      totalModels: results.length + errors.length,
      successfulModels: results.length,
      failedModels: errors.length,
      errors,
      results: [],
      summary: {
        bestPerformingModel: null,
        worstPerformingModel: null,
        averageSuccessRate: 0,
        modelRankings: []
      }
    };

    // Process each model's results
    for (const result of results) {
      const modelResult = {
        modelId: result.modelId,
        modelInfo: result.modelInfo,
        successRate: parseFloat(result.summary.successRate.replace('%', '')),
        totalTasks: result.summary.totalTasks,
        successfulTasks: result.summary.successfulTasks,
        failedTasks: result.summary.failedTasks,
        websiteStats: result.websiteStats,
        difficultyStats: result.difficultyStats,
        attemptStats: result.attemptStats
      };

      comparison.results.push(modelResult);
    }

    // Calculate summary statistics
    if (comparison.results.length > 0) {
      const successRates = comparison.results.map(r => r.successRate);
      comparison.summary.averageSuccessRate = successRates.reduce((a, b) => a + b, 0) / successRates.length;

      // Sort by success rate
      const sortedResults = [...comparison.results].sort((a, b) => b.successRate - a.successRate);
      comparison.summary.bestPerformingModel = sortedResults[0];
      comparison.summary.worstPerformingModel = sortedResults[sortedResults.length - 1];
      comparison.summary.modelRankings = sortedResults.map((r, index) => ({
        rank: index + 1,
        modelId: r.modelId,
        successRate: r.successRate,
        provider: r.modelInfo?.provider
      }));
    }

    return comparison;
  }

  async saveComparisonReport(comparison) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `multi_model_comparison_${timestamp}`;

    // Save JSON
    const jsonPath = path.join(process.cwd(), 'benchmark_results', 'data', `${filename}.json`);
    await fs.mkdir(path.dirname(jsonPath), { recursive: true });
    await fs.writeFile(jsonPath, JSON.stringify(comparison, null, 2));

    // Generate HTML report
    const htmlPath = path.join(process.cwd(), 'benchmark_results', 'reports', `${filename}.html`);
    await fs.mkdir(path.dirname(htmlPath), { recursive: true });
    const htmlContent = await this.generateComparisonHTML(comparison);
    await fs.writeFile(htmlPath, htmlContent);

    console.log(`\\n📊 Comparison report saved:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   HTML: ${htmlPath}`);

    return { jsonPath, htmlPath };
  }

  async generateComparisonHTML(comparison) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multi-Model LLM Benchmark Comparison</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc; color: #1e293b; line-height: 1.6;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;
        }
        .stats-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px; margin-bottom: 30px;
        }
        .stat-card {
            background: white; padding: 20px; border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;
        }
        .stat-value { font-size: 2em; font-weight: bold; color: #3b82f6; }
        .section {
            background: white; padding: 25px; border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;
        }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; color: #475569; }
        .rank-1 { background: linear-gradient(90deg, #ffd700, #fff2cc); font-weight: bold; }
        .rank-2 { background: linear-gradient(90deg, #c0c0c0, #f0f0f0); font-weight: bold; }
        .rank-3 { background: linear-gradient(90deg, #cd7f32, #ffeaa7); font-weight: bold; }
        .model-id { font-family: 'Courier New', monospace; font-size: 0.9em; }
        .provider-badge {
            display: inline-block; padding: 4px 8px; border-radius: 4px;
            font-size: 0.8em; font-weight: 500; text-transform: uppercase;
        }
        .provider-openai { background: #dcfce7; color: #16a34a; }
        .provider-anthropic { background: #fef3c7; color: #d97706; }
        .provider-google { background: #dbeafe; color: #2563eb; }
        .provider-deepseek { background: #f3e8ff; color: #7c3aed; }
        .provider-qwen { background: #fecaca; color: #dc2626; }
        .provider-xai { background: #f1f5f9; color: #475569; }
        .chart-container {
            margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 6px;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Multi-Model LLM Benchmark Comparison</h1>
            <p>Generated on ${new Date(comparison.timestamp).toLocaleString()}</p>
            <p>${comparison.successfulModels}/${comparison.totalModels} models tested successfully</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${comparison.totalModels}</div>
                <div class="stat-label">Models Tested</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${comparison.successfulModels}</div>
                <div class="stat-label">Successful Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${comparison.summary.averageSuccessRate?.toFixed(1) || 0}%</div>
                <div class="stat-label">Average Success Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${comparison.summary.bestPerformingModel?.modelInfo?.provider || 'N/A'}</div>
                <div class="stat-label">Best Provider</div>
            </div>
        </div>

        <div class="section">
            <h2>🏆 Model Rankings</h2>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Model</th>
                        <th>Provider</th>
                        <th>Success Rate</th>
                        <th>Total Tasks</th>
                        <th>Successful</th>
                        <th>Failed</th>
                    </tr>
                </thead>
                <tbody>
                    ${comparison.summary.modelRankings.map(model => {
                        const result = comparison.results.find(r => r.modelId === model.modelId);
                        const rankClass = model.rank <= 3 ? `rank-${model.rank}` : '';
                        return `
                        <tr class="${rankClass}">
                            <td>${model.rank === 1 ? '🥇' : model.rank === 2 ? '🥈' : model.rank === 3 ? '🥉' : model.rank}</td>
                            <td class="model-id">${model.modelId}</td>
                            <td><span class="provider-badge provider-${model.provider}">${model.provider}</span></td>
                            <td><strong>${model.successRate}%</strong></td>
                            <td>${result?.totalTasks || 0}</td>
                            <td style="color: #10b981">${result?.successfulTasks || 0}</td>
                            <td style="color: #ef4444">${result?.failedTasks || 0}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>

        ${comparison.results.length > 0 ? `
        <div class="section">
            <h2>📊 Performance Comparison Chart</h2>
            <div class="chart-container">
                <canvas id="comparisonChart" width="400" height="200"></canvas>
            </div>
        </div>
        ` : ''}

        ${comparison.errors.length > 0 ? `
        <div class="section">
            <h2>❌ Failed Models</h2>
            <table>
                <thead><tr><th>Model</th><th>Error</th></tr></thead>
                <tbody>
                    ${comparison.errors.map(error => `
                        <tr>
                            <td class="model-id">${error.model}</td>
                            <td style="color: #ef4444">${error.error}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="section">
            <h2>📋 Detailed Results</h2>
            ${comparison.results.map(result => `
                <div style="margin: 20px 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h3>${result.modelId} <span class="provider-badge provider-${result.modelInfo?.provider}">${result.modelInfo?.provider}</span></h3>
                    <p><strong>Success Rate:</strong> ${result.successRate}%</p>
                    <p><strong>Recommended for:</strong> ${result.modelInfo?.recommended_for}</p>
                    <p><strong>Tasks:</strong> ${result.successfulTasks}/${result.totalTasks} successful</p>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        ${comparison.results.length > 0 ? `
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(comparison.results.map(r => r.modelId.split('/').pop()))},
                datasets: [{
                    label: 'Success Rate (%)',
                    data: ${JSON.stringify(comparison.results.map(r => r.successRate))},
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
        ` : ''}
    </script>
</body>
</html>`;
  }

  // Predefined benchmark configurations
  async runFastComparison() {
    const models = this.getModelsByCategory('fast_testing');
    return await this.runMultiModelComparison(models, { taskLimit: 1 });
  }

  async runQualityComparison() {
    const models = this.getModelsByCategory('quality_testing');
    return await this.runMultiModelComparison(models, { taskLimit: 2 });
  }

  async runReasoningComparison() {
    const models = this.getModelsByCategory('reasoning_testing');
    return await this.runMultiModelComparison(models, { taskLimit: 2 });
  }

  async runCodingComparison() {
    const models = this.getModelsByCategory('coding_testing');
    return await this.runMultiModelComparison(models, { taskLimit: 3 });
  }

  async runProviderComparison(provider) {
    const models = this.getModelsByProvider(provider);
    return await this.runMultiModelComparison(models, { taskLimit: 2 });
  }
}

// CLI interface
if (process.argv[1] && process.argv[1].includes('multiModelBenchmark.js')) {
  const runner = new MultiModelBenchmarkRunner();
  await runner.loadSupportedModels();

  const command = process.argv[2] || 'fast';
  const customModels = process.argv[3]?.split(',');

  try {
    let result;

    if (customModels) {
      console.log('Running custom model comparison...');
      result = await runner.runMultiModelComparison(customModels, { taskLimit: 1 });
    } else {
      switch (command) {
        case 'fast':
          result = await runner.runFastComparison();
          break;
        case 'quality':
          result = await runner.runQualityComparison();
          break;
        case 'reasoning':
          result = await runner.runReasoningComparison();
          break;
        case 'coding':
          result = await runner.runCodingComparison();
          break;
        case 'anthropic':
        case 'openai':
        case 'google':
        case 'deepseek':
        case 'qwen':
        case 'xai':
          result = await runner.runProviderComparison(command);
          break;
        default:
          console.log('Usage: node multiModelBenchmark.js [fast|quality|reasoning|coding|anthropic|openai|google|deepseek|qwen|xai] [model1,model2,model3]');
          process.exit(1);
      }
    }

    console.log('\\n🎉 Multi-model benchmark completed!');
    console.log('Best performing model:', result.summary.bestPerformingModel?.modelId);
    process.exit(0);
  } catch (error) {
    console.error('Multi-model benchmark failed:', error);
    process.exit(1);
  }
}