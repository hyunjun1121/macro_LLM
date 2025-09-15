import OpenAI from 'openai';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

export class EnhancedMacroGenerator {
  constructor(apiKey, baseUrl) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseUrl
    });
  }

  async generateMacroCode(task, htmlPath, previousAttempts = [], model = 'openai/gpt-4o-mini') {
    console.log('      [INFO] Reading full HTML content for LLM analysis...');
    const htmlContent = await this.readFullHTML(htmlPath);

    const isRetryAttempt = previousAttempts.length > 0;
    const previousErrors = previousAttempts.map(attempt => ({
      attemptNumber: attempt.attemptNumber,
      error: attempt.error,
      macroCode: attempt.macroCode
    }));

    const prompt = this.buildPrompt(task, htmlContent, isRetryAttempt, previousErrors);

    console.log(`      [INFO] Calling LLM (${model}) to generate macro...`);
    const response = await this.openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Fixed temperature for reproducible benchmarks
    });

    const rawResponse = response.choices[0].message.content;
    return this.extractMacroCode(rawResponse);
  }

  buildPrompt(task, htmlContent, isRetryAttempt, previousErrors) {
    let prompt = `You are a web automation expert. Generate Playwright JavaScript code to perform the following task:

Task: ${task.description}

HTML Content:
${htmlContent}`;

    // Add retry-specific context
    if (isRetryAttempt) {
      prompt += `\n\nPrevious attempts failed with the following errors:`;
      previousErrors.forEach((error, index) => {
        prompt += `\n\nAttempt ${error.attemptNumber}: ${error.error}`;
        if (error.macroCode) {
          prompt += `\nCode: ${error.macroCode.substring(0, 200)}...`;
        }
      });
      prompt += `\n\nPlease analyze these errors and generate a different approach.`;
    }

    prompt += `\n\n## MACRO GENERATION INSTRUCTIONS

Generate a Playwright JavaScript macro following this EXACT format:

**MANDATORY REQUIREMENTS:**
1. **ALWAYS start with**: import path from 'path';
2. **Function signature must be**: export default async function(page, fileUrl, screenshotsDir)
3. **Use try-catch blocks** for error handling
4. **Return the exact object format** shown in the template below

**FUNCTIONALITY REQUIREMENTS:**
- Navigate to HTML file with await page.goto(fileUrl)
- Wait for elements before interacting (page.waitForSelector with timeout: 5000)
- Take screenshots using: await page.screenshot({ path: path.join(screenshotsDir, 'filename.png') })
- Use multiple selector strategies (ID, class, text content, xpath)
- Keep interactions simple and avoid complex waiting logic
- Do NOT wait for console data or use custom timeouts
- Extract meaningful data to verify task completion

**CRITICAL - NO DEVIATION FROM TEMPLATE STRUCTURE**

${isRetryAttempt ? '**IMPORTANT**: This is a retry - use DIFFERENT selectors and strategies from previous attempts!' : ''}

## OUTPUT FORMAT - FOLLOW EXACTLY

You MUST respond with ONLY the JavaScript code in the following format:

\`\`\`javascript
import path from 'path';

export default async function(page, fileUrl, screenshotsDir) {
  try {
    // Navigate to the HTML file
    await page.goto(fileUrl);
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    const screenshots = [];
    await page.screenshot({ path: path.join(screenshotsDir, 'step_1_initial.png') });
    screenshots.push(path.join(screenshotsDir, 'step_1_initial.png'));

    // Your automation logic here

    return {
      success: true,
      action: "Description of what was accomplished",
      extractedData: {},
      screenshots,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      action: "Failed to complete task",
      extractedData: {},
      screenshots: [],
      error: error.message
    };
  }
}
\`\`\`

**CRITICAL REQUIREMENTS:**
- Start with triple backticks and "javascript"
- Always include "import path from 'path';"
- Use the exact function signature shown above
- End with triple backticks
- NO explanation text before or after the code
- DO NOT handle page dialogs (alerts, confirms) - they are auto-handled
- DO NOT use page.on('dialog') or dialog.accept() in your code
- DO NOT create custom timeouts with setTimeout() or setInterval()
- DO NOT wait for console data or network responses
- Keep all waitForSelector timeouts under 5 seconds
- Use simple, direct interactions only

Generate ONLY the JavaScript code:`;

    return prompt;
  }

  async readFullHTML(htmlPath) {
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    const path = await import('path');
    const websiteDir = path.dirname(htmlPath);
    const $ = cheerio.load(htmlContent);

    // Extract only the essential parts for faster processing
    let fullContent = this.extractEssentialHTML($, htmlContent);

    try {
      // Find and include CSS files
      const cssFiles = [];
      $('link[rel="stylesheet"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('http')) {
          cssFiles.push(href);
        }
      });

      for (const cssFile of cssFiles) {
        try {
          const cssPath = path.join(websiteDir, cssFile);
          const cssContent = await fs.readFile(cssPath, 'utf-8');
          fullContent += `\n\n<!-- CSS file: ${cssFile} -->\n<style>\n${cssContent}\n</style>`;
        } catch (error) {
          // CSS file not found, continue
        }
      }

      // Find and include JS files
      const jsFiles = [];
      $('script[src]').each((i, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('http')) {
          jsFiles.push(src);
        }
      });

      for (const jsFile of jsFiles) {
        try {
          const jsPath = path.join(websiteDir, jsFile);
          const jsContent = await fs.readFile(jsPath, 'utf-8');
          fullContent += `\n\n<!-- JS file: ${jsFile} -->\n<script>\n${jsContent}\n</script>`;
        } catch (error) {
          // JS file not found, continue
        }
      }

    } catch (error) {
      console.warn('Warning: Could not load additional files:', error.message);
    }

    return fullContent;
  }

  extractMacroCode(rawResponse) {
    // Method 1: Standard JavaScript code blocks (most common)
    const jsCodeBlockMatch = rawResponse.match(/```(?:javascript|js)\s*([\s\S]*?)```/i);
    if (jsCodeBlockMatch && jsCodeBlockMatch[1].trim().includes('export default')) {
      return jsCodeBlockMatch[1].trim();
    }

    // Method 2: Any code block with valid JS structure
    const codeBlockMatch = rawResponse.match(/```\s*([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1].trim().includes('export default')) {
      return codeBlockMatch[1].trim();
    }

    // Method 3: Multiple code blocks - find the one with export default
    const allCodeBlocks = rawResponse.match(/```(?:javascript|js)?\s*([\s\S]*?)```/gi);
    if (allCodeBlocks) {
      for (const block of allCodeBlocks) {
        const cleaned = block.replace(/```(?:javascript|js)?/gi, '').trim();
        if (cleaned.includes('export default') && cleaned.includes('async function')) {
          return cleaned;
        }
      }
    }

    // Method 4: Direct function extraction (no code blocks)
    const directFunctionMatch = rawResponse.match(/import path[\s\S]*?export default async function[\s\S]*?(?=\n\n|$)/);
    if (directFunctionMatch) {
      return directFunctionMatch[0].trim();
    }

    // Method 5: Look for any export default async function
    const exportMatch = rawResponse.match(/export default async function[\s\S]*?(?=\n\n|\n```|$)/);
    if (exportMatch) {
      // Try to include import statement if it exists before the function
      const withImport = rawResponse.match(/import[^;]*path[^;]*;[\s\S]*?export default async function[\s\S]*?(?=\n\n|\n```|$)/);
      return withImport ? withImport[0].trim() : `import path from 'path';\n\n${exportMatch[0].trim()}`;
    }

    // Final fallback: clean up the response and try to make it executable
    console.warn('⚠️  Could not extract code blocks, trying to clean up response');

    // Remove markdown formatting
    let cleaned = rawResponse
      .replace(/```(?:javascript|js)?/gi, '')
      .replace(/^\s*#+\s.*$/gm, '') // Remove markdown headers
      .replace(/^\s*\*+\s.*$/gm, '') // Remove bullet points
      .replace(/^\s*-+\s.*$/gm, '') // Remove dashes
      .trim();

    // If it doesn't start with import, add it
    if (!cleaned.startsWith('import')) {
      cleaned = `import path from 'path';\n\n${cleaned}`;
    }

    return cleaned;
  }

  extractEssentialHTML($, originalContent) {
    // If content is small enough, return as-is
    if (originalContent.length < 10000) {
      return originalContent;
    }

    // Extract essential elements for automation
    const essentialSelectors = [
      'input', 'button', 'select', 'textarea', 'form',
      'a[href]', '[onclick]', '[data-testid]', '[role]',
      '.btn', '.button', '.form', '.search', '.menu', '.nav',
      '#search', '#login', '#signup', '#submit'
    ];

    let essentialHTML = '<!DOCTYPE html><html><head><title>Essential Elements</title></head><body>\n';

    // Add essential interactive elements
    essentialSelectors.forEach(selector => {
      $(selector).each((i, el) => {
        const $el = $(el);
        const tagName = el.tagName.toLowerCase();
        const id = $el.attr('id') ? ` id="${$el.attr('id')}"` : '';
        const className = $el.attr('class') ? ` class="${$el.attr('class')}"` : '';
        const placeholder = $el.attr('placeholder') ? ` placeholder="${$el.attr('placeholder')}"` : '';
        const href = $el.attr('href') ? ` href="${$el.attr('href')}"` : '';
        const type = $el.attr('type') ? ` type="${$el.attr('type')}"` : '';
        const value = $el.attr('value') ? ` value="${$el.attr('value')}"` : '';
        const textContent = $el.text().trim().substring(0, 100);

        essentialHTML += `<${tagName}${id}${className}${type}${placeholder}${href}${value}>${textContent}</${tagName}>\n`;
      });
    });

    essentialHTML += '</body></html>';

    console.log(`      [INFO] Compressed HTML: ${originalContent.length} → ${essentialHTML.length} chars`);
    return essentialHTML;
  }
}