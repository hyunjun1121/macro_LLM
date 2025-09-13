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
      parallel = false
    } = options;

    console.log('🚀 Starting LLM Macro Benchmark');
    console.log('=' * 60);

    // 1. Extract all tasks
    console.log('📋 Extracting tasks from xlsx files...');
    const allTasks = await this.taskExtractor.discoverAllTasks();

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