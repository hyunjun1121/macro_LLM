import { DuplicateRemover } from './remove_duplicates.js';

console.log('🔧 Modified Duplicate Removal: Keep Failed Results, Remove Successful Duplicates');
console.log('='.repeat(80));

async function main() {
  const remover = new DuplicateRemover();

  console.log('📋 New Strategy:');
  console.log('  1. ❌ KEEP failed results (valuable for debugging)');
  console.log('  2. ✅ REMOVE successful duplicates (less critical)');
  console.log('  3. 📦 Create backup before any changes');
  console.log('');

  try {
    // Always start with dry run to see what would happen
    console.log('🧪 Running DRY RUN first to analyze impact...\n');

    const success = await remover.removeDuplicates();

    if (success) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ DRY RUN completed successfully!');
      console.log('');
      console.log('To execute the actual deletion:');
      console.log('1. Review the plan above carefully');
      console.log('2. Run: remover.dryRun = false; await remover.removeDuplicates();');
      console.log('');
      console.log('Or use the interactive script:');
      console.log('node -e "');
      console.log('import(\\"./run_dedup_keep_failures.js\\").then(m => {');
      console.log('  const remover = new m.DuplicateRemover();');
      console.log('  remover.dryRun = false;');
      console.log('  return remover.removeDuplicates();');
      console.log('});"');
    }

  } catch (error) {
    console.error('❌ Error during deduplication:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { DuplicateRemover };