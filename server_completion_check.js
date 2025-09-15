import fs from 'fs';
import path from 'path';

const TARGET_WEBSITES = ['Airbnb', 'TikTok', 'reddit', 'instagram', 'facebook', 'discord', 'Threads'];
const MODELS = ['openai/gpt-4.1', 'deepseek-ai/DeepSeek-V3.1-thinking-on', 'openai/gpt-4o-mini', 'google/gemini-2.5-pro-thinking-on'];
const resultsDir = './benchmark_results/data';

console.log('=== 7개 웹사이트 전체 결과 완성도 검사 (서버용) ===\n');

async function analyzeWebsite(website) {
  try {
    const files = fs.readdirSync(resultsDir);
    const websiteFiles = files.filter(file =>
      file.includes(website) && file.endsWith('.json') && file.startsWith('result_')
    );

    // 모델별 조합 분석
    const modelCombinations = new Map();
    const taskIds = new Set();
    let totalCombinations = 0;

    for (const filename of websiteFiles) {
      try {
        const filePath = path.join(resultsDir, filename);
        const content = fs.readFileSync(filePath, 'utf-8');
        const result = JSON.parse(content);

        if (result.model && result.task && result.task.id) {
          const combinationKey = `${result.model}__${result.task.id}`;

          if (!modelCombinations.has(combinationKey)) {
            modelCombinations.set(combinationKey, 0);
          }
          modelCombinations.get(combinationKey)++;
          taskIds.add(result.task.id);
          totalCombinations++;
        }
      } catch (error) {
        // Skip corrupted files
      }
    }

    // 모델별 완료된 task 수 계산
    const modelStats = {};
    MODELS.forEach(model => {
      const completedTasks = new Set();
      for (const [combinationKey, count] of modelCombinations.entries()) {
        if (combinationKey.startsWith(model + '__')) {
          const taskId = combinationKey.split('__')[1];
          completedTasks.add(taskId);
        }
      }
      modelStats[model] = completedTasks.size;
    });

    const uniqueTasks = taskIds.size;
    const expectedCombinations = MODELS.length * uniqueTasks; // 4 models × unique tasks

    console.log(`${website}:`);
    console.log(`  고유 Task 수: ${uniqueTasks}개`);
    console.log(`  총 결과 파일: ${websiteFiles.length}개`);
    console.log(`  고유 조합: ${modelCombinations.size}개`);
    console.log(`  예상 조합: ${expectedCombinations} (4 models × ${uniqueTasks} tasks)`);

    // 모델별 완료 현황
    console.log(`  모델별 완료 task 수:`);
    Object.entries(modelStats).forEach(([model, completedTasks]) => {
      const modelName = model.split('/')[1] || model;
      const completionPercentage = uniqueTasks > 0 ? Math.round((completedTasks / uniqueTasks) * 100) : 0;
      console.log(`    ${modelName}: ${completedTasks}/${uniqueTasks} (${completionPercentage}%)`);
    });

    // 전체 완성도 평가
    const minCompletedTasks = Math.min(...Object.values(modelStats));
    const maxCompletedTasks = Math.max(...Object.values(modelStats));
    const avgCompletedTasks = Object.values(modelStats).reduce((a, b) => a + b, 0) / MODELS.length;

    let status;
    if (minCompletedTasks === uniqueTasks && maxCompletedTasks === uniqueTasks) {
      status = '✅ 완료 (모든 모델)';
    } else if (avgCompletedTasks / uniqueTasks >= 0.9) {
      status = '⚠️  거의 완료';
    } else if (avgCompletedTasks / uniqueTasks >= 0.5) {
      status = '🔄 부분 완료';
    } else {
      status = '❌ 미완료';
    }

    console.log(`  전체 상태: ${status}`);
    console.log('');

    return {
      website,
      uniqueTasks,
      totalFiles: websiteFiles.length,
      modelStats,
      status: status.includes('✅') ? 'complete' : status.includes('⚠️') ? 'mostly' : status.includes('🔄') ? 'partial' : 'incomplete'
    };

  } catch (error) {
    console.log(`${website}: 검사 실패 - ${error.message}`);
    console.log('');
    return { website, status: 'error' };
  }
}

// 모든 웹사이트 분석 실행
const results = [];
for (const website of TARGET_WEBSITES) {
  const result = await analyzeWebsite(website);
  results.push(result);
}

// 전체 요약
console.log('=== 전체 요약 ===');
const completeWebsites = results.filter(r => r.status === 'complete');
const mostlyCompleteWebsites = results.filter(r => r.status === 'mostly');
const partialWebsites = results.filter(r => r.status === 'partial');
const incompleteWebsites = results.filter(r => r.status === 'incomplete');

console.log(`✅ 완전히 완료: ${completeWebsites.map(r => r.website).join(', ') || '없음'}`);
console.log(`⚠️  거의 완료: ${mostlyCompleteWebsites.map(r => r.website).join(', ') || '없음'}`);
console.log(`🔄 부분 완료: ${partialWebsites.map(r => r.website).join(', ') || '없음'}`);
console.log(`❌ 미완료/오류: ${incompleteWebsites.map(r => r.website).join(', ') || '없음'}`);