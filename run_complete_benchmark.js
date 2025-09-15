import dotenv from 'dotenv';
import { TaskExtractor } from './src/taskExtractor.js';
import { EnhancedMacroGenerator } from './src/enhancedMacroGenerator.js';
import { BenchmarkExecutor } from './src/benchmarkExecutor.js';
import { ResultStorage } from './src/resultStorage.js';
import fs from 'fs/promises';

dotenv.config();

// Complete benchmark with all fixed components
const ALL_MODELS = [
  'openai/gpt-4.1',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini',
  'google/gemini-2.5-pro-thinking-on'
];

const MAX_WORKERS = process.env.SERVER_MODE === 'true' ? 96 : 8;
const MAX_TRIALS = 2;

class CompleteBenchmarkRunner {
  constructor() {
    this.taskExtractor = new TaskExtractor();
    this.storage = new ResultStorage();
    this.macroGenerator = new EnhancedMacroGenerator(
      process.env.API_KEY,
      process.env.BASE_URL
    );
    this.activeWorkers = 0;
    this.completedTasks = 0;
    this.totalTasks = 0;
    this.results = [];
    this.startTime = Date.now();
  }

  async initialize() {
    console.log('🚀 Initializing Complete Benchmark Runner...');
    console.log(`📊 Server mode: ${process.env.SERVER_MODE === 'true'}`);
    console.log(`👥 Max workers: ${MAX_WORKERS}`);
    console.log(`🎯 Max trials per task: ${MAX_TRIALS}`);

    // Discover all tasks
    const allTasks = await this.taskExtractor.discoverAllTasks();

    console.log('\n📋 Task Discovery Results:');
    let totalTaskCount = 0;
    Object.entries(allTasks).forEach(([website, tasks]) => {
      console.log(`  ${website}: ${tasks.length} tasks`);
      totalTaskCount += tasks.length;
    });

    console.log(`\n✅ Total tasks discovered: ${totalTaskCount}`);
    console.log(`🎯 Expected combinations: ${totalTaskCount * ALL_MODELS.length} (${totalTaskCount} tasks × ${ALL_MODELS.length} models)`);

    return allTasks;
  }

  async runBenchmark() {
    try {
      const allTasks = await this.initialize();

      // Build task queue
      const taskQueue = [];
      for (const [website, tasks] of Object.entries(allTasks)) {
        for (const task of tasks) {
          for (const model of ALL_MODELS) {
            taskQueue.push({
              id: `${model}__${website}__${task.id}`,
              model,
              website,
              task,
              attempts: 0,
              maxAttempts: MAX_TRIALS
            });
          }
        }
      }

      this.totalTasks = taskQueue.length;
      console.log(`\n🎯 Starting benchmark with ${this.totalTasks} total combinations`);

      // Process tasks with multiprocessing
      const workers = [];
      for (let i = 0; i < Math.min(MAX_WORKERS, taskQueue.length); i++) {
        workers.push(this.worker(taskQueue, i + 1));
      }

      await Promise.all(workers);

      await this.generateFinalReport();

    } catch (error) {
      console.error('💥 Benchmark failed:', error);
      throw error;
    }
  }

  async worker(taskQueue, workerId) {
    console.log(`👷 Worker ${workerId} started`);

    while (taskQueue.length > 0) {
      const taskItem = taskQueue.shift();
      if (!taskItem) break;

      this.activeWorkers++;

      try {
        const result = await this.executeTask(taskItem, workerId);
        this.results.push(result);

        this.completedTasks++;
        const progress = ((this.completedTasks / this.totalTasks) * 100).toFixed(1);
        const status = result.success ? '✅' : '❌';
        console.log(`[Worker ${workerId}] ${status} ${taskItem.id} (${progress}%)`);

      } catch (error) {
        console.error(`[Worker ${workerId}] ❌ Error processing ${taskItem.id}:`, error.message);

        this.results.push({
          id: taskItem.id,
          model: taskItem.model,
          website: taskItem.website,
          task: taskItem.task,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        this.completedTasks++;
      }

      this.activeWorkers--;
    }

    console.log(`👷 Worker ${workerId} finished`);
  }

  async executeTask(taskItem, workerId) {
    const { model, website, task } = taskItem;
    const previousAttempts = [];

    // Get correct HTML path
    const websiteInfo = await this.taskExtractor.getWebsiteInfo(website);
    const htmlFile = websiteInfo.hasIndex ? 'index.html' : websiteInfo.htmlFiles[0];
    const htmlPath = `${website}/${htmlFile}`;

    for (let attempt = 1; attempt <= taskItem.maxAttempts; attempt++) {
      try {
        // Generate macro code with previous attempts context
        const macroCode = await this.macroGenerator.generateMacroCode(task, htmlPath, previousAttempts, model);
        if (!macroCode) {
          throw new Error('Failed to generate macro code');
        }

        // Execute macro
        const executor = new BenchmarkExecutor();
        const executionResult = await executor.executeMacro(macroCode, htmlPath, task, attempt);

        // Save result
        const result = {
          id: `${website}_${task.id}_${Date.now()}`,
          model,
          website,
          task,
          attempt,
          macroCode,
          executionResult,
          success: executionResult?.result?.success || false,
          timestamp: new Date().toISOString()
        };

        await this.storage.saveResult(result);

        if (result.success) {
          return result; // Success, no more attempts needed
        }

        // Add failed attempt to context for next retry
        previousAttempts.push({
          attemptNumber: attempt,
          macroCode,
          error: executionResult?.result?.error || executionResult?.error || 'Execution failed',
          success: false
        });

        if (attempt === taskItem.maxAttempts) {
          return result; // Last attempt, return even if failed
        }

      } catch (error) {
        // Add exception to previous attempts
        previousAttempts.push({
          attemptNumber: attempt,
          macroCode: null,
          error: error.message,
          success: false
        });

        if (attempt === taskItem.maxAttempts) {
          return {
            id: taskItem.id,
            model,
            website,
            task,
            attempt,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          };
        }
      }
    }
  }

  async generateFinalReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);

    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.length - successful;
    const successRate = this.results.length > 0 ? (successful / this.results.length * 100).toFixed(2) : '0.00';

    // Model performance
    const modelStats = {};
    ALL_MODELS.forEach(model => {
      const modelResults = this.results.filter(r => r.model === model);
      modelStats[model] = {
        total: modelResults.length,
        success: modelResults.filter(r => r.success).length,
        failed: modelResults.filter(r => !r.success).length
      };
    });

    // Website performance
    const websiteStats = {};
    this.results.forEach(result => {
      if (!websiteStats[result.website]) {
        websiteStats[result.website] = { total: 0, success: 0, failed: 0 };
      }
      websiteStats[result.website].total++;
      if (result.success) {
        websiteStats[result.website].success++;
      } else {
        websiteStats[result.website].failed++;
      }
    });

    const report = {
      summary: {
        totalTasks: this.results.length,
        successfulTasks: successful,
        failedTasks: failed,
        successRate: `${successRate}%`,
        executionTime: `${duration} seconds`,
        timestamp: new Date().toISOString()
      },
      modelStats,
      websiteStats,
      executionDetails: {
        maxWorkers: MAX_WORKERS,
        maxTrials: MAX_TRIALS,
        serverMode: process.env.SERVER_MODE === 'true'
      }
    };

    const reportPath = `benchmark_results/data/complete_benchmark_${Date.now()}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log('\n🎉 COMPLETE BENCHMARK FINISHED!');
    console.log(`⏱️  Total execution time: ${duration} seconds`);
    console.log(`📝 Tasks processed: ${this.results.length}`);
    console.log(`✅ Successful: ${successful} (${successRate}%)`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📄 Report saved: ${reportPath}`);

    console.log('\n🤖 Model Performance:');
    Object.entries(modelStats).forEach(([model, stats]) => {
      const rate = stats.total > 0 ? (stats.success / stats.total * 100).toFixed(1) : '0.0';
      console.log(`  ${model}: ${stats.success}/${stats.total} (${rate}%)`);
    });

    console.log('\n🌐 Website Performance:');
    Object.entries(websiteStats).forEach(([website, stats]) => {
      const rate = stats.total > 0 ? (stats.success / stats.total * 100).toFixed(1) : '0.0';
      console.log(`  ${website}: ${stats.success}/${stats.total} (${rate}%)`);
    });
  }
}

async function main() {
  const runner = new CompleteBenchmarkRunner();
  await runner.runBenchmark();
}

// Check if this file is being run directly (multiple methods for compatibility)
const isMain = import.meta.url.endsWith('run_complete_benchmark.js') ||
               process.argv[1].endsWith('run_complete_benchmark.js');

if (isMain) {
  main().catch(console.error);
}