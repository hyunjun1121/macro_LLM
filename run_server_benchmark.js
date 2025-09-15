import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';

dotenv.config();

const TARGET_MODELS = [
  'openai/gpt-4.1',
  'google/gemini-2.5-pro-thinking-on',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini'
];

async function runServerBenchmark(modelName, resumeFromPrevious = false) {
  if (!TARGET_MODELS.includes(modelName)) {
    console.error(`❌ Invalid model: ${modelName}`);
    console.error(`   Available models: ${TARGET_MODELS.join(', ')}`);
    process.exit(1);
  }

  // Force server environment settings
  process.env.SERVER_MODE = 'true';
  process.env.HEADLESS = 'true';
  process.env.DISPLAY = process.env.DISPLAY || ':99';

  console.log('🐧 Starting Linux Server LLM Benchmark');
  console.log('=' * 60);
  console.log(`🎯 Target Model: ${modelName}`);
  console.log(`📊 Processing: 200 tasks across 10 websites`);
  console.log(`🔄 Resume mode: ${resumeFromPrevious ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🖥️  Server mode: HEADLESS (no GUI required)`);
  console.log('');

  const globalStartTime = Date.now();

  try {
    const runner = new BenchmarkRunner({
      models: [modelName]
    });

    // Override max retries for server (reduce from 5 to 3)
    runner.config.maxRetries = 3;

    console.log(`⏱️  Starting ${modelName} benchmark...`);
    console.log(`📋 Expected: Up to 200 tasks (will skip completed if resume enabled)`);

    const results = await runner.runBenchmark({
      websites: [], // All websites
      taskLimit: null, // All tasks
      parallel: false, // Single process for server stability
      skipFailedTasks: true,
      resume: resumeFromPrevious,
      model: modelName,
      serverMode: true // Pass server mode flag
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

    // Save server-specific report
    const serverReport = {
      timestamp: new Date().toISOString(),
      server_environment: {
        os: process.platform,
        node_version: process.version,
        headless_mode: true,
        display: process.env.DISPLAY
      },
      model: modelName,
      execution_time_minutes: totalTime,
      summary: results.summary,
      website_performance: websitePerformance,
      detailed_stats: results.websiteStats,
      resume_used: resumeFromPrevious
    };

    try {
      const reportPath = `./benchmark_results/reports/server_${modelName.replace('/', '_')}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      await import('fs/promises').then(fs =>
        fs.mkdir('./benchmark_results/reports', { recursive: true }).then(() =>
          fs.writeFile(reportPath, JSON.stringify(serverReport, null, 2))
        )
      );
      console.log(`\\n💾 Server report saved: ${reportPath}`);
    } catch (saveError) {
      console.warn('⚠️  Could not save server report:', saveError.message);
    }

    console.log(`\\n✨ ${modelName} server benchmark complete!`);
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
  console.log('🐧 Linux Server Benchmark Runner');
  console.log('');
  console.log('Usage:');
  console.log('  node run_server_benchmark.js <model> [resume]');
  console.log('');
  console.log('Available models:');
  TARGET_MODELS.forEach(model => {
    console.log(`  - ${model}`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  node run_server_benchmark.js "openai/gpt-4.1"');
  console.log('  node run_server_benchmark.js "openai/gpt-4.1" resume');
  console.log('  nohup node run_server_benchmark.js "google/gemini-2.5-pro-thinking-on" resume > gpt4.log 2>&1 &');
  process.exit(0);
}

const shouldResume = resumeFlag === 'resume';

console.log('🔧 Environment Check:');
console.log(`   API Key: ${process.env.API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   Base URL: ${process.env.BASE_URL || '❌ Missing'}`);
console.log(`   Server Mode: ${process.env.SERVER_MODE ? '✅ Enabled' : '❌ Not set'}`);
console.log(`   Display: ${process.env.DISPLAY || 'Not set (headless)'}`);
console.log('');

if (!process.env.API_KEY || !process.env.BASE_URL) {
  console.error('❌ Missing required environment variables. Please check .env file.');
  process.exit(1);
}

runServerBenchmark(modelName, shouldResume).catch(error => {
  console.error('❌ Server benchmark failed:', error);
  process.exit(1);
});