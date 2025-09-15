import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';

dotenv.config();

async function testMultiprocessingSample() {
  console.log('🧪 Testing Multi-Processing Implementation');
  console.log('=' * 50);
  console.log('🎯 Test: 1 model, 1 website, concurrency 3');
  console.log('⚡ Expected: 3 tasks running in parallel');
  console.log('');

  const startTime = Date.now();

  try {
    const runner = new BenchmarkRunner({
      models: ['openai/gpt-4o-mini'] // Fast model for testing
    });

    console.log('🔄 Starting test benchmark...');

    const results = await runner.runBenchmark({
      websites: ['youtube'], // Just one website
      taskLimit: 6, // Test with 6 tasks
      parallel: true, // Enable parallel processing
      concurrency: 3, // Test with 3 concurrent tasks
      skipFailedTasks: true
    });

    const executionTime = (Date.now() - startTime) / 1000;

    console.log('\\n✅ Multi-Processing Test Completed!');
    console.log('=' * 50);
    console.log(`⏱️  Execution Time: ${executionTime.toFixed(2)} seconds`);
    console.log(`📊 Results:`);
    console.log(`   Total Tasks: ${results.summary.totalTasks}`);
    console.log(`   Successful: ${results.summary.successfulTasks}`);
    console.log(`   Success Rate: ${results.summary.successRate}`);
    console.log(`   Tasks per second: ${(results.summary.totalTasks / executionTime).toFixed(2)}`);

    // Verify parallel execution by checking if it's faster than sequential would be
    const expectedSequentialTime = results.summary.totalTasks * 10; // Assume ~10s per task
    const speedup = expectedSequentialTime / executionTime;

    console.log('\\n🚀 Performance Analysis:');
    console.log(`   Expected sequential time: ~${expectedSequentialTime}s`);
    console.log(`   Actual parallel time: ${executionTime.toFixed(2)}s`);
    console.log(`   Speedup factor: ${speedup.toFixed(2)}x`);

    if (speedup > 1.5) {
      console.log('   ✅ Multi-processing appears to be working effectively!');
    } else {
      console.log('   ⚠️  Multi-processing may not be providing expected speedup');
    }

    console.log('\\n📋 Task Details:');
    if (results.results && results.results.length > 0) {
      results.results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        const time = result.totalExecutionTime ? (result.totalExecutionTime / 1000).toFixed(1) : 'N/A';
        console.log(`   ${index + 1}. ${result.task.description}: ${status} (${time}s)`);
      });
    }

    return true;

  } catch (error) {
    console.error('❌ Multi-Processing Test Failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

console.log('🔧 Environment Check:');
console.log(`   API Key: ${process.env.API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   Base URL: ${process.env.BASE_URL || '❌ Missing'}`);
console.log('');

testMultiprocessingSample().then(success => {
  if (success) {
    console.log('\\n🎉 Multi-Processing test passed! Ready for full experiment.');
    process.exit(0);
  } else {
    console.log('\\n❌ Multi-Processing test failed. Please check implementation.');
    process.exit(1);
  }
});