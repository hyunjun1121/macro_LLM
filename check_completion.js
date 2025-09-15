import fs from 'fs';
import path from 'path';

const TARGET_WEBSITES = ['Airbnb', 'TikTok', 'reddit', 'instagram', 'facebook', 'discord', 'Threads'];
const MODELS = ['openai/gpt-4.1', 'deepseek-ai/DeepSeek-V3.1-thinking-on', 'openai/gpt-4o-mini', 'google/gemini-2.5-pro-thinking-on'];
const TASKS_PER_WEBSITE = 20; // 일반적으로 각 웹사이트당 20개 task
const resultsDir = './benchmark_results/data';

console.log('=== 7개 웹사이트 전체 결과 완성도 검사 ===\n');

TARGET_WEBSITES.forEach(website => {
  try {
    const files = fs.readdirSync(resultsDir);
    const websiteFiles = files.filter(file =>
      file.includes(website) && file.endsWith('.json') && file.startsWith('result_')
    );

    // 예상 조합 수 계산
    const expectedCombinations = MODELS.length * TASKS_PER_WEBSITE; // 4 models × 20 tasks = 80
    const actualCombinations = websiteFiles.length;
    const completionRate = Math.round((actualCombinations / expectedCombinations) * 100);

    // 모델별 분포 확인
    const modelCounts = {};
    MODELS.forEach(model => {
      const modelKey = model.replace(/[^a-zA-Z0-9]/g, '_');
      const modelShortName = model.split('/')[1] || model;
      modelCounts[model] = websiteFiles.filter(file =>
        file.includes(modelKey) || file.includes(modelShortName)
      ).length;
    });

    console.log(`${website}:`);
    console.log(`  예상 조합: ${expectedCombinations} (4 models × 20 tasks)`);
    console.log(`  실제 결과: ${actualCombinations}개`);
    console.log(`  완성도: ${completionRate}%`);
    console.log(`  상태: ${completionRate >= 90 ? '✅ 거의 완료' : completionRate >= 50 ? '⚠️  부분 완료' : '❌ 미완료'}`);

    // 모델별 분포
    console.log(`  모델별 결과:`);
    Object.entries(modelCounts).forEach(([model, count]) => {
      const modelCompletionRate = Math.round((count / TASKS_PER_WEBSITE) * 100);
      const modelName = model.split('/')[1] || model;
      console.log(`    ${modelName}: ${count}/20 (${modelCompletionRate}%)`);
    });
    console.log('');
  } catch (error) {
    console.log(`${website}: 검사 실패 - ${error.message}`);
    console.log('');
  }
});