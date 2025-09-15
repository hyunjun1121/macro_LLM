import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 엄격하게 검증된 누락 조합들
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

// 메모리 최적화된 설정
const MAX_WORKERS = 4; // 안정성을 위해 32에서 4로 감소
const MAX_TRIALS = 3;
const TIMEOUT_MS = 300000; // 5분 타임아웃

class ValidatedMissingCombinationRunner {
    constructor() {
        this.taskQueue = [];
        this.activeWorkers = new Set();
        this.results = [];
        this.totalTasks = 0;
        this.completedTasks = 0;
        this.executedTaskIds = new Set(); // 중복 실행 방지
        this.skippedTasks = [];

        // 검증된 모듈들
        this.BenchmarkRunner = null;
        this.TaskExtractor = null;
        this.ResultStorage = null;
    }

    async initialize() {
        console.log('🔧 Initializing validated modules...');

        try {
            // 모든 필요한 모듈 사전 로드 및 검증
            const benchmarkModule = await import('./src/benchmarkRunner.js');
            const taskExtractorModule = await import('./src/taskExtractor.js');
            const resultStorageModule = await import('./src/resultStorage.js');

            this.BenchmarkRunner = benchmarkModule.BenchmarkRunner;
            this.TaskExtractor = taskExtractorModule.TaskExtractor;
            this.ResultStorage = resultStorageModule.ResultStorage;

            // 모듈 검증
            if (!this.BenchmarkRunner) throw new Error('BenchmarkRunner not found');
            if (!this.TaskExtractor) throw new Error('TaskExtractor not found');
            if (!this.ResultStorage) throw new Error('ResultStorage not found');

            console.log('✅ All modules successfully loaded and validated');

            await this.buildValidatedTaskQueue();
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            throw error;
        }
    }

    async buildValidatedTaskQueue() {
        console.log('📋 Building validated task queue...');

        // Task 발견 및 검증
        const taskExtractor = new this.TaskExtractor();
        const allTasks = await taskExtractor.discoverAllTasks();

        console.log('🔍 Available websites:', Object.keys(allTasks));

        for (const combination of MISSING_COMBINATIONS) {
            const { model, website, tasks: requestedTaskIds } = combination;

            console.log(`\n📝 Processing ${model} + ${website}`);

            // 웹사이트 데이터 검증
            const websiteData = allTasks[website];
            if (!websiteData || websiteData.length === 0) {
                console.log(`⚠️  No tasks found for website: ${website}`);
                for (const taskId of requestedTaskIds) {
                    this.skippedTasks.push({
                        model, website, taskId,
                        reason: `Website ${website} not found or has no tasks`
                    });
                }
                continue;
            }

            console.log(`   Found ${websiteData.length} total tasks for ${website}`);

            // 각 요청된 task ID에 대해 다중 전략 매칭
            for (const requestedTaskId of requestedTaskIds) {
                const taskDetails = this.findTaskByMultipleStrategies(websiteData, requestedTaskId);

                if (!taskDetails) {
                    console.log(`   ⚠️  Task not found: ${requestedTaskId}`);
                    console.log(`      Available IDs: ${websiteData.slice(0, 5).map(t => t.id).join(', ')}...`);

                    this.skippedTasks.push({
                        model, website, taskId: requestedTaskId,
                        reason: `Task ID ${requestedTaskId} not found`
                    });
                    continue;
                }

                // 고유 ID 생성 및 중복 체크
                const uniqueId = `${model}__${website}__${taskDetails.id}`;
                if (this.executedTaskIds.has(uniqueId)) {
                    console.log(`   ⚠️  Duplicate detected, skipping: ${uniqueId}`);
                    continue;
                }

                this.executedTaskIds.add(uniqueId);

                this.taskQueue.push({
                    model,
                    website,
                    taskId: taskDetails.id,
                    taskDetails,
                    requestedTaskId,
                    id: `${website}_${taskDetails.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
                });

                console.log(`   ✅ Added: ${requestedTaskId} → ${taskDetails.id}`);
            }
        }

        this.totalTasks = this.taskQueue.length;
        console.log(`\n📊 Final task queue: ${this.totalTasks} unique tasks`);
        console.log(`📊 Skipped tasks: ${this.skippedTasks.length}`);

        // 무작위 섞기 (부하 분산)
        this.shuffleArray(this.taskQueue);
    }

    findTaskByMultipleStrategies(websiteData, requestedTaskId) {
        // 전략 1: Exact match
        let found = websiteData.find(t => t.id === requestedTaskId);
        if (found) return found;

        // 전략 2: Ends with match (for cases like "001" vs "TASK_001")
        found = websiteData.find(t => t.id.endsWith(requestedTaskId) || requestedTaskId.endsWith(t.id));
        if (found) return found;

        // 전략 3: Contains match
        found = websiteData.find(t => t.id.includes(requestedTaskId) || requestedTaskId.includes(t.id));
        if (found) return found;

        // 전략 4: Case insensitive
        const lowerRequestedId = requestedTaskId.toLowerCase();
        found = websiteData.find(t => t.id.toLowerCase() === lowerRequestedId);
        if (found) return found;

        return null;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    async runAllMissingCombinations() {
        console.log(`🚀 Starting VALIDATED benchmark execution`);
        console.log(`📊 Total missing combinations: ${this.totalTasks}`);
        console.log(`👷 Workers: ${MAX_WORKERS}`);
        console.log('⏰ Start time:', new Date().toISOString());

        if (this.totalTasks === 0) {
            console.log('⚠️  No tasks to execute!');
            return;
        }

        const startTime = Date.now();

        // 워커들 생성 및 실행
        const workerPromises = [];
        for (let i = 0; i < Math.min(MAX_WORKERS, this.totalTasks); i++) {
            workerPromises.push(this.runValidatedWorker(i));
        }

        // 모든 워커가 완료될 때까지 대기
        await Promise.all(workerPromises);

        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);

        await this.generateValidatedReport(duration);
    }

    async runValidatedWorker(workerId) {
        console.log(`👷 Validated Worker ${workerId} started`);

        while (this.taskQueue.length > 0) {
            const task = this.taskQueue.shift();
            if (!task) break;

            try {
                console.log(`[Worker ${workerId}] 🎯 Running ${task.model} + ${task.website}/${task.taskId} (${this.completedTasks + 1}/${this.totalTasks})`);

                const result = await this.runValidatedSingleTask(task);
                this.results.push(result);
                this.completedTasks++;

                // 진행률 표시
                const progress = Math.round((this.completedTasks / this.totalTasks) * 100);
                console.log(`[Worker ${workerId}] ${result.success ? '✅' : '❌'} ${task.id} (${progress}%)`);

            } catch (error) {
                console.error(`[Worker ${workerId}] 💥 Critical error for ${task.id}:`, error.message);

                const errorResult = {
                    ...task,
                    success: false,
                    error: `Critical error: ${error.message}`,
                    timestamp: new Date().toISOString()
                };

                this.results.push(errorResult);
                this.completedTasks++;
            }
        }

        console.log(`👷 Validated Worker ${workerId} finished`);
    }

    async runValidatedSingleTask(task) {
        try {
            // 검증된 인스턴스 생성
            const runner = new this.BenchmarkRunner();
            const taskExtractor = new this.TaskExtractor();
            const storage = new this.ResultStorage();

            // 웹사이트 정보 가져오기 (검증됨)
            const websiteInfo = await taskExtractor.getWebsiteInfo(task.website);

            // 모델 설정 (검증된 속성)
            runner.selectedModels = [task.model];
            runner.config.maxRetries = MAX_TRIALS;

            // 검증된 메서드 호출
            const result = await Promise.race([
                runner.runSingleTask(task.website, websiteInfo, task.taskDetails),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Task timeout')), TIMEOUT_MS)
                )
            ]);

            // 결과 저장 시도 (실패해도 계속 진행)
            try {
                await storage.saveResult(result);
            } catch (storageError) {
                console.warn(`⚠️  Failed to save result for ${task.id}: ${storageError.message}`);
            }

            return {
                ...task,
                success: result.success || false,
                attempts: result.attempts || [],
                finalResult: result.finalResult || null,
                executionTime: result.totalExecutionTime || 0,
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

    async generateValidatedReport(duration) {
        console.log('\n📊 Generating validated final report...');

        const successful = this.results.filter(r => r.success).length;
        const failed = this.results.filter(r => !r.success).length;
        const successRate = this.totalTasks > 0 ? ((successful / this.totalTasks) * 100).toFixed(2) : '0.00';

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
                totalTasksRequested: MISSING_COMBINATIONS.reduce((sum, combo) => sum + combo.tasks.length, 0),
                totalTasksExecuted: this.totalTasks,
                totalTasksSkipped: this.skippedTasks.length,
                successfulTasks: successful,
                failedTasks: failed,
                successRate: `${successRate}%`,
                executionTime: `${duration} seconds`,
                timestamp: new Date().toISOString(),
                duplicatePrevention: `${this.executedTaskIds.size} unique combinations tracked`
            },
            modelStats,
            websiteStats,
            skippedTasksDetails: this.skippedTasks,
            missingCombinationsAddressed: MISSING_COMBINATIONS.length,
            detailedResults: this.results
        };

        // 리포트 저장
        const reportPath = path.join(__dirname, 'benchmark_results', 'data', `validated_missing_combinations_${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        // 콘솔 출력
        console.log('\n🎉 VALIDATED MISSING COMBINATIONS BENCHMARK COMPLETED!');
        console.log(`⏱️  Total execution time: ${duration} seconds`);
        console.log(`📝 Requested combinations: ${report.summary.totalTasksRequested}`);
        console.log(`🎯 Executed tasks: ${this.totalTasks}`);
        console.log(`⏭️  Skipped tasks: ${this.skippedTasks.length}`);
        console.log(`✅ Successful: ${successful} (${successRate}%)`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`🔒 Duplicate prevention: ${this.executedTaskIds.size} unique IDs tracked`);
        console.log(`📄 Detailed report: ${reportPath}`);

        if (this.skippedTasks.length > 0) {
            console.log('\n⚠️  Skipped Tasks Summary:');
            const skipReasons = {};
            for (const skip of this.skippedTasks) {
                skipReasons[skip.reason] = (skipReasons[skip.reason] || 0) + 1;
            }
            for (const [reason, count] of Object.entries(skipReasons)) {
                console.log(`   ${reason}: ${count} tasks`);
            }
        }

        console.log('\n📈 Model Performance:');
        for (const [model, stats] of Object.entries(modelStats)) {
            const modelSuccessRate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '0.0';
            console.log(`  ${model}: ${stats.success}/${stats.total} (${modelSuccessRate}%)`);
        }

        console.log('\n🌐 Website Performance:');
        for (const [website, stats] of Object.entries(websiteStats)) {
            const websiteSuccessRate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '0.0';
            console.log(`  ${website}: ${stats.success}/${stats.total} (${websiteSuccessRate}%)`);
        }
    }
}

// 메인 실행
async function main() {
    try {
        console.log('🎯 VALIDATED Missing Combinations Benchmark Runner');
        console.log('=================================================');

        // 결과 디렉토리 확인/생성
        const resultsDir = path.join(__dirname, 'benchmark_results', 'data');
        await fs.mkdir(resultsDir, { recursive: true });

        const runner = new ValidatedMissingCombinationRunner();
        await runner.initialize();
        await runner.runAllMissingCombinations();

        console.log('✨ All validated missing combinations have been processed successfully!');

    } catch (error) {
        console.error('💥 Fatal error in validated runner:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default ValidatedMissingCombinationRunner;