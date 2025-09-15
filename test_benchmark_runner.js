import { BenchmarkRunner } from './src/benchmarkRunner.js';

async function testBenchmarkRunner() {
    try {
        console.log('🔍 Testing BenchmarkRunner...');

        const runner = new BenchmarkRunner();
        console.log('✅ BenchmarkRunner instantiated successfully');

        // Check if runSingleTaskWithModel method exists
        if (typeof runner.runSingleTaskWithModel === 'function') {
            console.log('✅ runSingleTaskWithModel method exists');
        } else {
            console.log('❌ runSingleTaskWithModel method not found');
            console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(runner)));
        }

        // Test task extraction
        console.log('🔍 Testing task extraction...');
        const tasks = await runner.taskExtractor.extractTasksFromWebsite('Airbnb');
        console.log(`✅ Found ${tasks.length} tasks for Airbnb`);

        if (tasks.length > 0) {
            console.log('First task:', tasks[0]);
        }

    } catch (error) {
        console.error('❌ Error testing BenchmarkRunner:', error.message);
        console.error('Stack:', error.stack);
    }
}

testBenchmarkRunner();