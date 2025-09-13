import { BenchmarkRunner } from './benchmarkRunner.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSingleTask() {
    console.log('🧪 Testing benchmark system with a single task...');

    const runner = new BenchmarkRunner();

    // Override config for testing
    runner.config = {
        maxRetries: 2, // Fewer retries for testing
        timeoutMs: 15000, // Shorter timeout
        screenshotOnError: true,
        saveAllLogs: true
    };

    try {
        const report = await runner.runBenchmark({
            websites: ['youtube'], // Test only YouTube
            taskLimit: 1,          // Only one task
            skipFailedTasks: true,
            parallel: false
        });

        console.log('\\n✅ Test completed successfully!');
        console.log('📊 Summary:', report.summary);

        return report;
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\\\/g, '/')}`) {
    testSingleTask()
        .then(report => {
            console.log('\\n🎉 Benchmark test successful!');
            console.log(`Check benchmark_results/ for detailed outputs`);
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Benchmark test failed:', error);
            process.exit(1);
        });
}