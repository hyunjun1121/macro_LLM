import fs from 'fs/promises';
import path from 'path';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 누락된 조합들 정의
const MISSING_COMBINATIONS = [
    // DeepSeek 모델 누락
    { model: 'deepseek-ai/DeepSeek-V3.1-thinking-on', website: 'Airbnb', tasks: ['TASK_001', 'TASK_002'] },
    { model: 'deepseek-ai/DeepSeek-V3.1-thinking-on', website: 'Threads', tasks: ['G001', 'G002', 'G003', 'G004', 'G005', 'G006', 'G007', 'G008', 'G009', 'G010', 'G011', 'G012', 'G013', 'G014', 'G015', 'G016', 'G017', 'G018', 'G019', 'G020'] },
    { model: 'deepseek-ai/DeepSeek-V3.1-thinking-on', website: 'youtube', tasks: ['YT_BEN_001', 'YT_BEN_002', 'YT_BEN_003', 'YT_BEN_004', 'YT_BEN_005', 'YT_BEN_006', 'YT_BEN_007', 'YT_BEN_008', 'YT_BEN_009', 'YT_BEN_010', 'YT_BEN_011', 'YT_BEN_012', 'YT_BEN_013', 'YT_BEN_014', 'YT_BEN_015'] },

    // Gemini 모델 누락
    { model: 'google/gemini-2.5-pro-thinking-on', website: 'Airbnb', tasks: ['TASK_001', 'TASK_002'] },
    { model: 'google/gemini-2.5-pro-thinking-on', website: 'Threads', tasks: ['G001', 'G002', 'G003', 'G004', 'G005', 'G006', 'G007', 'G008', 'G009', 'G010', 'G011', 'G012', 'G013', 'G014', 'G015', 'G016', 'G017', 'G018', 'G019', 'G020'] },

    // GPT-4.1 모델 누락
    { model: 'openai/gpt-4.1', website: 'Airbnb', tasks: ['TASK_002'] },
    { model: 'openai/gpt-4.1', website: 'Threads', tasks: ['G001', 'G002', 'G003', 'G004', 'G005', 'G006', 'G007', 'G008', 'G009', 'G010', 'G011', 'G012', 'G013', 'G014', 'G015', 'G016', 'G017', 'G018', 'G019', 'G020'] },

    // GPT-4o-Mini 모델 누락
    { model: 'openai/gpt-4o-mini', website: 'Threads', tasks: ['G001', 'G002', 'G003', 'G004', 'G005', 'G006', 'G007', 'G008', 'G009', 'G010', 'G011', 'G012', 'G013', 'G014', 'G015', 'G016', 'G017', 'G018', 'G019', 'G020'] }
];

// 설정
const MAX_WORKERS = 32; // 동시 실행할 워커 수
const MAX_TRIALS = 3;
const TIMEOUT_MS = 300000; // 5분 타임아웃

class MissingCombinationRunner {
    constructor() {
        this.taskQueue = [];
        this.activeWorkers = new Set();
        this.results = [];
        this.totalTasks = 0;
        this.completedTasks = 0;

        this.buildTaskQueue();
    }

    buildTaskQueue() {
        console.log('📋 Building task queue for missing combinations...');

        for (const combination of MISSING_COMBINATIONS) {
            for (const taskId of combination.tasks) {
                this.taskQueue.push({
                    model: combination.model,
                    website: combination.website,
                    taskId: taskId,
                    id: `${combination.website}_${taskId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
                });
            }
        }

        this.totalTasks = this.taskQueue.length;
        console.log(`📊 Total missing combinations to run: ${this.totalTasks}`);

        // 무작위 섞기 (부하 분산)
        this.shuffleArray(this.taskQueue);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    async runAllMissingCombinations() {
        console.log(`🚀 Starting benchmark execution for ${this.totalTasks} missing combinations with ${MAX_WORKERS} workers`);
        console.log('⏰ Start time:', new Date().toISOString());

        const startTime = Date.now();

        // 워커들 생성 및 실행
        const workerPromises = [];
        for (let i = 0; i < MAX_WORKERS; i++) {
            workerPromises.push(this.runWorker(i));
        }

        // 모든 워커가 완료될 때까지 대기
        await Promise.all(workerPromises);

        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);

        await this.generateReport(duration);
    }

    async runWorker(workerId) {
        console.log(`👷 Worker ${workerId} started`);

        while (this.taskQueue.length > 0) {
            const task = this.taskQueue.shift();
            if (!task) break;

            try {
                console.log(`[Worker ${workerId}] Running ${task.website}/${task.taskId} with ${task.model} (${this.completedTasks + 1}/${this.totalTasks})`);

                const result = await this.runSingleTask(task);
                this.results.push(result);
                this.completedTasks++;

                // 진행률 표시
                const progress = Math.round((this.completedTasks / this.totalTasks) * 100);
                console.log(`[Worker ${workerId}] ✅ Completed ${task.id} (${progress}% done)`);

            } catch (error) {
                console.error(`[Worker ${workerId}] ❌ Error running ${task.id}:`, error.message);

                this.results.push({
                    ...task,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                this.completedTasks++;
            }
        }

        console.log(`👷 Worker ${workerId} finished`);
    }

    async runSingleTask(task) {
        const { BenchmarkRunner } = await import('./src/benchmarkRunner.js');
        const { TaskExtractor } = await import('./src/taskExtractor.js');

        try {
            const runner = new BenchmarkRunner();
            const taskExtractor = new TaskExtractor();

            // Get website info and task details
            const websiteInfo = await taskExtractor.getWebsiteInfo(task.website);
            const allTasks = await taskExtractor.discoverAllTasks();
            const tasks = allTasks[task.website] || [];
            const taskDetails = tasks.find(t => t.id === task.taskId);

            if (!taskDetails) {
                throw new Error(`Task ${task.taskId} not found for website ${task.website}`);
            }

            // Set the model for this run
            runner.selectedModels = [task.model];
            runner.config.maxRetries = MAX_TRIALS;

            const result = await Promise.race([
                runner.runSingleTask(task.website, websiteInfo, taskDetails),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Task timeout')), TIMEOUT_MS)
                )
            ]);

            return {
                ...task,
                success: result.success || false,
                attempts: result.attempts || [],
                finalResult: result.finalResult || null,
                executionTime: result.executionTime || 0,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                ...task,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async generateReport(duration) {
        console.log('\n📊 Generating final report...');

        const successful = this.results.filter(r => r.success).length;
        const failed = this.results.filter(r => !r.success).length;
        const successRate = ((successful / this.totalTasks) * 100).toFixed(2);

        // 모델별 통계
        const modelStats = {};
        for (const result of this.results) {
            if (!modelStats[result.model]) {
                modelStats[result.model] = { total: 0, success: 0, failed: 0 };
            }
            modelStats[result.model].total++;
            if (result.success) {
                modelStats[result.model].success++;
            } else {
                modelStats[result.model].failed++;
            }
        }

        // 웹사이트별 통계
        const websiteStats = {};
        for (const result of this.results) {
            if (!websiteStats[result.website]) {
                websiteStats[result.website] = { total: 0, success: 0, failed: 0 };
            }
            websiteStats[result.website].total++;
            if (result.success) {
                websiteStats[result.website].success++;
            } else {
                websiteStats[result.website].failed++;
            }
        }

        const report = {
            summary: {
                totalTasks: this.totalTasks,
                successfulTasks: successful,
                failedTasks: failed,
                successRate: `${successRate}%`,
                executionTime: `${duration} seconds`,
                timestamp: new Date().toISOString()
            },
            modelStats,
            websiteStats,
            missingCombinationsAddressed: MISSING_COMBINATIONS.length,
            detailedResults: this.results
        };

        // 리포트 저장
        const reportPath = path.join(__dirname, 'benchmark_results', 'data', `missing_combinations_report_${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        // 콘솔 출력
        console.log('\n🎉 MISSING COMBINATIONS BENCHMARK COMPLETED!');
        console.log(`⏱️  Total execution time: ${duration} seconds`);
        console.log(`📝 Total missing combinations addressed: ${this.totalTasks}`);
        console.log(`✅ Successful: ${successful} (${successRate}%)`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📄 Detailed report saved to: ${reportPath}`);

        console.log('\n📈 Model Performance:');
        for (const [model, stats] of Object.entries(modelStats)) {
            const modelSuccessRate = ((stats.success / stats.total) * 100).toFixed(1);
            console.log(`  ${model}: ${stats.success}/${stats.total} (${modelSuccessRate}%)`);
        }

        console.log('\n🌐 Website Performance:');
        for (const [website, stats] of Object.entries(websiteStats)) {
            const websiteSuccessRate = ((stats.success / stats.total) * 100).toFixed(1);
            console.log(`  ${website}: ${stats.success}/${stats.total} (${websiteSuccessRate}%)`);
        }
    }
}

// 메인 실행
async function main() {
    try {
        console.log('🎯 Missing Combinations Benchmark Runner');
        console.log('======================================');

        // 결과 디렉토리 확인/생성
        const resultsDir = path.join(__dirname, 'benchmark_results', 'data');
        await fs.mkdir(resultsDir, { recursive: true });

        const runner = new MissingCombinationRunner();
        await runner.runAllMissingCombinations();

        console.log('✨ All missing combinations have been processed successfully!');

    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default MissingCombinationRunner;