import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';
import cluster from 'cluster';
import os from 'os';

dotenv.config();

const AVAILABLE_MODELS = [
  'openai/gpt-4.1',
  'google/gemini-2.5-pro-thinking-on',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini'
];

const MAX_PROCESSES = 10; // Adjusted to 10 workers
const CONCURRENT_TASKS = 5; // Tasks per process

async function runSingleModelMultiprocess(modelName, resumeFromPrevious = false) {
  if (!AVAILABLE_MODELS.includes(modelName)) {
    console.error(`❌ Invalid model: ${modelName}`);
    console.error(`   Available models: ${AVAILABLE_MODELS.join(', ')}`);
    process.exit(1);
  }

  // Force server environment settings
  process.env.SERVER_MODE = 'true';
  process.env.HEADLESS = 'true';
  process.env.DISPLAY = process.env.DISPLAY || ':99';

  console.log('🚀 Starting Single Model Multi-Process Benchmark');
  console.log('=' * 70);
  console.log(`🎯 Target Model: ${modelName}`);
  console.log(`📊 Processing: 200 tasks`);
  console.log(`⚡ Multi-process: ${MAX_PROCESSES} processes`);
  console.log(`🔄 Resume mode: ${resumeFromPrevious ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🖥️  Server mode: HEADLESS`);
  console.log('');

  const globalStartTime = Date.now();

  if (cluster.isPrimary) {
    console.log(`🚀 Master process ${process.pid} starting for ${modelName}...`);
    console.log(`💻 Available CPU cores: ${os.cpus().length}`);
    console.log(`⚙️  Using ${MAX_PROCESSES} worker processes`);

    let completedWorkers = 0;
    const results = {};

    // Create workers
    for (let i = 0; i < MAX_PROCESSES; i++) {
      const worker = cluster.fork({
        WORKER_ID: i,
        MODEL_NAME: modelName,
        RESUME_MODE: resumeFromPrevious.toString()
      });

      worker.on('message', (message) => {
        if (message.type === 'progress') {
          console.log(`📊 Worker ${message.workerId}: ${message.data}`);
        } else if (message.type === 'result') {
          results[message.workerId] = message.data;
          completedWorkers++;

          if (completedWorkers === MAX_PROCESSES) {
            const totalTime = (Date.now() - globalStartTime) / 1000 / 60;
            console.log(`\\n✅ ${modelName} completed in ${totalTime.toFixed(2)} minutes`);

            // Calculate combined stats
            let totalTasks = 0;
            let successfulTasks = 0;
            for (const result of Object.values(results)) {
              totalTasks += result.summary?.totalTasks || 0;
              successfulTasks += result.summary?.successfulTasks || 0;
            }

            const successRate = totalTasks > 0 ? ((successfulTasks / totalTasks) * 100).toFixed(1) : 'N/A';
            console.log(`   Success Rate: ${successRate}%`);
            console.log(`   Tasks: ${successfulTasks}/${totalTasks}`);
            console.log(`\\n✨ ${modelName} multiprocess benchmark complete!`);

            process.exit(0);
          }
        }
      });

      worker.on('error', (error) => {
        console.error(`❌ Worker ${i} error:`, error);
      });
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`⚠️  Worker ${worker.process.pid} died (${signal || code})`);
    });

  } else {
    // Worker process
    const workerId = parseInt(process.env.WORKER_ID);
    const modelName = process.env.MODEL_NAME;
    const resumeMode = process.env.RESUME_MODE === 'true';

    try {
      process.send({ type: 'progress', workerId, data: `Starting ${modelName} worker...` });

      const runner = new BenchmarkRunner({
        models: [modelName]
      });

      // Reduce retries for server efficiency
      runner.config.maxRetries = 3;

      const results = await runner.runBenchmark({
        websites: [], // All websites
        taskLimit: null, // All tasks
        parallel: false, // Single process per worker
        skipFailedTasks: true,
        resume: resumeMode,
        model: modelName,
        workerId: workerId // Pass worker ID for task distribution
      });

      process.send({
        type: 'result',
        workerId,
        data: results
      });

    } catch (error) {
      console.error(`❌ Worker ${workerId} failed:`, error);
      process.send({
        type: 'error',
        workerId,
        error: error.message
      });
      process.exit(1);
    }
  }
}

// Parse command line arguments
const modelName = process.argv[2];
const resumeFlag = process.argv[3];

if (!modelName) {
  console.log('🔧 Single Model Multi-Process Benchmark Runner');
  console.log('');
  console.log('Usage:');
  console.log('  node run_single_model_multiprocess.js <model> [resume]');
  console.log('');
  console.log('Available models:');
  AVAILABLE_MODELS.forEach(model => {
    console.log(`  - ${model}`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  node run_single_model_multiprocess.js "openai/gpt-4.1" resume');
  console.log('  node run_single_model_multiprocess.js "google/gemini-2.5-pro-thinking-on" resume');
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

runSingleModelMultiprocess(modelName, shouldResume).catch(error => {
  console.error('❌ Benchmark failed:', error);
  process.exit(1);
});