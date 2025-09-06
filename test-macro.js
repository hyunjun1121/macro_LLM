import { MacroExecutor } from './src/macroExecutor.js';
import { ReportGenerator } from './src/reportGenerator.js';
import fs from 'fs/promises';
import path from 'path';

// Mock macro code for YouTube search
const mockMacroCode = `
// Navigate to page
await page.goto(fileUrl);
await page.waitForLoadState('domcontentloaded');

// Take initial screenshot
await page.screenshot({ path: path.join(screenshotsDir, '01-initial.png'), fullPage: true });

// Find search input
const searchInput = await page.locator('input[placeholder*="Search"], .search-input');
await searchInput.waitFor({ timeout: 5000 });

// Click on search input
await searchInput.click();
await page.screenshot({ path: path.join(screenshotsDir, '02-search-clicked.png'), fullPage: true });

// Type search query
await searchInput.fill('test video');
await page.screenshot({ path: path.join(screenshotsDir, '03-text-entered.png'), fullPage: true });

// Look for search button and click
const searchBtn = await page.locator('button.search-btn, .search-btn');
if (await searchBtn.isVisible()) {
    await searchBtn.click();
    await page.screenshot({ path: path.join(screenshotsDir, '04-search-clicked.png'), fullPage: true });
}

// Extract results
const searchValue = await searchInput.inputValue();
const currentUrl = page.url();

return {
    action: 'YouTube search completed',
    searchQuery: searchValue,
    currentUrl: currentUrl,
    timestamp: new Date().toISOString(),
    elementsFound: {
        searchInput: await searchInput.isVisible(),
        searchButton: await searchBtn.isVisible()
    }
};
`;

async function testMacroSystem() {
    console.log('='.repeat(60));
    console.log('🧪 Testing Web Agent System');
    console.log('='.repeat(60));
    
    const executor = new MacroExecutor();
    const reporter = new ReportGenerator();
    
    const instruction = "YouTube 검색창에 'test video'를 입력";
    const htmlPath = "./youtube/index.html";
    
    try {
        console.log('\\n1️⃣ Executing mock macro...');
        const executionResult = await executor.executeMacro(mockMacroCode, htmlPath);
        
        if (executionResult.success) {
            console.log('   ✅ Macro executed successfully!');
            console.log('   📊 Result:', JSON.stringify(executionResult.result, null, 2));
            console.log('   📸 Screenshots saved to:', executionResult.screenshotsDir);
            console.log('   🎬 Video saved to:', executionResult.videoPath);
            
            // Extract detailed data
            console.log('\\n📈 Detailed execution data:');
            console.log('   - Execution steps:', executionResult.executionLog.length);
            console.log('   - Elements interacted with:', Object.keys(executionResult.result.elementsFound || {}).length);
            console.log('   - Screenshots taken:', 4);
            console.log('   - Search query entered:', executionResult.result.searchQuery);
            
        } else {
            console.log('   ❌ Macro execution failed!');
            console.log('   Error:', executionResult.error);
        }
        
        console.log('\\n2️⃣ Generating execution report...');
        const reportPath = await reporter.generateHTMLReport(
            executionResult,
            instruction,
            mockMacroCode
        );
        console.log('   ✅ Report saved to:', reportPath);
        
        console.log('\\n✨ Test completed successfully!');
        console.log('📂 Check these folders for results:');
        console.log('   - screenshots/: Step-by-step screenshots');
        console.log('   - recordings/: Video of execution');
        console.log('   - reports/: HTML report with all details');
        
        return {
            success: true,
            executionResult,
            reportPath
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

testMacroSystem()
    .then(result => {
        if (result.success) {
            console.log('\\n🎉 All systems working correctly!');
        } else {
            console.log('\\n💥 System test failed:', result.error);
        }
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });