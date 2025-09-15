import fs from 'fs/promises';
import path from 'path';
import { TaskExtractor } from './src/taskExtractor.js';

const ALL_MODELS = [
  'openai/gpt-4.1',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini',
  'google/gemini-2.5-pro-thinking-on'
];

class ExperimentCompletionAnalyzer {
  constructor() {
    this.taskExtractor = new TaskExtractor();
    this.completedTasks = new Set();
    this.allCombinations = new Set();
    this.results = [];
  }

  async loadCompletedTasks() {
    console.log('🔍 Scanning result files for completed experiments...');

    try {
      const resultsDir = 'benchmark_results/data';
      const files = await fs.readdir(resultsDir);
      const resultFiles = files.filter(file =>
        file.startsWith('result_') && file.endsWith('.json')
      );

      console.log(`📄 Found ${resultFiles.length} result files to analyze`);

      let processed = 0;
      for (const filename of resultFiles) {
        try {
          const filePath = `${resultsDir}/${filename}`;
          const content = await fs.readFile(filePath, 'utf-8');
          const result = JSON.parse(content);

          // Only count successfully completed tasks
          if (result.success) {
            const taskId = `${result.model}__${result.website}__${result.task.id}`;
            this.completedTasks.add(taskId);
          }

          // Store all results for analysis
          this.results.push({
            model: result.model,
            website: result.website,
            taskId: result.task?.id,
            success: result.success,
            timestamp: result.timestamp
          });

          processed++;
          if (processed % 100 === 0) {
            console.log(`   Processed ${processed}/${resultFiles.length} files...`);
          }
        } catch (error) {
          // Skip corrupted files
          continue;
        }
      }

      console.log(`✅ Analysis complete: ${this.completedTasks.size} successful tasks found`);
    } catch (error) {
      console.error('❌ Error loading completed tasks:', error.message);
    }
  }

  async buildExpectedCombinations() {
    console.log('📋 Building expected task combinations...');

    const allTasks = await this.taskExtractor.discoverAllTasks();

    for (const [website, tasks] of Object.entries(allTasks)) {
      for (const task of tasks) {
        for (const model of ALL_MODELS) {
          const taskId = `${model}__${website}__${task.id}`;
          this.allCombinations.add(taskId);
        }
      }
    }

    console.log(`🎯 Expected combinations: ${this.allCombinations.size}`);
    return allTasks;
  }

  generateCompletionReport(allTasks) {
    const missing = [];
    const completed = [];

    for (const combination of this.allCombinations) {
      if (this.completedTasks.has(combination)) {
        completed.push(combination);
      } else {
        missing.push(combination);
      }
    }

    // Model performance
    const modelStats = {};
    ALL_MODELS.forEach(model => {
      const modelCompleted = completed.filter(combo => combo.startsWith(model)).length;
      const modelTotal = this.allCombinations.size / ALL_MODELS.length;
      modelStats[model] = {
        completed: modelCompleted,
        total: modelTotal,
        percentage: ((modelCompleted / modelTotal) * 100).toFixed(1)
      };
    });

    // Website performance
    const websiteStats = {};
    Object.keys(allTasks).forEach(website => {
      const websiteCompleted = completed.filter(combo => combo.includes(`__${website}__`)).length;
      const websiteTotal = allTasks[website].length * ALL_MODELS.length;
      websiteStats[website] = {
        completed: websiteCompleted,
        total: websiteTotal,
        percentage: websiteTotal > 0 ? ((websiteCompleted / websiteTotal) * 100).toFixed(1) : '0.0'
      };
    });

    return {
      summary: {
        totalExpected: this.allCombinations.size,
        totalCompleted: completed.length,
        totalMissing: missing.length,
        completionRate: ((completed.length / this.allCombinations.size) * 100).toFixed(2)
      },
      modelStats,
      websiteStats,
      missing: missing.slice(0, 20), // Show first 20 missing
      allMissing: missing
    };
  }

  async analyze() {
    console.log('🚀 Starting experiment completion analysis...\n');

    // Load all expected tasks
    const allTasks = await this.buildExpectedCombinations();

    // Load completed tasks
    await this.loadCompletedTasks();

    // Generate report
    const report = this.generateCompletionReport(allTasks);

    // Display results
    console.log('\n📊 EXPERIMENT COMPLETION REPORT');
    console.log('================================');

    console.log(`\n🎯 Overall Progress:`);
    console.log(`   Expected combinations: ${report.summary.totalExpected}`);
    console.log(`   Completed: ${report.summary.totalCompleted}`);
    console.log(`   Missing: ${report.summary.totalMissing}`);
    console.log(`   Completion rate: ${report.summary.completionRate}%`);

    console.log(`\n🤖 Model Performance:`);
    Object.entries(report.modelStats).forEach(([model, stats]) => {
      console.log(`   ${model}: ${stats.completed}/${stats.total} (${stats.percentage}%)`);
    });

    console.log(`\n🌐 Website Performance:`);
    Object.entries(report.websiteStats).forEach(([website, stats]) => {
      console.log(`   ${website}: ${stats.completed}/${stats.total} (${stats.percentage}%)`);
    });

    if (report.summary.totalMissing > 0) {
      console.log(`\n❌ Missing combinations (showing first 20):`);
      report.missing.forEach(combo => {
        const [model, website, taskId] = combo.split('__');
        console.log(`   ${model} → ${website} → ${taskId}`);
      });

      if (report.allMissing.length > 20) {
        console.log(`   ... and ${report.allMissing.length - 20} more`);
      }
    } else {
      console.log(`\n✅ All experiments completed!`);
    }

    // Save detailed report
    const reportPath = `benchmark_results/completion_analysis_${Date.now()}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);

    return report;
  }
}

// Run analysis
const analyzer = new ExperimentCompletionAnalyzer();
analyzer.analyze().catch(console.error);