import dotenv from 'dotenv';
import { TaskExtractor } from './taskExtractor.js';
import { EnhancedMacroGenerator } from './enhancedMacroGenerator.js';
import { BenchmarkExecutor } from './benchmarkExecutor.js';
import { ResultStorage } from './resultStorage.js';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

export class BenchmarkRunner {
  constructor(options = {}) {
    this.taskExtractor = new TaskExtractor();
    this.macroGenerator = new EnhancedMacroGenerator(
      process.env.API_KEY,
      process.env.BASE_URL
    );
    this.executor = new BenchmarkExecutor();
    this.storage = new ResultStorage();

    this.selectedModels = options.models || ['openai/gpt-4o-mini']; // Default model

    this.config = {
      maxRetries: 5,
      timeoutMs: 30000,
      screenshotOnError: true,
      saveAllLogs: true
    };
  }

  async runBenchmark(options = {}) {
    const {
      websites = [],
      taskLimit = null,
      skipFailedTasks = true,
      parallel = false,
      concurrency = 1,
      resume = false,
      model = null
    } = options;

    console.log('🚀 Starting LLM Macro Benchmark');
    console.log('=' * 60);

    // 1. Extract all tasks
    console.log('📋 Extracting tasks from xlsx files...');
    const allTasks = await this.taskExtractor.discoverAllTasks();

    // 2. If resuming, filter out already completed tasks
    if (resume && model) {
      console.log('🔄 Resume mode: Analyzing completed tasks...');
      await this.filterCompletedTasks(allTasks, model);
    }

    let totalTaskCount = 0;
    for (const [website, tasks] of Object.entries(allTasks)) {
      if (websites.length === 0 || websites.includes(website)) {
        totalTaskCount += tasks.length;
      }
    }

    console.log(`📊 Found ${totalTaskCount} total tasks across ${Object.keys(allTasks).length} websites`);

    // 2. Run tasks
    const results = [];
    for (const [website, tasks] of Object.entries(allTasks)) {
      if (websites.length > 0 && !websites.includes(website)) {
        continue;
      }

      console.log(`\\n🌐 Processing ${website} (${tasks.length} tasks)`);

      const websiteInfo = await this.taskExtractor.getWebsiteInfo(website);
      const tasksToRun = taskLimit ? tasks.slice(0, taskLimit) : tasks;

      // Sequential processing only (removed parallel for stability)
      for (const [taskIndex, task] of tasksToRun.entries()) {
        console.log(`\\n  📝 Task ${taskIndex + 1}/${tasksToRun.length}: ${task.description}`);

        const result = await this.runSingleTask(website, websiteInfo, task);
        results.push(result);

        // Save intermediate results
        await this.storage.saveResult(result);

        if (!result.success && !skipFailedTasks) {
          console.log('❌ Task failed and skipFailedTasks is false, stopping...');
          break;
        }
      }
    }

    // 3. Generate final report
    console.log('\\n📈 Generating final benchmark report...');
    const report = await this.generateBenchmarkReport(results);
    await this.storage.saveBenchmarkReport(report);

    console.log('\\n✅ Benchmark completed!');
    console.log(`📊 Results saved to: ${this.storage.getReportPath()}`);

    return report;
  }

  async runTasksInParallel(website, websiteInfo, tasks, concurrency, skipFailedTasks) {
    console.log(`\\n⚡ Running ${tasks.length} tasks with concurrency: ${concurrency}`);

    const results = [];
    const semaphore = new Array(concurrency).fill(null);
    let taskIndex = 0;
    let completed = 0;
    let failed = 0;

    const runTask = async (task, index) => {
      console.log(`\\n  📝 Task ${index + 1}/${tasks.length}: ${task.description}`);

      try {
        const result = await this.runSingleTask(website, websiteInfo, task);

        // Save intermediate results
        await this.storage.saveResult(result);

        if (result.success) {
          console.log(`    ✅ Task ${index + 1} completed successfully`);
        } else {
          console.log(`    ❌ Task ${index + 1} failed`);
          failed++;
        }

        completed++;
        console.log(`    📊 Progress: ${completed}/${tasks.length} (${failed} failed)`);

        return result;
      } catch (error) {
        console.error(`    ❌ Task ${index + 1} error:`, error.message);
        failed++;
        completed++;

        return {
          id: `${website}_${task.id}_${Date.now()}`,
          website,
          task,
          websiteInfo,
          attempts: [],
          success: false,
          finalResult: { error: error.message },
          totalExecutionTime: 0,
          timestamp: new Date().toISOString()
        };
      }
    };

    // Process tasks in batches with concurrency limit
    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, Math.min(i + concurrency, tasks.length));
      const batchPromises = batch.map((task, batchIndex) =>
        runTask(task, i + batchIndex)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Check if we should stop on failures
      if (!skipFailedTasks && batchResults.some(r => !r.success)) {
        console.log('❌ Task failed and skipFailedTasks is false, stopping parallel execution...');
        break;
      }
    }

    return results;
  }

  async runSingleTask(website, websiteInfo, task) {
    const startTime = Date.now();
    const result = {
      id: `${website}_${task.id}_${startTime}`,
      website,
      task,
      websiteInfo,
      attempts: [],
      success: false,
      finalResult: null,
      totalExecutionTime: 0,
      timestamp: new Date().toISOString()
    };

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      console.log(`    🔄 Attempt ${attempt}/${this.config.maxRetries}`);

      const attemptResult = await this.runSingleAttempt(
        website,
        websiteInfo,
        task,
        attempt,
        result.attempts
      );

      result.attempts.push(attemptResult);

      if (attemptResult.success) {
        result.success = true;
        result.finalResult = attemptResult.executionResult;
        break;
      }

      // If not the last attempt, prepare retry with error context
      if (attempt < this.config.maxRetries) {
        console.log(`    ⚠️  Attempt ${attempt} failed, preparing retry with error context...`);
      }
    }

    result.totalExecutionTime = Date.now() - startTime;

    console.log(`    ${result.success ? '✅ SUCCESS' : '❌ FAILED'} after ${result.attempts.length} attempts`);

    return result;
  }

  async runSingleAttempt(website, websiteInfo, task, attemptNumber, previousAttempts, model = null) {
    const startTime = Date.now();
    const htmlPath = path.join(process.cwd(), website, websiteInfo.hasIndex ? 'index.html' : websiteInfo.htmlFiles[0]);

    // Select model for this attempt (rotate through available models if multiple)
    const selectedModel = model || this.selectedModels[attemptNumber % this.selectedModels.length];

    const attemptResult = {
      attemptNumber,
      model: selectedModel,
      macroCode: null,
      executionResult: null,
      success: false,
      error: null,
      executionTime: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Generate macro code
      console.log(`      🤖 Generating macro code with ${selectedModel}...`);
      attemptResult.macroCode = await this.macroGenerator.generateMacroCode(
        task,
        htmlPath,
        previousAttempts,
        selectedModel
      );

      // 2. Execute macro
      console.log(`      🎯 Executing macro...`);
      attemptResult.executionResult = await this.executor.executeMacro(
        attemptResult.macroCode,
        htmlPath,
        task,
        attemptNumber
      );

      attemptResult.success = attemptResult.executionResult.success;

      if (attemptResult.success) {
        console.log(`      ✅ Macro executed successfully`);
      } else {
        console.log(`      ❌ Macro execution failed: ${attemptResult.executionResult.error}`);
        attemptResult.error = attemptResult.executionResult.error;
      }

    } catch (error) {
      attemptResult.error = error.message;
      attemptResult.success = false;
      console.log(`      💥 Attempt failed with exception: ${error.message}`);
    }

    attemptResult.executionTime = Date.now() - startTime;
    return attemptResult;
  }

  async filterCompletedTasks(allTasks, model) {
    const completedResults = new Set();

    try {
      // Get only filenames without loading file contents (memory efficient)
      const resultFiles = await this.storage.getResultFilenames();

      console.log(`🔍 Scanning ${resultFiles.length} result files for ${model}...`);

      // Parse filenames to identify completed tasks
      for (const filename of resultFiles) {
        // Example filename: result_youtube_YT_MAL_001_1757845110779.json
        // Pattern: result_{website}_{taskId}_{timestamp}.json
        if (filename.startsWith('result_') && filename.endsWith('.json')) {
          // Extract website and task info from filename
          const parts = filename.replace('result_', '').replace('.json', '').split('_');
          if (parts.length >= 3) {
            const website = parts[0];
            // Reconstruct task ID from remaining parts (excluding timestamp at end)
            const taskIdParts = parts.slice(1, -1); // Remove website and timestamp
            const taskId = taskIdParts.join('_');

            // Add to completed set (assume successful for filename-based approach)
            const completedTaskId = `${website}_${taskId}`;
            completedResults.add(completedTaskId);
          }
        }
      }

      console.log(`✅ Found ${completedResults.size} completed tasks for model ${model} (filename-based)`);

      // Filter out completed tasks
      let totalRemoved = 0;
      for (const [website, tasks] of Object.entries(allTasks)) {
        const originalCount = tasks.length;
        allTasks[website] = tasks.filter(task => {
          const taskId = `${website}_${task.id}`;
          return !completedResults.has(taskId);
        });
        const removedCount = originalCount - allTasks[website].length;
        totalRemoved += removedCount;

        if (removedCount > 0) {
          console.log(`   🔄 ${website}: ${removedCount} tasks already completed, ${allTasks[website].length} remaining`);
        }
      }

      console.log(`📊 Resume Summary: ${totalRemoved} tasks skipped, continuing with remaining tasks`);

    } catch (error) {
      console.warn('⚠️  Could not scan previous results for resume, starting fresh:', error.message);
    }
  }

  async generateBenchmarkReport(results) {
    const totalTasks = results.length;
    const successfulTasks = results.filter(r => r.success).length;
    const failedTasks = totalTasks - successfulTasks;

    const websiteStats = {};
    const difficultyStats = {};
    const attemptStats = {};

    for (const result of results) {
      // Website stats
      if (!websiteStats[result.website]) {
        websiteStats[result.website] = { total: 0, success: 0, failed: 0 };
      }
      websiteStats[result.website].total++;
      if (result.success) {
        websiteStats[result.website].success++;
      } else {
        websiteStats[result.website].failed++;
      }

      // Difficulty stats
      const difficulty = result.task.difficulty || 'unknown';
      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = { total: 0, success: 0, failed: 0 };
      }
      difficultyStats[difficulty].total++;
      if (result.success) {
        difficultyStats[difficulty].success++;
      } else {
        difficultyStats[difficulty].failed++;
      }

      // Attempt stats
      const attempts = result.attempts.length;
      if (!attemptStats[attempts]) {
        attemptStats[attempts] = 0;
      }
      attemptStats[attempts]++;
    }

    return {
      summary: {
        totalTasks,
        successfulTasks,
        failedTasks,
        successRate: ((successfulTasks / totalTasks) * 100).toFixed(2) + '%'
      },
      websiteStats,
      difficultyStats,
      attemptStats,
      results,
      generatedAt: new Date().toISOString(),
      config: this.config
    };
  }
}

// CLI runner
if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\\\/g, '/')}`) {
  const runner = new BenchmarkRunner();

  const websites = process.argv[2] ? process.argv[2].split(',') : [];
  const taskLimit = process.argv[3] ? parseInt(process.argv[3]) : null;

  runner.runBenchmark({
    websites,
    taskLimit,
    skipFailedTasks: true
  }).catch(error => {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  });
}