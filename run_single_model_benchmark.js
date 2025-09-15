import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';

dotenv.config();

const AVAILABLE_MODELS = [
  'openai/gpt-4.1',
  'google/gemini-2.5-pro-thinking-on',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini'
];

async function runSingleModelBenchmark(modelName, resumeFromPrevious = false) {
  if (!AVAILABLE_MODELS.includes(modelName)) {
    console.error(`❌ Invalid model: ${modelName}`);
    console.error(`   Available models: ${AVAILABLE_MODELS.join(', ')}`);
    process.exit(1);
  }

  console.log('🚀 Starting Single Model LLM Benchmark');
  console.log('=' * 60);
  console.log(`🎯 Target Model: ${modelName}`);
  console.log(`📊 Processing: 200 tasks across 10 websites`);
  console.log(`🔄 Resume mode: ${resumeFromPrevious ? 'ENABLED' : 'DISABLED'}`);
  console.log(`⚡ Single process execution for stability`);
  console.log('');

  const globalStartTime = Date.now();

  try {
    const runner = new BenchmarkRunner({
      models: [modelName]
    });

    console.log(`⏱️  Starting ${modelName} benchmark...`);
    console.log(`📋 Expected: Up to 200 tasks (will skip completed if resume enabled)`);

    const results = await runner.runBenchmark({
      websites: [], // All websites
      taskLimit: null, // All tasks
      parallel: false, // Single process
      skipFailedTasks: true,
      resume: resumeFromPrevious, // Resume from previous run
      model: modelName // Pass model for resume filtering
    });

    const totalTime = (Date.now() - globalStartTime) / 1000 / 60;

    console.log(`\\n✅ ${modelName} completed in ${totalTime.toFixed(2)} minutes`);
    console.log(`   Success Rate: ${results.summary.successRate}`);
    console.log(`   Tasks: ${results.summary.successfulTasks}/${results.summary.totalTasks}`);

    // Show top performing websites
    console.log(`\\n🏆 WEBSITE PERFORMANCE:`);
    console.log('-'.repeat(40));

    const websitePerformance = Object.entries(results.websiteStats)
      .map(([name, stats]) => ({
        name,
        rate: (stats.success / stats.total * 100).toFixed(1),
        success: stats.success,
        total: stats.total
      }))
      .sort((a, b) => b.rate - a.rate);

    websitePerformance.forEach(w => {
      console.log(`   ${w.name}: ${w.success}/${w.total} (${w.rate}%)`);
    });

    // Save model-specific report
    const modelReport = {
      timestamp: new Date().toISOString(),
      model: modelName,
      execution_time_minutes: totalTime,
      summary: results.summary,
      website_performance: websitePerformance,
      detailed_stats: results.websiteStats,
      resume_used: resumeFromPrevious
    };

    try {
      const reportPath = `./benchmark_results/reports/single_model_${modelName.replace('/', '_')}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      await import('fs/promises').then(fs =>
        fs.mkdir('./benchmark_results/reports', { recursive: true }).then(() =>
          fs.writeFile(reportPath, JSON.stringify(modelReport, null, 2))
        )
      );
      console.log(`\\n💾 Model report saved: ${reportPath}`);
    } catch (saveError) {
      console.warn('⚠️  Could not save model report:', saveError.message);
    }

    console.log(`\\n✨ ${modelName} benchmark complete!`);
    console.log('📈 Results are saved in benchmark_results/ directory');

    return results;

  } catch (error) {
    console.error(`❌ ${modelName} failed:`, error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Parse command line arguments
const modelName = process.argv[2];
const resumeFlag = process.argv[3];

if (!modelName) {
  console.log('🔧 Single Model Benchmark Runner');
  console.log('');
  console.log('Usage:');
  console.log('  node run_single_model_benchmark.js <model> [resume]');
  console.log('');
  console.log('Available models:');
  AVAILABLE_MODELS.forEach(model => {
    console.log(`  - ${model}`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  node run_single_model_benchmark.js "openai/gpt-4.1"');
  console.log('  node run_single_model_benchmark.js "openai/gpt-4.1" resume');
  console.log('  node run_single_model_benchmark.js "google/gemini-2.5-pro-thinking-on"');
  process.exit(0);
}

const shouldResume = resumeFlag === 'resume';

console.log('🔧 Environment Check:');
console.log(`   API Key: ${process.env.API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   Base URL: ${process.env.BASE_URL || '❌ Missing'}`);
console.log('');

if (!process.env.API_KEY || !process.env.BASE_URL) {
  console.error('❌ Missing required environment variables. Please check .env file.');
  process.exit(1);
}

runSingleModelBenchmark(modelName, shouldResume).catch(error => {
  console.error('❌ Benchmark failed:', error);
  process.exit(1);
});