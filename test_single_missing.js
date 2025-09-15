import { BenchmarkRunner } from './src/benchmarkRunner.js';
import { TaskExtractor } from './src/taskExtractor.js';

async function testSingleMissingTask() {
    try {
        console.log('🧪 Testing single missing task...');

        // Test with one simple task
        const testTask = {
            model: 'openai/gpt-4o-mini',
            website: 'Airbnb',
            taskId: 'TASK_001',
            id: `test_${Date.now()}`
        };

        console.log('📋 Test task:', testTask);

        const runner = new BenchmarkRunner();
        const taskExtractor = new TaskExtractor();

        console.log('🔍 Getting website info...');
        const websiteInfo = await taskExtractor.getWebsiteInfo(testTask.website);
        console.log('✅ Website info retrieved');

        console.log('📝 Discovering all tasks...');
        const allTasks = await taskExtractor.discoverAllTasks();
        const tasks = allTasks[testTask.website] || [];
        console.log(`✅ Found ${tasks.length} tasks for ${testTask.website}`);

        if (tasks.length > 0) {
            console.log('First few tasks:', tasks.slice(0, 3).map(t => ({ id: t.id, description: t.description })));
        }

        const taskDetails = tasks.find(t => t.id === testTask.taskId);
        if (!taskDetails) {
            console.log('❌ Task not found:', testTask.taskId);
            console.log('Available task IDs:', tasks.map(t => t.id));
            return;
        }

        console.log('✅ Task details found:', { id: taskDetails.id, description: taskDetails.description });

        // Set model and config
        runner.selectedModels = [testTask.model];
        runner.config.maxRetries = 1; // Just 1 attempt for test

        console.log('🚀 Running single task...');
        const result = await runner.runSingleTask(testTask.website, websiteInfo, taskDetails);

        console.log('✅ Task completed!');
        console.log('Result:', {
            success: result.success,
            attempts: result.attempts?.length || 0,
            finalResult: result.finalResult ? 'Present' : 'None'
        });

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testSingleMissingTask();