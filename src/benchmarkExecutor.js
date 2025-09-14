import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

export class BenchmarkExecutor {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.executionLog = [];
    this.screenshots = [];
  }

  async initialize() {
    this.browser = await chromium.launch({
      headless: false, // Set to true for faster execution
      slowMo: 100     // Slow down for better observation
    });

    this.context = await this.browser.newContext({
      recordVideo: {
        dir: './recordings',
        size: { width: 1280, height: 720 }
      }
    });

    this.page = await this.context.newPage();

    // Set up comprehensive logging
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Console messages
    this.page.on('console', msg => {
      this.executionLog.push({
        type: 'console',
        level: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
        location: msg.location()
      });
    });

    // Page errors
    this.page.on('pageerror', error => {
      this.executionLog.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Network requests (for debugging API calls, form submissions)
    this.page.on('request', request => {
      if (request.method() !== 'GET' || request.url().includes('api') || request.resourceType() === 'xhr') {
        this.executionLog.push({
          type: 'network_request',
          method: request.method(),
          url: request.url(),
          resourceType: request.resourceType(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Network responses
    this.page.on('response', response => {
      if (response.request().method() !== 'GET' || response.url().includes('api')) {
        this.executionLog.push({
          type: 'network_response',
          status: response.status(),
          url: response.url(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Dialog boxes (alerts, confirms)
    this.page.on('dialog', async dialog => {
      this.executionLog.push({
        type: 'dialog',
        dialogType: dialog.type(),
        message: dialog.message(),
        timestamp: new Date().toISOString()
      });
      await dialog.accept(); // Auto-accept dialogs
    });
  }

  async executeMacro(macroCode, htmlPath, task, attemptNumber) {
    this.executionLog = [];
    this.screenshots = [];

    try {
      await this.initialize();

      const screenshotsDir = path.join(
        process.cwd(),
        'benchmark_results',
        'screenshots',
        `${task.id}_attempt_${attemptNumber}_${Date.now()}`
      );

      await fs.mkdir(screenshotsDir, { recursive: true });

      const fileUrl = `file:///${path.resolve(htmlPath).replace(/\\\\/g, '/')}`;

      this.executionLog.push({
        type: 'execution_start',
        task: {
          id: task.id,
          description: task.description,
          objective: task.objective
        },
        htmlPath,
        fileUrl,
        attemptNumber,
        timestamp: new Date().toISOString()
      });

      // Create macro function with proper error handling
      const wrappedMacroCode = this.wrapMacroCode(macroCode);

      // Save the macro code for debugging
      const macroCodePath = path.join(screenshotsDir, 'macro_code.js');
      await fs.writeFile(macroCodePath, wrappedMacroCode);

      // Create temp file and execute
      const tempMacroPath = path.join(process.cwd(), 'generated', `benchmark_macro_${Date.now()}.mjs`);
      await fs.mkdir(path.dirname(tempMacroPath), { recursive: true });
      await fs.writeFile(tempMacroPath, wrappedMacroCode);

      const macroModule = await import(`file://${tempMacroPath}`);
      const macroFunction = macroModule.default || macroModule;

      // Execute macro with timeout
      const executionPromise = macroFunction(this.page, fileUrl, screenshotsDir);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Macro execution timeout (30s)')), 30000)
      );

      const result = await Promise.race([executionPromise, timeoutPromise]);

      // Take final screenshot
      const finalScreenshot = path.join(screenshotsDir, 'final_state.png');
      await this.page.screenshot({
        path: finalScreenshot,
        fullPage: true
      });
      this.screenshots.push(finalScreenshot);

      this.executionLog.push({
        type: 'execution_success',
        result,
        timestamp: new Date().toISOString()
      });

      // Clean up temp file
      try {
        await fs.unlink(tempMacroPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      return {
        success: true,
        result,
        executionLog: this.executionLog,
        screenshots: this.screenshots,
        screenshotsDir,
        videoPath: await this.page.video()?.path(),
        macroCodePath
      };

    } catch (error) {
      // Take error screenshot
      try {
        const errorScreenshot = path.join(
          process.cwd(),
          'benchmark_results',
          'screenshots',
          `error_${task.id}_${attemptNumber}_${Date.now()}.png`
        );
        await fs.mkdir(path.dirname(errorScreenshot), { recursive: true });
        await this.page?.screenshot({ path: errorScreenshot, fullPage: true });
        this.screenshots.push(errorScreenshot);
      } catch (screenshotError) {
        // Ignore screenshot errors
      }

      this.executionLog.push({
        type: 'execution_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: error.message,
        executionLog: this.executionLog,
        screenshots: this.screenshots,
        screenshotsDir: null,
        videoPath: await this.page?.video()?.path()
      };

    } finally {
      await this.cleanup();
    }
  }

  wrapMacroCode(macroCode) {
    // Remove any duplicate imports from LLM code and use it directly
    let cleanedCode = macroCode.trim();

    // If LLM code doesn't start with import, add necessary imports
    if (!cleanedCode.includes('import path')) {
      cleanedCode = `import path from 'path';\n\n${cleanedCode}`;
    }

    // If LLM code doesn't have export default, add it
    if (!cleanedCode.includes('export default')) {
      // Extract the function part and add export default
      const functionMatch = cleanedCode.match(/async function[^{]*\{[\s\S]*\}$/);
      if (functionMatch) {
        cleanedCode = cleanedCode.replace(/async function/, 'export default async function');
      }
    }

    return cleanedCode;
  }

  async cleanup() {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
    } catch (error) {
      console.error('Cleanup error:', error);
    }

    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async takeScreenshot(filename, fullPage = true) {
    if (!this.page) return null;

    try {
      const screenshotPath = path.join(this.screenshotsDir, filename);
      await this.page.screenshot({ path: screenshotPath, fullPage });
      this.screenshots.push(screenshotPath);
      return screenshotPath;
    } catch (error) {
      console.error('Screenshot error:', error);
      return null;
    }
  }

  getExecutionSummary() {
    return {
      totalLogs: this.executionLog.length,
      errorCount: this.executionLog.filter(log => log.type.includes('error')).length,
      consoleMessages: this.executionLog.filter(log => log.type === 'console').length,
      networkRequests: this.executionLog.filter(log => log.type === 'network_request').length,
      screenshots: this.screenshots.length
    };
  }
}