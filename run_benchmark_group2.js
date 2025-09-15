import dotenv from 'dotenv';
import { TaskExtractor } from './src/taskExtractor.js';
import { EnhancedMacroGenerator } from './src/enhancedMacroGenerator.js';
import { BenchmarkExecutor } from './src/benchmarkExecutor.js';
import { ResultStorage } from './src/resultStorage.js';
import fs from 'fs/promises';

dotenv.config();

// Group 2: instagram, facebook, discord
const GROUP2_WEBSITES = ['instagram', 'facebook', 'discord'];

const ALL_MODELS = [
  'openai/gpt-4.1',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini',
  'google/gemini-2.5-pro-thinking-on'
];

const MAX_WORKERS = process.env.SERVER_MODE === 'true' ? 32 : 8; // Reduced for focused execution
const MAX_TRIALS = 2;

class BenchmarkGroup2Runner {
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

    // For duplicate prevention
    this.taskQueue = [];
    this.queueLock = false;
    this.processingTasks = new Set();
  }

  async initialize() {
    console.log('🚀 Initializing Group 2 Benchmark Runner (instagram, facebook, discord)...');
    console.log(`📊 Server mode: ${process.env.SERVER_MODE === 'true'}`);
    console.log(`👥 Max workers: ${MAX_WORKERS}`);
    console.log(`🎯 Max trials per task: ${MAX_TRIALS}`);

    // Discover all tasks but filter for Group 2 websites only
    const allTasks = await this.taskExtractor.discoverAllTasks();
    const group2Tasks = {};

    for (const website of GROUP2_WEBSITES) {
      if (allTasks[website]) {
        group2Tasks[website] = allTasks[website];
      } else {
        console.warn(`⚠️  Website ${website} not found in discovered tasks`);
        group2Tasks[website] = [];
      }
    }

    console.log('\n📋 Group 2 Task Discovery Results:');
    let totalTaskCount = 0;
    Object.entries(group2Tasks).forEach(([website, tasks]) => {
      console.log(`  ${website}: ${tasks.length} tasks`);
      totalTaskCount += tasks.length;
    });

    const expectedCombinations = totalTaskCount * ALL_MODELS.length;
    console.log(`\n✅ Total Group 2 tasks: ${totalTaskCount}`);
    console.log(`🎯 Expected combinations: ${expectedCombinations} (${totalTaskCount} tasks × ${ALL_MODELS.length} models)`);

    return group2Tasks;
  }

  async getCompletedTasks() {
    const completedTasks = new Set();

    try {
      const resultsDir = 'benchmark_results/data';
      const files = await fs.readdir(resultsDir);

      const resultFiles = files.filter(file =>
        file.startsWith('result_') && file.endsWith('.json')
      );

      console.log(`🔍 Scanning ${resultFiles.length} result files for Group 2 completed tasks...`);

      for (const filename of resultFiles) {
        try {
          const filePath = `${resultsDir}/${filename}`;
          const content = await fs.readFile(filePath, 'utf-8');
          const result = JSON.parse(content);

          // Only consider Group 2 websites and successful completions
          if (GROUP2_WEBSITES.includes(result.website) && result.success) {
            const taskId = `${result.model}__${result.website}__${result.task.id}`;
            completedTasks.add(taskId);
          }
        } catch (error) {
          continue;
        }
      }

      console.log(`✅ Found ${completedTasks.size} successfully completed Group 2 tasks`);
    } catch (error) {
      console.log(`⚠️  No previous results found, starting fresh: ${error.message}`);
    }

    return completedTasks;
  }

  async runBenchmark() {
    try {
      await fs.mkdir('benchmark_results', { recursive: true });

      const group2Tasks = await this.initialize();

      // Get completed tasks for resume functionality
      const completedTasks = await this.getCompletedTasks();
      console.log(`\n🔄 Found ${completedTasks.size} already completed Group 2 combinations`);

      // Build task queue for Group 2 only
      let skippedCount = 0;
      let addedCount = 0;

      for (const [website, tasks] of Object.entries(group2Tasks)) {
        for (const task of tasks) {
          for (const model of ALL_MODELS) {
            const taskId = `${model}__${website}__${task.id}`;

            if (completedTasks.has(taskId)) {
              skippedCount++;
              continue;
            }

            this.taskQueue.push({
              id: taskId,
              model,
              website,
              task,
              attempts: 0,
              maxAttempts: MAX_TRIALS
            });
            addedCount++;
          }
        }
      }

      console.log(`📋 Group 2 Queue: Skipped ${skippedCount} completed, Added ${addedCount} remaining`);

      this.totalTasks = this.taskQueue.length;

      if (this.totalTasks === 0) {
        console.log(`🎉 All Group 2 tasks already completed!`);
        await this.generateFinalReport(group2Tasks);
        return;
      }

      console.log(`\n🎯 Starting Group 2 benchmark with ${this.totalTasks} combinations`);

      // Process tasks with multiprocessing
      const workers = [];
      for (let i = 0; i < Math.min(MAX_WORKERS, this.taskQueue.length); i++) {
        workers.push(this.worker(i + 1));
      }

      await Promise.all(workers);

      await this.generateFinalReport(group2Tasks);

    } catch (error) {
      console.error('💥 Group 2 Benchmark failed:', error);
      throw error;
    }
  }

  async getNextTask() {
    while (this.queueLock) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.queueLock = true;

    try {
      let taskIndex = -1;
      for (let i = 0; i < this.taskQueue.length; i++) {
        const task = this.taskQueue[i];
        if (!this.processingTasks.has(task.id)) {
          taskIndex = i;
          break;
        }
      }

      if (taskIndex === -1) {
        return null;
      }

      const taskItem = this.taskQueue.splice(taskIndex, 1)[0];
      this.processingTasks.add(taskItem.id);
      return taskItem;

    } finally {
      this.queueLock = false;
    }
  }

  async markTaskCompleted(taskId) {
    this.processingTasks.delete(taskId);
  }

  async worker(workerId) {
    console.log(`👷 Group 2 Worker ${workerId} started`);

    while (true) {
      const taskItem = await this.getNextTask();
      if (!taskItem) {
        break;
      }

      this.activeWorkers++;

      try {
        // Double-check if task is already completed
        const resultPath = `benchmark_results/data/result_${taskItem.model.replace(/[^a-zA-Z0-9]/g, '_')}_${taskItem.website}_${taskItem.task.id}_*.json`;
        const { glob } = await import('glob');
        const existingFiles = await glob(resultPath);

        if (existingFiles.length > 0) {
          console.log(`[Worker ${workerId}] ⏭️  Task ${taskItem.id} already exists, skipping`);
          await this.markTaskCompleted(taskItem.id);
          this.activeWorkers--;
          continue;
        }

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
      } finally {
        await this.markTaskCompleted(taskItem.id);
        this.activeWorkers--;
      }
    }

    console.log(`👷 Group 2 Worker ${workerId} finished`);
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
        const macroCode = await this.macroGenerator.generateMacroCode(task, htmlPath, previousAttempts, model);
        if (!macroCode) {
          throw new Error('Failed to generate macro code');
        }

        const executor = new BenchmarkExecutor();
        const executionResult = await executor.executeMacro(macroCode, htmlPath, task, attempt);

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
          return result;
        }

        previousAttempts.push({
          attemptNumber: attempt,
          macroCode,
          error: executionResult?.result?.error || executionResult?.error || 'Execution failed',
          success: false
        });

        if (attempt === taskItem.maxAttempts) {
          return result;
        }

      } catch (error) {
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

  async generateFinalReport(group2Tasks) {
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
    GROUP2_WEBSITES.forEach(website => {
      const websiteResults = this.results.filter(r => r.website === website);
      websiteStats[website] = {
        total: websiteResults.length,
        success: websiteResults.filter(r => r.success).length,
        failed: websiteResults.filter(r => !r.success).length,
        totalTasks: group2Tasks[website]?.length || 0,
        expectedCombinations: (group2Tasks[website]?.length || 0) * ALL_MODELS.length
      };
    });

    const report = {
      group: 'Group 2 (instagram, facebook, discord)',
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
        serverMode: process.env.SERVER_MODE === 'true',
        targetWebsites: GROUP2_WEBSITES
      }
    };

    const reportPath = `benchmark_results/data/group2_benchmark_${Date.now()}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log('\n🎉 GROUP 2 BENCHMARK FINISHED!');
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
      const completion = stats.expectedCombinations > 0 ? (stats.success / stats.expectedCombinations * 100).toFixed(1) : '0.0';
      console.log(`  ${website}: ${stats.success}/${stats.total} (${rate}%) - ${completion}% of total expected`);
    });
  }
}

async function main() {
  const runner = new BenchmarkGroup2Runner();
  await runner.runBenchmark();
}

// Check if this file is being run directly
const isMain = import.meta.url.endsWith('run_benchmark_group2.js') ||
               process.argv[1].endsWith('run_benchmark_group2.js');

if (isMain) {
  main().catch(console.error);
}