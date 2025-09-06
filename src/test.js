import { WebAgent } from './main.js';
import path from 'path';

async function runTests() {
  const agent = new WebAgent();
  
  const testCases = [
    {
      name: 'Facebook Login Test',
      instruction: 'Find and click the login button on the Facebook page',
      htmlPath: path.join(process.cwd(), 'facebook', 'home.html')
    },
    {
      name: 'Instagram Search Test',
      instruction: 'Find the search box and type "nature photography"',
      htmlPath: path.join(process.cwd(), 'instagram', 'index.html')
    },
    {
      name: 'YouTube Video Test',
      instruction: 'Click on the first video thumbnail',
      htmlPath: path.join(process.cwd(), 'youtube', 'index.html')
    },
    {
      name: 'Reddit Navigation Test',
      instruction: 'Click on the profile link',
      htmlPath: path.join(process.cwd(), 'reddit', 'index.html')
    }
  ];

  console.log('🧪 Starting Web Agent Tests\n');
  console.log('=' * 70);

  for (const test of testCases) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log('-' * 50);
    
    try {
      const result = await agent.runMacro(test.instruction, test.htmlPath);
      
      if (result.success) {
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        console.log(`❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      console.log(`💥 ${test.name} - ERROR: ${error.message}`);
    }
    
    console.log('-' * 50);
  }

  console.log('\n🎯 All tests completed!');
  console.log('Check the reports folder for detailed execution reports.');
}

runTests().catch(console.error);