import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

export class MacroExecutor {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.executionLog = [];
  }

  async initialize() {
    this.browser = await chromium.launch({
      headless: false,
      slowMo: 500
    });
    this.context = await this.browser.newContext({
      recordVideo: {
        dir: './recordings'
      }
    });
    this.page = await this.context.newPage();

    this.page.on('console', msg => {
      this.executionLog.push({
        type: 'console',
        level: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });

    this.page.on('pageerror', error => {
      this.executionLog.push({
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }

  async executeMacro(macroCode, htmlPath) {
    let tempMacroPath = null;
    try {
      await this.initialize();
      
      const screenshotsDir = path.join(process.cwd(), 'screenshots', Date.now().toString());
      await fs.mkdir(screenshotsDir, { recursive: true });

      const fileUrl = `file:///${path.resolve(htmlPath).replace(/\\/g, '/')}`;
      
      this.executionLog.push({
        type: 'start',
        htmlPath,
        fileUrl,
        timestamp: new Date().toISOString()
      });

      // Save code to temp file and import it
      tempMacroPath = path.join(process.cwd(), 'generated', `temp_macro_${Date.now()}.mjs`);
      await fs.writeFile(tempMacroPath, macroCode);
      
      const macroModule = await import(`file://${tempMacroPath}`);
      const macroFunction = macroModule.default || macroModule;
      
      const result = await macroFunction(this.page, fileUrl, screenshotsDir);

      this.executionLog.push({
        type: 'complete',
        result,
        timestamp: new Date().toISOString()
      });

      await this.page.screenshot({ 
        path: path.join(screenshotsDir, 'final.png'),
        fullPage: true
      });

      return {
        success: true,
        result,
        executionLog: this.executionLog,
        screenshotsDir,
        videoPath: await this.page.video()?.path()
      };

    } catch (error) {
      this.executionLog.push({
        type: 'error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: error.message,
        executionLog: this.executionLog
      };
    } finally {
      // Clean up temp file
      try {
        if (tempMacroPath) {
          await fs.unlink(tempMacroPath);
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      await this.cleanup();
    }
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}