import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';

dotenv.config();

const TARGET_MODELS = [
  'openai/gpt-4.1',
  'google/gemini-2.5-pro-thinking-on',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini'
];

async function runFullBenchmark() {
  console.log('🚀 Starting Full Multi-Processing LLM Benchmark');
  console.log('=' * 80);
  console.log(`🎯 Target Models: ${TARGET_MODELS.join(', ')}`);
  console.log(`⚡ Concurrency: 6 parallel tasks per website`);
  console.log(`📊 Expected ~200 tasks across ~10 websites`);
  console.log('');

  const globalStartTime = Date.now();
  const allModelResults = new Map();

  for (const [modelIndex, model] of TARGET_MODELS.entries()) {
    console.log(`\\n🤖 Model ${modelIndex + 1}/${TARGET_MODELS.length}: ${model}`);
    console.log('='.repeat(60));

    const modelStartTime = Date.now();

    try {
      const runner = new BenchmarkRunner({
        models: [model]
      });

      const results = await runner.runBenchmark({
        websites: [], // All websites
        taskLimit: null, // All tasks
        parallel: true, // Enable parallel processing
        concurrency: 6, // 6 parallel tasks as requested
        skipFailedTasks: true
      });

      const modelTime = (Date.now() - modelStartTime) / 1000 / 60;

      console.log(`\\n✅ ${model} completed in ${modelTime.toFixed(2)} minutes`);
      console.log(`   Success Rate: ${results.summary.successRate}`);
      console.log(`   Tasks: ${results.summary.successfulTasks}/${results.summary.totalTasks}`);

      allModelResults.set(model, {
        results,
        executionTime: modelTime
      });

    } catch (error) {
      console.error(`❌ ${model} failed:`, error.message);
      console.error('Error stack:', error.stack);

      allModelResults.set(model, {
        results: null,
        error: error.message,
        executionTime: (Date.now() - modelStartTime) / 1000 / 60
      });
    }

    console.log(`\\n⏱️  Remaining models: ${TARGET_MODELS.length - modelIndex - 1}`);

    if (modelIndex < TARGET_MODELS.length - 1) {
      console.log('🔄 Preparing next model...');
      // Small delay to prevent resource conflicts
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  const totalTime = (Date.now() - globalStartTime) / 1000 / 60;

  console.log('\\n🎉 FULL BENCHMARK COMPLETED!');
  console.log('=' * 80);
  console.log(`⏱️  Total Runtime: ${totalTime.toFixed(2)} minutes`);
  console.log(`🎯 Models Processed: ${allModelResults.size}`);
  console.log('');

  // Summary report
  console.log('📊 FINAL RESULTS SUMMARY:');
  console.log('-'.repeat(80));

  for (const [model, data] of allModelResults.entries()) {
    if (data.results) {
      console.log(`${model}:`);
      console.log(`  ✅ Success Rate: ${data.results.summary.successRate}`);
      console.log(`  📝 Tasks: ${data.results.summary.successfulTasks}/${data.results.summary.totalTasks}`);
      console.log(`  ⏱️  Time: ${data.executionTime.toFixed(2)} minutes`);
      console.log(`  📊 Website Performance:`);

      for (const [website, stats] of Object.entries(data.results.websiteStats)) {
        const rate = ((stats.success / stats.total) * 100).toFixed(1);
        console.log(`     ${website}: ${stats.success}/${stats.total} (${rate}%)`);
      }
    } else {
      console.log(`${model}:`);
      console.log(`  ❌ Failed: ${data.error}`);
      console.log(`  ⏱️  Time: ${data.executionTime.toFixed(2)} minutes`);
    }
    console.log('');
  }

  // Save comprehensive report
  const comprehensiveReport = {
    timestamp: new Date().toISOString(),
    total_runtime_minutes: totalTime,
    concurrency_setting: 6,
    target_models: TARGET_MODELS,
    model_results: {}
  };

  for (const [model, data] of allModelResults.entries()) {
    comprehensiveReport.model_results[model] = {
      success: !!data.results,
      execution_time_minutes: data.executionTime,
      error: data.error || null,
      summary: data.results?.summary || null,
      detailed_stats: data.results?.websiteStats || null
    };
  }

  const reportPath = `./benchmark_results/reports/comprehensive_multiprocessing_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  await import('fs/promises').then(fs =>
    fs.mkdir('./benchmark_results/reports', { recursive: true }).then(() =>
      fs.writeFile(reportPath, JSON.stringify(comprehensiveReport, null, 2))
    )
  );

  console.log(`💾 Comprehensive report saved: ${reportPath}`);

  // Performance insights
  const successfulModels = Array.from(allModelResults.entries()).filter(([, data]) => data.results);
  if (successfulModels.length > 1) {
    console.log('\\n🏆 PERFORMANCE COMPARISON:');
    console.log('-'.repeat(50));

    successfulModels
      .sort((a, b) => parseFloat(b[1].results.summary.successRate) - parseFloat(a[1].results.summary.successRate))
      .forEach(([model, data], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        console.log(`${medal} ${model}: ${data.results.summary.successRate} (${data.executionTime.toFixed(1)}m)`);
      });
  }

  console.log('\\n✨ Benchmark analysis complete!');
}

console.log('🔧 Environment Check:');
console.log(`   API Key: ${process.env.API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   Base URL: ${process.env.BASE_URL || '❌ Missing'}`);
console.log('');

if (!process.env.API_KEY || !process.env.BASE_URL) {
  console.error('❌ Missing required environment variables. Please check .env file.');
  process.exit(1);
}

runFullBenchmark().catch(error => {
  console.error('❌ Critical benchmark failure:', error);
  process.exit(1);
});