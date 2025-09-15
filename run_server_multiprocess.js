import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';
import cluster from 'cluster';
import os from 'os';

dotenv.config();

const TARGET_MODELS = [
  'openai/gpt-4.1',
  'google/gemini-2.5-pro-thinking-on',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini'
];

const MAX_PROCESSES = 10; // Adjusted to 10 workers as requested
const CONCURRENT_TASKS = 8; // Tasks per process

async function runServerMultiprocessBenchmark() {
  // Force server environment settings
  process.env.SERVER_MODE = 'true';
  process.env.HEADLESS = 'true';
  process.env.DISPLAY = process.env.DISPLAY || ':99';

  console.log('🐧 Starting Linux Server Multi-Process LLM Benchmark');
  console.log('=' * 70);
  console.log(`🎯 Target Models: ${TARGET_MODELS.join(', ')}`);
  console.log(`📊 Processing: 200 tasks per model (800 total)`);
  console.log(`⚡ Multi-process: ${MAX_PROCESSES} processes`);
  console.log(`🔄 Resume mode: ENABLED for all models`);
  console.log(`🖥️  Server mode: HEADLESS (no GUI required)`);
  console.log('');

  const globalStartTime = Date.now();

  if (cluster.isPrimary) {
    console.log(`🚀 Master process ${process.pid} starting...`);
    console.log(`💻 Available CPU cores: ${os.cpus().length}`);
    console.log(`⚙️  Using ${MAX_PROCESSES} worker processes`);

    // Create a queue of all model-task combinations
    const taskQueue = [];
    for (const model of TARGET_MODELS) {
      taskQueue.push({ model, resume: true });
    }

    let completedModels = 0;
    const results = {};

    // Track worker assignments
    const workerAssignments = new Map();
    let taskIndex = 0;

    // Create worker processes
    for (let i = 0; i < Math.min(MAX_PROCESSES, taskQueue.length); i++) {
      const worker = cluster.fork();

      // Assign initial task
      if (taskIndex < taskQueue.length) {
        const task = taskQueue[taskIndex++];
        worker.send(task);
        workerAssignments.set(worker.id, task);
        console.log(`👷 Worker ${worker.id} assigned: ${task.model}`);
      }
    }

    // Handle worker messages
    cluster.on('message', (worker, message) => {
      if (message.type === 'completed') {
        const assignment = workerAssignments.get(worker.id);
        results[assignment.model] = message.data;
        completedModels++;

        console.log(`✅ ${assignment.model} completed by worker ${worker.id}`);
        console.log(`   Success Rate: ${message.data.summary.successRate}`);
        console.log(`   Tasks: ${message.data.summary.successfulTasks}/${message.data.summary.totalTasks}`);

        // Assign next task if available
        if (taskIndex < taskQueue.length) {
          const nextTask = taskQueue[taskIndex++];
          worker.send(nextTask);
          workerAssignments.set(worker.id, nextTask);
          console.log(`👷 Worker ${worker.id} reassigned: ${nextTask.model}`);
        } else {
          // No more tasks, kill worker
          worker.kill();
        }

        // Check if all models completed
        if (completedModels === TARGET_MODELS.length) {
          console.log('\\n🎉 ALL MODELS COMPLETED!');
          const totalTime = (Date.now() - globalStartTime) / 1000 / 60;
          console.log(`⏱️  Total execution time: ${totalTime.toFixed(2)} minutes`);

          // Generate combined report
          generateCombinedReport(results, totalTime);

          process.exit(0);
        }
      } else if (message.type === 'error') {
        console.error(`❌ Worker ${worker.id} error:`, message.error);
      }
    });

    // Handle worker exits
    cluster.on('exit', (worker, code, signal) => {
      console.log(`🔄 Worker ${worker.id} exited (${code || signal})`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\\n🛑 Shutting down all workers...');
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
      process.exit(0);
    });

  } else {
    // Worker process
    console.log(`👷 Worker ${process.pid} ready`);

    process.on('message', async (task) => {
      try {
        console.log(`🚀 Worker ${process.pid} starting ${task.model}...`);

        const runner = new BenchmarkRunner({
          models: [task.model]
        });

        // Override max retries for server (reduce from 5 to 3)
        runner.config.maxRetries = 3;

        const results = await runner.runBenchmark({
          websites: [], // All websites
          taskLimit: null, // All tasks
          parallel: false, // Single process per worker
          skipFailedTasks: true,
          resume: task.resume,
          model: task.model,
          serverMode: true,
          concurrency: CONCURRENT_TASKS
        });

        // Send results back to master
        process.send({
          type: 'completed',
          model: task.model,
          data: results
        });

      } catch (error) {
        process.send({
          type: 'error',
          model: task.model,
          error: error.message
        });
      }
    });
  }
}

async function generateCombinedReport(results, totalTime) {
  try {
    const combinedReport = {
      timestamp: new Date().toISOString(),
      server_environment: {
        os: process.platform,
        node_version: process.version,
        cpu_cores: os.cpus().length,
        max_processes: MAX_PROCESSES,
        headless_mode: true,
        display: process.env.DISPLAY
      },
      execution_time_minutes: totalTime,
      models: TARGET_MODELS,
      results: results,
      summary: {
        total_tasks: Object.values(results).reduce((sum, r) => sum + r.summary.totalTasks, 0),
        total_successful: Object.values(results).reduce((sum, r) => sum + r.summary.successfulTasks, 0),
        overall_success_rate: (Object.values(results).reduce((sum, r) => sum + r.summary.successfulTasks, 0) /
                               Object.values(results).reduce((sum, r) => sum + r.summary.totalTasks, 0) * 100).toFixed(2) + '%'
      }
    };

    const reportPath = `./benchmark_results/reports/server_multiprocess_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    await import('fs/promises').then(fs =>
      fs.mkdir('./benchmark_results/reports', { recursive: true }).then(() =>
        fs.writeFile(reportPath, JSON.stringify(combinedReport, null, 2))
      )
    );

    console.log(`\\n💾 Combined server report saved: ${reportPath}`);

    // Print summary
    console.log('\\n📊 FINAL SUMMARY:');
    console.log('=' * 50);
    console.log(`Total Tasks: ${combinedReport.summary.total_tasks}`);
    console.log(`Successful: ${combinedReport.summary.total_successful}`);
    console.log(`Overall Success Rate: ${combinedReport.summary.overall_success_rate}`);
    console.log('\\nPer Model Results:');
    Object.entries(results).forEach(([model, result]) => {
      console.log(`  ${model}: ${result.summary.successfulTasks}/${result.summary.totalTasks} (${result.summary.successRate})`);
    });

  } catch (error) {
    console.warn('⚠️  Could not save combined report:', error.message);
  }
}

console.log('🔧 Environment Check:');
console.log(`   API Key: ${process.env.API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   Base URL: ${process.env.BASE_URL || '❌ Missing'}`);
console.log(`   CPU Cores: ${os.cpus().length}`);
console.log(`   Max Processes: ${MAX_PROCESSES}`);
console.log(`   Display: ${process.env.DISPLAY || 'Not set (headless)'}`);
console.log('');

if (!process.env.API_KEY || !process.env.BASE_URL) {
  console.error('❌ Missing required environment variables. Please check .env file.');
  process.exit(1);
}

runServerMultiprocessBenchmark().catch(error => {
  console.error('❌ Server multiprocess benchmark failed:', error);
  process.exit(1);
});