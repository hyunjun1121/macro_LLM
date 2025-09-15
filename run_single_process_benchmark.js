import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';

dotenv.config();

const TARGET_MODELS = [
  'openai/gpt-4.1',
  'google/gemini-2.5-pro-thinking-on',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini'
];

async function runSingleProcessBenchmark() {
  console.log('🚀 Starting Single-Process LLM Benchmark');
  console.log('=' * 60);
  console.log(`🎯 Target Models: ${TARGET_MODELS.join(', ')}`);
  console.log(`📊 Sequential processing: 200 tasks per model`);
  console.log(`⚡ Stability-focused: No parallel processing`);
  console.log('');

  const globalStartTime = Date.now();
  const allModelResults = new Map();

  for (const [modelIndex, model] of TARGET_MODELS.entries()) {
    console.log(`\\n🤖 Model ${modelIndex + 1}/${TARGET_MODELS.length}: ${model}`);
    console.log('='.repeat(50));

    const modelStartTime = Date.now();

    try {
      const runner = new BenchmarkRunner({
        models: [model]
      });

      console.log(`⏱️  Starting ${model} benchmark...`);
      console.log(`📋 Expected: 200 tasks across 10 websites`);

      const results = await runner.runBenchmark({
        websites: [], // All websites
        taskLimit: null, // All tasks
        parallel: false, // Explicitly disable parallel processing
        skipFailedTasks: true,
        resume: true, // Enable resume functionality
        model: model // Pass current model for resume filtering
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

    const remainingModels = TARGET_MODELS.length - modelIndex - 1;
    if (remainingModels > 0) {
      console.log(`\\n⏳ Remaining models: ${remainingModels}`);

      // Estimate remaining time based on current model's performance
      const avgTimePerModel = (Date.now() - globalStartTime) / 1000 / 60 / (modelIndex + 1);
      const estimatedRemaining = avgTimePerModel * remainingModels;
      console.log(`📊 Estimated remaining time: ${estimatedRemaining.toFixed(0)} minutes`);

      console.log('🔄 Preparing next model...');
      // Brief pause to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  const totalTime = (Date.now() - globalStartTime) / 1000 / 60;

  console.log('\\n🎉 SINGLE-PROCESS BENCHMARK COMPLETED!');
  console.log('=' * 60);
  console.log(`⏱️  Total Runtime: ${totalTime.toFixed(2)} minutes`);
  console.log(`🎯 Models Processed: ${allModelResults.size}`);
  console.log('');

  // Summary report
  console.log('📊 FINAL RESULTS SUMMARY:');
  console.log('-'.repeat(60));

  for (const [model, data] of allModelResults.entries()) {
    if (data.results) {
      console.log(`${model}:`);
      console.log(`  ✅ Success Rate: ${data.results.summary.successRate}`);
      console.log(`  📝 Tasks: ${data.results.summary.successfulTasks}/${data.results.summary.totalTasks}`);
      console.log(`  ⏱️  Time: ${data.executionTime.toFixed(2)} minutes`);

      // Show top performing websites
      const websitePerformance = Object.entries(data.results.websiteStats)
        .map(([name, stats]) => ({
          name,
          rate: (stats.success / stats.total * 100).toFixed(1)
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5);

      console.log(`  🏆 Top websites: ${websitePerformance.map(w => `${w.name} (${w.rate}%)`).join(', ')}`);
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
    processing_type: "single-process",
    total_runtime_minutes: totalTime,
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

  try {
    const reportPath = `./benchmark_results/reports/single_process_benchmark_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    await import('fs/promises').then(fs =>
      fs.mkdir('./benchmark_results/reports', { recursive: true }).then(() =>
        fs.writeFile(reportPath, JSON.stringify(comprehensiveReport, null, 2))
      )
    );
    console.log(`💾 Comprehensive report saved: ${reportPath}`);
  } catch (saveError) {
    console.warn('⚠️  Could not save comprehensive report:', saveError.message);
  }

  // Performance insights
  const successfulModels = Array.from(allModelResults.entries()).filter(([, data]) => data.results);
  if (successfulModels.length > 1) {
    console.log('\\n🏆 PERFORMANCE RANKING:');
    console.log('-'.repeat(40));

    successfulModels
      .sort((a, b) => parseFloat(b[1].results.summary.successRate) - parseFloat(a[1].results.summary.successRate))
      .forEach(([model, data], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        console.log(`${medal} ${model}`);
        console.log(`     Success: ${data.results.summary.successRate}`);
        console.log(`     Time: ${data.executionTime.toFixed(1)}m`);
      });
  }

  console.log('\\n✨ Single-process benchmark complete!');
  console.log('📈 Results are saved in benchmark_results/ directory');
}

console.log('🔧 Environment Check:');
console.log(`   API Key: ${process.env.API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   Base URL: ${process.env.BASE_URL || '❌ Missing'}`);
console.log('');

if (!process.env.API_KEY || !process.env.BASE_URL) {
  console.error('❌ Missing required environment variables. Please check .env file.');
  process.exit(1);
}

runSingleProcessBenchmark().catch(error => {
  console.error('❌ Critical benchmark failure:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});