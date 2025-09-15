import fs from 'fs/promises';

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate results...');

  const resultsDir = 'benchmark_results/data';
  const files = await fs.readdir(resultsDir);
  const resultFiles = files.filter(file => file.startsWith('result_') && file.endsWith('.json'));

  console.log(`📄 Analyzing ${resultFiles.length} result files`);

  const taskCombinations = new Map(); // taskId -> array of results
  const duplicates = [];

  for (const filename of resultFiles) {
    try {
      const content = await fs.readFile(`${resultsDir}/${filename}`, 'utf-8');
      const result = JSON.parse(content);

      const taskKey = `${result.model}__${result.website}__${result.task?.id}`;

      if (!taskCombinations.has(taskKey)) {
        taskCombinations.set(taskKey, []);
      }

      taskCombinations.get(taskKey).push({
        filename,
        success: result.success,
        timestamp: result.timestamp
      });
    } catch (error) {
      console.log(`❌ Error reading ${filename}: ${error.message}`);
    }
  }

  console.log(`\n📊 분석 결과:`);
  console.log(`   고유 task 조합: ${taskCombinations.size}개`);

  let totalDuplicates = 0;
  let successfulCombinations = 0;

  for (const [taskKey, results] of taskCombinations) {
    if (results.length > 1) {
      totalDuplicates += (results.length - 1);
      duplicates.push({
        taskKey,
        count: results.length,
        results
      });
    }

    // Count successful combinations
    if (results.some(r => r.success)) {
      successfulCombinations++;
    }
  }

  console.log(`   성공한 고유 조합: ${successfulCombinations}개`);
  console.log(`   중복된 조합: ${duplicates.length}개`);
  console.log(`   총 중복 파일: ${totalDuplicates}개`);

  if (duplicates.length > 0) {
    console.log(`\n🔍 중복 조합 상위 10개:`);
    duplicates
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .forEach(dup => {
        const [model, website, taskId] = dup.taskKey.split('__');
        const successCount = dup.results.filter(r => r.success).length;
        console.log(`   ${model} → ${website} → ${taskId}: ${dup.count}개 (성공: ${successCount}개)`);
      });
  }

  return {
    totalFiles: resultFiles.length,
    uniqueCombinations: taskCombinations.size,
    successfulCombinations,
    duplicatedCombinations: duplicates.length,
    totalDuplicateFiles: totalDuplicates
  };
}

checkDuplicates().catch(console.error);