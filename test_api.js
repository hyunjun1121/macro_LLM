import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.BASE_URL
});

async function testModel(model) {
  console.log(`Testing ${model}...`);
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: 'Hello, respond with just "OK"' }],
      temperature: 0.3,
    });

    console.log(`✅ ${model}: ${response.choices[0].message.content}`);
    return true;
  } catch (error) {
    console.log(`❌ ${model}: ${error.message}`);
    console.log(`Error details:`, error.response?.data || error);
    return false;
  }
}

const modelsToTest = [
  'openai/gpt-4.1',
  'google/gemini-2.5-pro-thinking-on',
  'deepseek-ai/DeepSeek-V3.1-thinking-on',
  'openai/gpt-4o-mini'
];

console.log('🔬 Testing API connectivity with OpenAI client...');
for (const model of modelsToTest) {
  await testModel(model);
  console.log('---');
}