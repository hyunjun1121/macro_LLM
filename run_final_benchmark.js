import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';

dotenv.config();

async function runFinalBenchmark() {
  console.log('🚀 Starting Final LLM Web Automation Benchmark');
  console.log('=' * 60);
  console.log('📊 Target Models: openai/gpt-4.1, google/gemini-2.5-pro-thinking-on,');
  console.log('                  deepseek-ai/DeepSeek-V3.1-thinking-on, openai/gpt-4o-mini');
  console.log('🎯 Pure Benchmark: Full HTML/CSS/JS provided to LLMs for analysis');
  console.log('✅ Rule-based Validation: Ground Truth validation system active');
  console.log('');

  const runner = new BenchmarkRunner({
    models: [
      'openai/gpt-4.1',
      'google/gemini-2.5-pro-thinking-on',
      'deepseek-ai/DeepSeek-V3.1-thinking-on',
      'openai/gpt-4o-mini'
    ]
  });

  try {
    console.log('⏱️  Expected runtime: ~30-60 minutes for all models and websites');
    console.log('📈 Progress will be shown for each task...\n');

    const results = await runner.runBenchmark({
      websites: [], // All websites (10 total: youtube, reddit, etc.)
      taskLimit: null, // All tasks (~200 total)
      parallel: false // Sequential for stability
    });

    console.log('\n🎉 FINAL BENCHMARK COMPLETED!');
    console.log('=' * 60);
    console.log(`✅ Total Tasks: ${results.summary.totalTasks}`);
    console.log(`✅ Success Rate: ${results.summary.successRate}`);
    console.log(`✅ Results saved to: E:\\Project\\web-agent\\benchmark_results`);
    console.log('\n📊 Website Performance:');
    for (const [website, stats] of Object.entries(results.websiteStats)) {
      console.log(`   ${website}: ${stats.success}/${stats.total} (${((stats.success/stats.total)*100).toFixed(1)}%)`);
    }

  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

console.log('🔧 Environment Check:');
console.log(`   API Key: ${process.env.API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   Base URL: ${process.env.BASE_URL || '❌ Missing'}`);
console.log('');

runFinalBenchmark();