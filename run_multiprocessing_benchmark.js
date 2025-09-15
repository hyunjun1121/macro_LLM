import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';
import { Worker } from 'worker_threads';
import { cpus } from 'os';
import path from 'path';
import fs from 'fs/promises';

dotenv.config();

const TARGET_MODELS = [
  'openai/gpt-4.1',
  'google/gemini-2.5-pro-thinking-on',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini'
];

const MAX_WORKERS = 6; // User requested 6 workers

async function createWorkerScript() {
  const workerScript = `
import { parentPort, workerData } from 'worker_threads';
import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';

dotenv.config();

async function runBenchmarkTask() {
  try {
    const { model, taskBatch, startIndex } = workerData;

    console.log(\`🧵 Worker starting for \${model} with \${taskBatch.length} tasks (batch \${startIndex})\`);

    const runner = new BenchmarkRunner({
      models: [model]
    });

    // Run benchmark for specific tasks
    const results = await runner.runBenchmark({
      websites: [], // All websites
      taskLimit: null,
      parallel: false,
      customTaskFilter: (task, website) => {
        const taskId = \`\${website}_\${task.id}\`;
        return taskBatch.includes(taskId);
      }
    });

    parentPort.postMessage({
      success: true,
      model,
      results,
      startIndex,
      taskCount: taskBatch.length
    });

  } catch (error) {
    parentPort.postMessage({
      success: false,
      model: workerData.model,
      error: error.message,
      stack: error.stack,
      startIndex: workerData.startIndex
    });
  }
}

runBenchmarkTask();
`;

  await fs.writeFile('./worker_benchmark.js', workerScript);
  return './worker_benchmark.js';
}

async function getAllTaskIds() {
  const runner = new BenchmarkRunner();
  const allTasks = await runner.taskExtractor.discoverAllTasks();

  const taskIds = [];
  for (const [website, tasks] of Object.entries(allTasks)) {
    for (const task of tasks) {
      taskIds.push(`${website}_${task.id}`);
    }
  }

  console.log(`📋 Found ${taskIds.length} total tasks across ${Object.keys(allTasks).length} websites`);
  return taskIds;
}

function createTaskBatches(taskIds, batchCount) {
  const batches = [];
  const batchSize = Math.ceil(taskIds.length / batchCount);

  for (let i = 0; i < batchCount; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, taskIds.length);
    if (start < taskIds.length) {
      batches.push(taskIds.slice(start, end));
    }
  }

  return batches;
}

async function runMultiProcessingBenchmark() {
  console.log('🚀 Starting Multi-Processing LLM Web Automation Benchmark');
  console.log('=' * 80);
  console.log(`🎯 Target Models: ${TARGET_MODELS.join(', ')}`);
  console.log(`⚡ Max Workers: ${MAX_WORKERS}`);
  console.log(`💻 CPU Cores Available: ${cpus().length}`);
  console.log('');

  const startTime = Date.now();

  try {
    // Create worker script
    const workerScriptPath = await createWorkerScript();

    // Get all task IDs
    const allTaskIds = await getAllTaskIds();

    // Calculate optimal batch configuration
    const totalJobs = TARGET_MODELS.length;
    const batchesPerModel = Math.max(1, Math.floor(MAX_WORKERS / TARGET_MODELS.length));

    console.log(`📊 Batch Configuration:`);
    console.log(`   Total Jobs: ${totalJobs}`);
    console.log(`   Batches per Model: ${batchesPerModel}`);
    console.log(`   Tasks per Batch: ~${Math.ceil(allTaskIds.length / batchesPerModel)}`);
    console.log('');

    const allResults = new Map();
    const activeWorkers = new Set();

    // Create work queue
    const workQueue = [];
    for (const model of TARGET_MODELS) {
      const taskBatches = createTaskBatches(allTaskIds, batchesPerModel);

      for (let i = 0; i < taskBatches.length; i++) {
        workQueue.push({
          model,
          taskBatch: taskBatches[i],
          startIndex: i,
          batchId: `${model}_batch_${i}`
        });
      }
    }

    console.log(`🔄 Created ${workQueue.length} work items`);
    console.log(`⏱️  Estimated runtime: ${Math.ceil(workQueue.length * 5 / MAX_WORKERS)} - ${Math.ceil(workQueue.length * 15 / MAX_WORKERS)} minutes`);
    console.log('');

    // Process work queue with worker pool
    let completedJobs = 0;
    let runningWorkers = 0;

    const processNextJob = () => {
      if (workQueue.length === 0 || runningWorkers >= MAX_WORKERS) {
        return;
      }

      const job = workQueue.shift();
      runningWorkers++;

      console.log(`🧵 Starting worker ${runningWorkers}/${MAX_WORKERS} for ${job.batchId} (${job.taskBatch.length} tasks)`);

      const worker = new Worker(workerScriptPath, {
        workerData: job
      });

      activeWorkers.add(worker);

      worker.on('message', (result) => {
        completedJobs++;
        runningWorkers--;
        activeWorkers.delete(worker);

        if (result.success) {
          console.log(`✅ ${job.batchId} completed: ${result.taskCount} tasks`);

          if (!allResults.has(result.model)) {
            allResults.set(result.model, []);
          }
          allResults.get(result.model).push(result.results);

        } else {
          console.error(`❌ ${job.batchId} failed: ${result.error}`);
        }

        console.log(`📊 Progress: ${completedJobs}/${workQueue.length + completedJobs} jobs completed`);

        // Start next job if available
        processNextJob();

        // Check if all jobs are done
        if (completedJobs >= workQueue.length + completedJobs && runningWorkers === 0) {
          console.log('\\n🎉 All jobs completed!');
          generateFinalReport();
        }
      });

      worker.on('error', (error) => {
        console.error(`❌ Worker error for ${job.batchId}:`, error);
        runningWorkers--;
        activeWorkers.delete(worker);
        processNextJob();
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`❌ Worker exited with code ${code} for ${job.batchId}`);
        }
        runningWorkers--;
        activeWorkers.delete(worker);
        processNextJob();
      });
    };

    // Start initial workers
    for (let i = 0; i < Math.min(MAX_WORKERS, workQueue.length); i++) {
      processNextJob();
    }

    async function generateFinalReport() {
      const endTime = Date.now();
      const totalTime = (endTime - startTime) / 1000 / 60; // minutes

      console.log('\\n🎉 MULTI-PROCESSING BENCHMARK COMPLETED!');
      console.log('=' * 80);
      console.log(`⏱️  Total Runtime: ${totalTime.toFixed(2)} minutes`);
      console.log(`🎯 Models Tested: ${allResults.size}`);

      // Aggregate results by model
      const modelSummary = {};
      for (const [model, resultBatches] of allResults.entries()) {
        let totalTasks = 0;
        let successfulTasks = 0;

        for (const batch of resultBatches) {
          totalTasks += batch.summary.totalTasks;
          successfulTasks += batch.summary.successfulTasks;
        }

        modelSummary[model] = {
          total: totalTasks,
          successful: successfulTasks,
          successRate: ((successfulTasks / totalTasks) * 100).toFixed(2) + '%'
        };

        console.log(`\\n📊 ${model}:`);
        console.log(`   Tasks: ${successfulTasks}/${totalTasks} (${modelSummary[model].successRate})`);
      }

      // Save aggregated results
      const finalReport = {
        timestamp: new Date().toISOString(),
        runtime_minutes: totalTime,
        total_workers: MAX_WORKERS,
        models: TARGET_MODELS,
        results: modelSummary,
        detailed_results: Object.fromEntries(allResults)
      };

      const reportPath = path.join(process.cwd(), 'benchmark_results', 'reports',
        `multiprocessing_benchmark_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, JSON.stringify(finalReport, null, 2));

      console.log(`\\n💾 Final report saved: ${reportPath}`);

      // Cleanup
      await fs.unlink(workerScriptPath).catch(() => {});

      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Multi-processing benchmark failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

console.log('🔧 Environment Check:');
console.log(`   API Key: ${process.env.API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   Base URL: ${process.env.BASE_URL || '❌ Missing'}`);
console.log(`   Node.js Workers: ${Worker ? '✅ Available' : '❌ Not supported'}`);
console.log('');

runMultiProcessingBenchmark();