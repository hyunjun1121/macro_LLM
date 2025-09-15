import fs from 'fs/promises';
import path from 'path';

class DuplicateRemover {
  constructor() {
    this.resultsDir = 'benchmark_results/data';
    this.backupDir = 'benchmark_results/backup_before_dedup';
    this.dryRun = true; // Safety flag - set to false to actually delete files
  }

  async createBackup() {
    console.log('📦 Creating backup before deduplication...');

    try {
      await fs.mkdir(this.backupDir, { recursive: true });

      const files = await fs.readdir(this.resultsDir);
      const resultFiles = files.filter(file =>
        file.startsWith('result_') && file.endsWith('.json')
      );

      let backedUp = 0;
      for (const filename of resultFiles) {
        const sourcePath = path.join(this.resultsDir, filename);
        const backupPath = path.join(this.backupDir, filename);

        try {
          const content = await fs.readFile(sourcePath, 'utf-8');
          await fs.writeFile(backupPath, content);
          backedUp++;
        } catch (error) {
          console.warn(`⚠️  Failed to backup ${filename}: ${error.message}`);
        }
      }

      console.log(`✅ Backup completed: ${backedUp} files backed up to ${this.backupDir}`);
      return true;
    } catch (error) {
      console.error(`❌ Backup failed: ${error.message}`);
      return false;
    }
  }

  async analyzeDuplicates() {
    console.log('🔍 Analyzing duplicate result files...');

    const files = await fs.readdir(this.resultsDir);
    const resultFiles = files.filter(file =>
      file.startsWith('result_') && file.endsWith('.json')
    );

    console.log(`📄 Found ${resultFiles.length} result files to analyze`);

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
          size: content.length
        };

        combinations.get(taskKey).push(fileInfo);

      } catch (error) {
        console.warn(`⚠️  Corrupted file ${filename}: ${error.message}`);
        corruptedFiles.push(filename);
      }
    }

    return { combinations, corruptedFiles };
  }

  selectBestFile(files) {
    // STRATEGY: Keep failed results for analysis, remove successful duplicates
    // Priority order for file selection:
    // 1. ALWAYS prioritize FAILED results (success: false) - these are valuable for debugging
    // 2. If only successful results exist, keep the best successful one
    // 3. Tie-breaking: Most recent timestamp → Largest file size → Highest attempt number

    const successfulFiles = files.filter(f => f.success === true);
    const failedFiles = files.filter(f => f.success === false || f.success === undefined);

    console.log(`    📊 Selecting from ${files.length} files: ${failedFiles.length} failed, ${successfulFiles.length} successful`);

    // PRIORITY 1: Always keep failed results if any exist
    if (failedFiles.length > 0) {
      const selectedFailed = failedFiles.sort((a, b) => {
        // Most recent first
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;

        // Larger file (more detailed logs)
        if (b.size !== a.size) return b.size - a.size;

        // Higher attempt number (final retry)
        return (b.attempt || 1) - (a.attempt || 1);
      })[0];

      console.log(`    ❌ Selected FAILED result: ${selectedFailed.filename} (attempt ${selectedFailed.attempt || 1})`);
      return selectedFailed;
    }

    // PRIORITY 2: If only successful files exist, keep the best one
    if (successfulFiles.length > 0) {
      const selectedSuccessful = successfulFiles.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;

        if (b.size !== a.size) return b.size - a.size;
        return (b.attempt || 1) - (a.attempt || 1);
      })[0];

      console.log(`    ✅ Selected SUCCESSFUL result: ${selectedSuccessful.filename} (no failures available)`);
      return selectedSuccessful;
    }

    // Fallback (should never happen)
    console.log(`    ⚠️  Fallback selection: ${files[0].filename}`);
    return files[0];
  }

  async removeDuplicates() {
    console.log('🚀 Starting duplicate removal process...');
    console.log(`⚠️  DRY RUN MODE: ${this.dryRun ? 'ENABLED' : 'DISABLED'}`);

    // Create backup first
    const backupSuccess = await this.createBackup();
    if (!backupSuccess) {
      console.error('❌ Cannot proceed without successful backup');
      return false;
    }

    // Analyze duplicates
    const { combinations, corruptedFiles } = await this.analyzeDuplicates();

    console.log(`\n📊 Analysis Results:`);
    console.log(`   Total unique combinations: ${combinations.size}`);
    console.log(`   Corrupted files found: ${corruptedFiles.length}`);

    const duplicatedCombinations = Array.from(combinations.entries())
      .filter(([key, files]) => files.length > 1);

    console.log(`   Combinations with duplicates: ${duplicatedCombinations.length}`);

    if (duplicatedCombinations.length === 0) {
      console.log('✅ No duplicates found - nothing to remove');
      return true;
    }

    // Plan deletion
    const filesToDelete = [];
    const filesToKeep = [];
    let successfulCombinationsKept = 0;

    for (const [taskKey, files] of duplicatedCombinations) {
      const bestFile = this.selectBestFile(files);
      const otherFiles = files.filter(f => f.filename !== bestFile.filename);

      filesToKeep.push({
        taskKey,
        file: bestFile,
        totalFiles: files.length,
        successCount: files.filter(f => f.success).length
      });

      if (bestFile.success) {
        successfulCombinationsKept++;
      }

      for (const fileToDelete of otherFiles) {
        filesToDelete.push({
          filename: fileToDelete.filename,
          filePath: fileToDelete.filePath,
          taskKey,
          reason: `Duplicate - keeping ${bestFile.filename} (${bestFile.success ? 'successful' : 'failed'})`
        });
      }
    }

    // Show summary
    console.log(`\n📋 Deduplication Plan:`);
    console.log(`   Files to keep: ${filesToKeep.length}`);
    console.log(`   Files to delete: ${filesToDelete.length}`);
    console.log(`   Successful combinations kept: ${successfulCombinationsKept}`);

    if (corruptedFiles.length > 0) {
      console.log(`   Corrupted files to delete: ${corruptedFiles.length}`);
      for (const corruptedFile of corruptedFiles) {
        filesToDelete.push({
          filename: corruptedFile,
          filePath: path.join(this.resultsDir, corruptedFile),
          taskKey: 'CORRUPTED',
          reason: 'Corrupted JSON file'
        });
      }
    }

    // Show some examples
    console.log(`\n🔍 Top 10 combinations being deduplicated:`);
    filesToKeep.slice(0, 10).forEach(item => {
      const [model, website, taskId] = item.taskKey.split('__');
      const status = item.file.success ? '✅' : '❌';
      console.log(`   ${status} ${model} → ${website} → ${taskId} (keeping 1/${item.totalFiles}, ${item.successCount} successful)`);
    });

    if (this.dryRun) {
      console.log(`\n🧪 DRY RUN - No files were actually deleted`);
      console.log(`To execute the deletion, set dryRun = false in the code`);

      // Save deletion plan to file
      const planPath = path.join('benchmark_results', `deduplication_plan_${Date.now()}.json`);
      const plan = {
        timestamp: new Date().toISOString(),
        totalFiles: filesToDelete.length + filesToKeep.length,
        filesToKeep: filesToKeep.length,
        filesToDelete: filesToDelete.length,
        successfulKept: successfulCombinationsKept,
        deletionList: filesToDelete,
        keepList: filesToKeep.map(k => ({ taskKey: k.taskKey, filename: k.file.filename }))
      };

      await fs.writeFile(planPath, JSON.stringify(plan, null, 2));
      console.log(`📄 Deletion plan saved to: ${planPath}`);

      return true;
    }

    // Execute deletion
    console.log(`\n🗑️  Executing file deletion...`);
    let deletedCount = 0;
    let errors = 0;

    for (const item of filesToDelete) {
      try {
        await fs.unlink(item.filePath);
        deletedCount++;

        if (deletedCount % 50 === 0) {
          console.log(`   Deleted ${deletedCount}/${filesToDelete.length} files...`);
        }
      } catch (error) {
        console.error(`❌ Failed to delete ${item.filename}: ${error.message}`);
        errors++;
      }
    }

    console.log(`\n✅ Deduplication completed!`);
    console.log(`   Files deleted: ${deletedCount}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Files kept: ${filesToKeep.length}`);
    console.log(`   Backup location: ${this.backupDir}`);

    // Generate final report
    const reportPath = path.join('benchmark_results', `deduplication_report_${Date.now()}.json`);
    const report = {
      timestamp: new Date().toISOString(),
      operation: 'deduplication',
      filesDeletedCount: deletedCount,
      filesKeptCount: filesToKeep.length,
      errorsCount: errors,
      successfulCombinationsKept: successfulCombinationsKept,
      backupLocation: this.backupDir
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Final report saved to: ${reportPath}`);

    return errors === 0;
  }

  // Safe wrapper with confirmation
  async safeRemoveDuplicates(confirmationText) {
    if (confirmationText !== 'CONFIRM_DELETE_DUPLICATES') {
      console.error('❌ Invalid confirmation. Use: await remover.safeRemoveDuplicates("CONFIRM_DELETE_DUPLICATES")');
      return false;
    }

    console.log('⚠️  WARNING: This will permanently delete duplicate files!');
    console.log('⚠️  A backup will be created first, but please ensure you have external backups too.');

    // Force dry run first
    this.dryRun = true;
    console.log('\n🧪 Running dry run first...');
    await this.removeDuplicates();

    console.log('\n❓ Review the dry run results above.');
    console.log('To proceed with actual deletion, call:');
    console.log('remover.dryRun = false; await remover.removeDuplicates();');

    return true;
  }
}

// Example usage (commented out for safety):
/*
const remover = new DuplicateRemover();

// Step 1: Always run dry run first
await remover.removeDuplicates();

// Step 2: Review the plan, then execute if satisfied
// remover.dryRun = false;
// await remover.removeDuplicates();

// Alternative: Use safe wrapper
// await remover.safeRemoveDuplicates("CONFIRM_DELETE_DUPLICATES");
*/

export { DuplicateRemover };