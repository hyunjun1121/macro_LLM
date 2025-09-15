import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';

dotenv.config();

async function testResumeFunctionality() {
  console.log('🔧 Testing Resume Functionality');
  console.log('=' * 50);

  // Test with openai/gpt-4.1 model (currently running)
  const testModel = 'openai/gpt-4.1';

  console.log(`🎯 Testing resume for model: ${testModel}`);
  console.log('📋 This should skip already completed tasks\n');

  try {
    const runner = new BenchmarkRunner({
      models: [testModel]
    });

    // Run with resume enabled
    const results = await runner.runBenchmark({
      websites: [], // All websites
      taskLimit: null, // All tasks
      parallel: false,
      skipFailedTasks: true,
      resume: true,
      model: testModel
    });

    console.log(`\n✅ Resume test completed!`);
    console.log(`📊 Results: ${results.summary.successfulTasks}/${results.summary.totalTasks} tasks`);
    console.log(`📈 Success Rate: ${results.summary.successRate}`);

  } catch (error) {
    console.error('❌ Resume test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

console.log('🔧 Environment Check:');
console.log(`   API Key: ${process.env.API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   Base URL: ${process.env.BASE_URL || '❌ Missing'}`);
console.log('');

if (!process.env.API_KEY || !process.env.BASE_URL) {
  console.error('❌ Missing required environment variables. Please check .env file.');
  process.exit(1);
}

testResumeFunctionality().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});