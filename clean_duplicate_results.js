import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DuplicateResultsCleaner {
    constructor() {
        this.resultsDir = path.join(__dirname, 'benchmark_results', 'data');
        this.duplicates = new Map(); // key -> array of duplicate results
        this.kept = new Map(); // key -> selected result to keep
        this.removed = [];
        this.stats = {
            totalFiles: 0,
            duplicateGroups: 0,
            filesRemoved: 0,
            filesKept: 0
        };
    }

    async cleanDuplicates() {
        console.log('🧹 Starting duplicate results cleaning...');
        console.log('📋 Strategy: Keep WORST performing results (more conservative)');

        await this.scanAllResults();
        await this.identifyDuplicates();
        await this.selectWorstResults();
        await this.removeUnwantedFiles();
        await this.generateCleanupReport();

        console.log('✅ Duplicate cleaning completed!');
    }

    async scanAllResults() {
        console.log('\n📂 Scanning all result files...');

        const files = await fs.readdir(this.resultsDir);
        const resultFiles = files.filter(f => f.startsWith('result_') && f.endsWith('.json'));

        this.stats.totalFiles = resultFiles.length;
        console.log(`Found ${resultFiles.length} result files`);

        for (const filename of resultFiles) {
            try {
                const filePath = path.join(this.resultsDir, filename);
                const content = await fs.readFile(filePath, 'utf8');
                const data = JSON.parse(content);

                // Extract key components for duplicate detection
                const key = this.generateDuplicateKey(data);
                if (key) {
                    if (!this.duplicates.has(key)) {
                        this.duplicates.set(key, []);
                    }
                    this.duplicates.get(key).push({
                        filename,
                        filePath,
                        data,
                        key
                    });
                }
            } catch (error) {
                console.warn(`⚠️  Failed to process ${filename}: ${error.message}`);
            }
        }
    }

    generateDuplicateKey(data) {
        // Create key from model + website + task combination
        const model = this.extractModel(data);
        const website = data.website || this.extractWebsiteFromFilename(data);
        const taskId = data.task?.id || this.extractTaskFromFilename(data);

        if (model && website && taskId) {
            return `${model}__${website}__${taskId}`;
        }
        return null;
    }

    extractModel(data) {
        // Try multiple ways to extract model information
        if (data.attempts && data.attempts.length > 0) {
            const attempt = data.attempts[0];
            if (attempt.model) return attempt.model;
            if (attempt.macroGeneration?.model) return attempt.macroGeneration.model;
        }

        // Check if model is in the filename or id
        if (data.id && data.id.includes('openai')) return 'openai/gpt-4o-mini';
        if (data.id && data.id.includes('deepseek')) return 'deepseek-ai/DeepSeek-V3.1-thinking-on';
        if (data.id && data.id.includes('gemini')) return 'google/gemini-2.5-pro-thinking-on';
        if (data.id && data.id.includes('gpt-4.1')) return 'openai/gpt-4.1';

        return null;
    }

    extractWebsiteFromFilename(data) {
        if (data.website) return data.website;

        const filename = data.id || '';
        if (filename.includes('Airbnb')) return 'Airbnb';
        if (filename.includes('Amazon')) return 'Amazon';
        if (filename.includes('TikTok')) return 'TikTok';
        if (filename.includes('Threads')) return 'Threads';
        if (filename.includes('youtube')) return 'youtube';
        if (filename.includes('when2meet')) return 'when2meet';
        if (filename.includes('reddit')) return 'reddit';
        if (filename.includes('instagram')) return 'instagram';
        if (filename.includes('facebook')) return 'facebook';
        if (filename.includes('discord')) return 'discord';

        return null;
    }

    extractTaskFromFilename(data) {
        if (data.task?.id) return data.task.id;

        const filename = data.id || '';

        // Common task ID patterns
        const taskPatterns = [
            /TASK_(\d+)/,
            /T(\d+)/,
            /G(\d+)/,
            /YT_BEN_(\d+)/,
            /YT_MAL_(\d+)/,
            /_(\d+)_/
        ];

        for (const pattern of taskPatterns) {
            const match = filename.match(pattern);
            if (match) {
                return match[0].replace(/^_|_$/g, ''); // Remove leading/trailing underscores
            }
        }

        return null;
    }

    async identifyDuplicates() {
        console.log('\n🔍 Identifying duplicate groups...');

        const duplicateGroups = Array.from(this.duplicates.entries()).filter(([key, results]) => results.length > 1);
        this.stats.duplicateGroups = duplicateGroups.length;

        console.log(`Found ${duplicateGroups.length} groups with duplicates:`);

        for (const [key, results] of duplicateGroups) {
            console.log(`  📁 ${key}: ${results.length} duplicates`);

            if (results.length <= 5) {
                // Show details for small groups
                for (const result of results) {
                    const success = result.data.success ? '✅' : '❌';
                    const attempts = result.data.attempts?.length || 0;
                    console.log(`     ${success} ${result.filename} (${attempts} attempts)`);
                }
            } else {
                console.log(`     (Too many to show individually)`);
            }
        }
    }

    async selectWorstResults() {
        console.log('\n🎯 Selecting WORST performing results to keep...');

        for (const [key, results] of this.duplicates.entries()) {
            if (results.length <= 1) {
                // No duplicates, keep the only result
                this.kept.set(key, results[0]);
                continue;
            }

            // Select the WORST performing result
            const worstResult = this.selectWorstPerformingResult(results);
            this.kept.set(key, worstResult);

            // Mark others for removal
            for (const result of results) {
                if (result.filename !== worstResult.filename) {
                    this.removed.push(result);
                }
            }

            console.log(`  📉 ${key}: Keeping WORST result ${worstResult.filename}`);
        }

        this.stats.filesKept = this.kept.size;
        this.stats.filesRemoved = this.removed.length;
    }

    selectWorstPerformingResult(results) {
        return results.reduce((worst, current) => {
            // Priority 1: Keep failed results over successful ones
            if (!current.data.success && worst.data.success) {
                return current;
            }
            if (worst.data.success && !current.data.success) {
                return worst;
            }

            // Priority 2: Keep result with fewer successful attempts
            const currentSuccessfulAttempts = this.countSuccessfulAttempts(current.data);
            const worstSuccessfulAttempts = this.countSuccessfulAttempts(worst.data);

            if (currentSuccessfulAttempts < worstSuccessfulAttempts) {
                return current;
            }
            if (worstSuccessfulAttempts < currentSuccessfulAttempts) {
                return worst;
            }

            // Priority 3: Keep result with shorter execution time (might indicate early failure)
            const currentTime = current.data.totalExecutionTime || current.data.executionTime || 0;
            const worstTime = worst.data.totalExecutionTime || worst.data.executionTime || 0;

            if (currentTime < worstTime) {
                return current;
            }

            // Priority 4: Keep older result (might be from earlier, less optimized run)
            const currentTimestamp = new Date(current.data.timestamp || 0);
            const worstTimestamp = new Date(worst.data.timestamp || 0);

            return currentTimestamp < worstTimestamp ? current : worst;
        });
    }

    countSuccessfulAttempts(data) {
        if (!data.attempts || !Array.isArray(data.attempts)) {
            return data.success ? 1 : 0;
        }

        return data.attempts.filter(attempt => attempt.success).length;
    }

    async removeUnwantedFiles() {
        console.log('\n🗑️  Removing unwanted duplicate files...');

        let removeCount = 0;
        for (const result of this.removed) {
            try {
                await fs.unlink(result.filePath);
                removeCount++;
                if (removeCount % 100 === 0) {
                    console.log(`   Removed ${removeCount}/${this.removed.length} files...`);
                }
            } catch (error) {
                console.warn(`⚠️  Failed to remove ${result.filename}: ${error.message}`);
            }
        }

        console.log(`✅ Removed ${removeCount} duplicate files`);
    }

    async generateCleanupReport() {
        const report = {
            cleanupSummary: {
                totalFilesScanned: this.stats.totalFiles,
                duplicateGroupsFound: this.stats.duplicateGroups,
                filesRemoved: this.stats.filesRemoved,
                filesKept: this.stats.filesKept,
                strategy: "Keep worst performing results (conservative approach)",
                timestamp: new Date().toISOString()
            },
            duplicateGroups: Array.from(this.duplicates.entries()).map(([key, results]) => ({
                key,
                totalDuplicates: results.length,
                keptFile: results.length > 1 ? this.kept.get(key)?.filename : results[0].filename,
                removedFiles: results.length > 1 ? results
                    .filter(r => r.filename !== this.kept.get(key)?.filename)
                    .map(r => r.filename) : []
            })),
            selectionCriteria: [
                "1. Failed results preferred over successful results",
                "2. Results with fewer successful attempts",
                "3. Results with shorter execution time (early failures)",
                "4. Older timestamps (earlier, less optimized runs)"
            ]
        };

        const reportPath = path.join(this.resultsDir, `duplicate_cleanup_report_${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        console.log('\n📊 CLEANUP SUMMARY:');
        console.log(`📁 Total files scanned: ${this.stats.totalFiles}`);
        console.log(`🔄 Duplicate groups found: ${this.stats.duplicateGroups}`);
        console.log(`🗑️  Files removed: ${this.stats.filesRemoved}`);
        console.log(`💾 Files kept: ${this.stats.filesKept}`);
        console.log(`📄 Cleanup report: ${reportPath}`);

        console.log('\n🎯 Selection Strategy Applied:');
        console.log('   ✅ Kept WORST performing results (conservative)');
        console.log('   ✅ Prioritized failed results over successful ones');
        console.log('   ✅ Ensured no bias toward better performance');
    }
}

// 메인 실행
async function main() {
    try {
        console.log('🧹 Duplicate Results Cleaner');
        console.log('============================');
        console.log('Strategy: Conservative - Keep worst performing duplicates');

        const cleaner = new DuplicateResultsCleaner();
        await cleaner.cleanDuplicates();

        console.log('\n✨ All duplicates have been cleaned successfully!');
        console.log('💡 Now you can run analysis on the cleaned dataset');

    } catch (error) {
        console.error('💥 Fatal error in cleaner:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default DuplicateResultsCleaner;