import dotenv from 'dotenv';
import { BenchmarkRunner } from './src/benchmarkRunner.js';

dotenv.config();

async function testBenchmark() {
  console.log('🧪 Testing fixed benchmark system...');

  const runner = new BenchmarkRunner({
    models: ['openai/gpt-4o-mini'] // Start with one model for testing
  });

  try {
    // Run benchmark with just one website and limited tasks
    const results = await runner.runBenchmark({
      websites: ['youtube'], // Test with youtube only
      taskLimit: 1, // Just one task
      parallel: false
    });

    console.log('\n✅ Test completed successfully!');
    console.log('Results:', JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.stack);
  }
}

testBenchmark();