import fs from 'fs/promises';
import path from 'path';

class AnalysisDataDeduplicator {
  constructor() {
    this.resultsDir = './benchmark_results/data';
    this.targetWebsites = ['Airbnb', 'TikTok', 'reddit', 'instagram', 'facebook', 'discord', 'Threads'];
    this.models = ['openai/gpt-4.1', 'deepseek-ai/DeepSeek-V3.1-thinking-on', 'openai/gpt-4o-mini', 'google/gemini-2.5-pro-thinking-on'];
    this.dryRun = true; // Safety flag
  }

  async analyzeDuplicates() {
    console.log('🔍 Analysis용 중복 데이터 분석...');

    const files = await fs.readdir(this.resultsDir);
    const resultFiles = files.filter(file =>
      file.startsWith('result_') && file.endsWith('.json') &&
      this.targetWebsites.some(website => file.includes(website))
    );

    console.log(`📄 대상 웹사이트 결과 파일: ${resultFiles.length}개`);

    const combinations = new Map(); // taskKey -> array of file info
    const corruptedFiles = [];

    for (const filename of resultFiles) {
      try {
        const filePath = path.join(this.resultsDir, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const result = JSON.parse(content);

        // Create unique task key
        const taskKey = `${result.model}__${result.website}__${result.task?.id}`;

        if (!combinations.has(taskKey)) {
          combinations.set(taskKey, []);
        }

        const fileInfo = {
          filename,
          filePath,
          success: result.success,
          timestamp: result.timestamp,
          attempt: result.attempt || 1,
          size: content.length,
          errorType: result.errorType || 'unknown',
          executionLogs: result.executionLogs || []
        };

        combinations.get(taskKey).push(fileInfo);

      } catch (error) {
        console.warn(`⚠️  Corrupted file ${filename}: ${error.message}`);
        corruptedFiles.push(filename);
      }
    }

    return { combinations, corruptedFiles };
  }

  selectBestFileForAnalysis(files) {
    // ANALYSIS STRATEGY:
    // 1. PRIORITY 1: Keep FAILED results for error analysis (most valuable for paper)
    // 2. PRIORITY 2: If only successful results exist, keep the most recent one
    // 3. For failed results, prefer larger files (more detailed logs)

    const successfulFiles = files.filter(f => f.success === true);
    const failedFiles = files.filter(f => f.success === false || f.success === undefined);

    console.log(`    📊 선택 중: ${files.length}개 파일 (실패 ${failedFiles.length}개, 성공 ${successfulFiles.length}개)`);

    // PRIORITY 1: Always keep failed results if any exist (most valuable for analysis)
    if (failedFiles.length > 0) {
      const selectedFailed = failedFiles.sort((a, b) => {
        // Most recent first
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;

        // Larger file (more detailed logs for analysis)
        if (b.size !== a.size) return b.size - a.size;

        // Higher attempt number (final retry)
        return (b.attempt || 1) - (a.attempt || 1);
      })[0];

      console.log(`    ❌ Analysis용 실패 결과 선택: ${selectedFailed.filename} (attempt ${selectedFailed.attempt || 1})`);
      return selectedFailed;
    }

    // PRIORITY 2: If only successful files exist, keep the most recent one
    if (successfulFiles.length > 0) {
      const selectedSuccessful = successfulFiles.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;

        if (b.size !== a.size) return b.size - a.size;
        return (b.attempt || 1) - (a.attempt || 1);
      })[0];

      console.log(`    ✅ Analysis용 성공 결과 선택: ${selectedSuccessful.filename} (실패 데이터 없음)`);
      return selectedSuccessful;
    }

    // Fallback
    console.log(`    ⚠️  Fallback 선택: ${files[0].filename}`);
    return files[0];
  }

  async deduplicateForAnalysis() {
    console.log('🚀 Analysis용 중복 제거 시작...');
    console.log(`⚠️  DRY RUN MODE: ${this.dryRun ? 'ENABLED' : 'DISABLED'}`);
    console.log('🎯 전략: 실패한 결과 우선 보존 (에러 분석용)');

    const { combinations, corruptedFiles } = await this.analyzeDuplicates();

    console.log(`\n📊 분석 결과:`);
    console.log(`   총 고유 조합: ${combinations.size}개`);
    console.log(`   손상된 파일: ${corruptedFiles.length}개`);

    const duplicatedCombinations = Array.from(combinations.entries())
      .filter(([key, files]) => files.length > 1);

    console.log(`   중복 조합: ${duplicatedCombinations.length}개`);

    if (duplicatedCombinations.length === 0) {
      console.log('✅ 중복 없음 - 제거할 필요 없음');
      return true;
    }

    // Plan deletion
    const filesToDelete = [];
    const filesToKeep = [];
    let failedCombinationsKept = 0;

    for (const [taskKey, files] of duplicatedCombinations) {
      const bestFile = this.selectBestFileForAnalysis(files);
      const otherFiles = files.filter(f => f.filename !== bestFile.filename);

      filesToKeep.push({
        taskKey,
        file: bestFile,
        totalFiles: files.length,
        failedCount: files.filter(f => !f.success).length
      });

      if (!bestFile.success) {
        failedCombinationsKept++;
      }

      for (const fileToDelete of otherFiles) {
        filesToDelete.push({
          filename: fileToDelete.filename,
          filePath: fileToDelete.filePath,
          taskKey,
          reason: `중복 제거 - ${bestFile.filename} 보존 (${bestFile.success ? '성공' : '실패'})`
        });
      }
    }

    // Handle corrupted files
    if (corruptedFiles.length > 0) {
      console.log(`   손상된 파일 삭제 예정: ${corruptedFiles.length}개`);
      for (const corruptedFile of corruptedFiles) {
        filesToDelete.push({
          filename: corruptedFile,
          filePath: path.join(this.resultsDir, corruptedFile),
          taskKey: 'CORRUPTED',
          reason: '손상된 JSON 파일'
        });
      }
    }

    // Show summary
    console.log(`\n📋 중복 제거 계획:`);
    console.log(`   보존할 파일: ${filesToKeep.length}개`);
    console.log(`   삭제할 파일: ${filesToDelete.length}개`);
    console.log(`   실패 결과 보존: ${failedCombinationsKept}개 (분석용)`);

    // Show examples
    console.log(`\n🔍 상위 10개 조합 (중복 제거):`);
    filesToKeep.slice(0, 10).forEach(item => {
      const [model, website, taskId] = item.taskKey.split('__');
      const status = item.file.success ? '✅' : '❌';
      const modelName = model.split('/')[1] || model;
      console.log(`   ${status} ${modelName} → ${website} → ${taskId} (${item.totalFiles}개 중 1개 보존, 실패 ${item.failedCount}개)`);
    });

    if (this.dryRun) {
      console.log(`\n🧪 DRY RUN - 실제 파일 삭제 안함`);
      console.log(`실제 실행하려면: dryRun = false로 설정`);

      // Save deletion plan
      const planPath = path.join('./benchmark_results', `analysis_dedup_plan_${Date.now()}.json`);
      const plan = {
        timestamp: new Date().toISOString(),
        strategy: 'keep_failed_for_analysis',
        totalFiles: filesToDelete.length + filesToKeep.length,
        filesToKeep: filesToKeep.length,
        filesToDelete: filesToDelete.length,
        failedKept: failedCombinationsKept,
        deletionList: filesToDelete,
        keepList: filesToKeep.map(k => ({
          taskKey: k.taskKey,
          filename: k.file.filename,
          success: k.file.success,
          errorType: k.file.errorType
        }))
      };

      await fs.writeFile(planPath, JSON.stringify(plan, null, 2));
      console.log(`📄 삭제 계획 저장: ${planPath}`);

      return true;
    }

    // Execute deletion
    console.log(`\n🗑️  파일 삭제 실행...`);
    let deletedCount = 0;
    let errors = 0;

    for (const item of filesToDelete) {
      try {
        await fs.unlink(item.filePath);
        deletedCount++;

        if (deletedCount % 50 === 0) {
          console.log(`   삭제 완료: ${deletedCount}/${filesToDelete.length}개...`);
        }
      } catch (error) {
        console.error(`❌ 삭제 실패 ${item.filename}: ${error.message}`);
        errors++;
      }
    }

    console.log(`\n✅ Analysis용 중복 제거 완료!`);
    console.log(`   삭제된 파일: ${deletedCount}개`);
    console.log(`   오류: ${errors}개`);
    console.log(`   보존된 파일: ${filesToKeep.length}개`);
    console.log(`   실패 결과 보존: ${failedCombinationsKept}개 (분석용)`);

    // Generate final report
    const reportPath = path.join('./benchmark_results', `analysis_dedup_report_${Date.now()}.json`);
    const report = {
      timestamp: new Date().toISOString(),
      operation: 'analysis_deduplication',
      strategy: 'prioritize_failed_for_error_analysis',
      filesDeletedCount: deletedCount,
      filesKeptCount: filesToKeep.length,
      errorsCount: errors,
      failedCombinationsKept: failedCombinationsKept,
      targetWebsites: this.targetWebsites
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 최종 보고서 저장: ${reportPath}`);

    return errors === 0;
  }
}

// Usage
const deduplicator = new AnalysisDataDeduplicator();

// Always run dry run first for safety
console.log('🧪 먼저 DRY RUN으로 분석...\n');
await deduplicator.deduplicateForAnalysis();

console.log('\n⚠️  실제 실행하려면:');
console.log('deduplicator.dryRun = false; await deduplicator.deduplicateForAnalysis();');

export { AnalysisDataDeduplicator };