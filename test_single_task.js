import { EnhancedMacroGenerator } from './src/enhancedMacroGenerator.js';
import { BenchmarkExecutor } from './src/benchmarkExecutor.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSingleTask() {
  console.log('=== Single Task Test ===\n');

  // Initialize components
  const generator = new EnhancedMacroGenerator(
    process.env.API_KEY,
    process.env.BASE_URL
  );
  const executor = new BenchmarkExecutor();

  // Test task
  const task = {
    id: 'TEST_001',
    description: 'Click on a submit button',
    expectedResult: 'Button should be clicked',
    difficulty: 'easy',
    category: 'interaction'
  };

  // Use YouTube HTML as sample
  const htmlPath = './youtube/index.html';

  try {
    console.log('1. Generating macro with openai/gpt-4o-mini...\n');

    const macroCode = await generator.generateMacroCode(
      task,
      htmlPath,
      [], // No previous attempts
      'openai/gpt-4o-mini'
    );

    console.log('2. Generated macro code:');
    console.log('=' * 60);
    console.log(macroCode);
    console.log('=' * 60);
    console.log();

    console.log('3. Executing macro...\n');

    const result = await executor.executeMacro(
      macroCode,
      htmlPath,
      task,
      1
    );

    console.log('4. Execution result:');
    console.log('Success:', result.success);
    console.log('Error:', result.error);
    console.log('Action:', result.action);
    console.log('Screenshots:', result.screenshots?.length || 0);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSingleTask();