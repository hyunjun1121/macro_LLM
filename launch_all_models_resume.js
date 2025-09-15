import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const TARGET_MODELS = [
  'openai/gpt-4.1',
  'google/gemini-2.5-pro-thinking-on',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini'
];

async function launchAllModelsWithResume() {
  console.log('🚀 Launching All Models with Resume Functionality');
  console.log('=' * 60);
  console.log(`🎯 Target Models: ${TARGET_MODELS.length} models`);
  console.log(`🔄 Resume mode: ENABLED for all models`);
  console.log(`⚡ Each model runs in separate process for stability`);
  console.log('');

  const processes = [];
  const startTime = Date.now();

  for (const [index, model] of TARGET_MODELS.entries()) {
    console.log(`🚀 Starting ${model}...`);

    const process = spawn('node', ['run_single_model_benchmark.js', model, 'resume'], {
      stdio: 'inherit', // Forward output to console
      cwd: process.cwd()
    });

    process.on('close', (code) => {
      console.log(`\n✅ ${model} completed with exit code: ${code}`);

      // Check if all processes are complete
      const completedCount = processes.filter(p => p.exitCode !== null).length;
      if (completedCount === TARGET_MODELS.length) {
        const totalTime = (Date.now() - startTime) / 1000 / 60;
        console.log(`\n🎉 ALL MODELS COMPLETED!`);
        console.log(`⏱️  Total execution time: ${totalTime.toFixed(2)} minutes`);
        console.log('📊 Check benchmark_results/ for detailed reports');
      }
    });

    process.on('error', (error) => {
      console.error(`❌ ${model} failed to start:`, error);
    });

    processes.push(process);

    // Brief delay between launches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n📊 Launched ${TARGET_MODELS.length} model processes`);
  console.log('🔄 Each model will resume from where it left off');
  console.log('📈 Monitor individual progress in the console output');
  console.log('\n⚠️  Press Ctrl+C to stop all processes');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down all model processes...');
    processes.forEach(p => {
      if (p.exitCode === null) {
        p.kill('SIGTERM');
      }
    });
    process.exit(0);
  });

  // Keep main process alive
  return new Promise(resolve => {
    let completedCount = 0;
    processes.forEach(p => {
      p.on('close', () => {
        completedCount++;
        if (completedCount === TARGET_MODELS.length) {
          resolve();
        }
      });
    });
  });
}

console.log('🔧 Environment Check:');
console.log(`   API Key: ${process.env.API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   Base URL: ${process.env.BASE_URL || '❌ Missing'}`);
console.log('');

if (!process.env.API_KEY || !process.env.BASE_URL) {
  console.error('❌ Missing required environment variables. Please check .env file.');
  process.exit(1);
}

launchAllModelsWithResume().then(() => {
  console.log('\n✨ All model benchmarks complete!');
}).catch(error => {
  console.error('❌ Failed to launch models:', error);
  process.exit(1);
});