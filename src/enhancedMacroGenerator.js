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
- Wait for elements before interacting (page.waitForSelector, page.waitForLoadState)
- Take screenshots using: await page.screenshot({ path: path.join(screenshotsDir, 'filename.png') })
- Use multiple selector strategies (ID, class, text content, xpath)
- Handle dynamic content loading
- Extract meaningful data to verify task completion

**CRITICAL - NO DEVIATION FROM TEMPLATE STRUCTURE**

${isRetryAttempt ? '**IMPORTANT**: This is a retry - use DIFFERENT selectors and strategies from previous attempts!' : ''}

## OUTPUT FORMAT
Your response must contain the macro code between these markers:

\`\`\`MACRO_CODE_START
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
\`\`\`MACRO_CODE_END

**CRITICAL**: Always start with "import path from 'path';" and use the exact function signature shown above.

Generate the macro code now:`;

    return prompt;
  }

  async readFullHTML(htmlPath) {
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    const path = await import('path');
    const websiteDir = path.dirname(htmlPath);
    const $ = cheerio.load(htmlContent);

    let fullContent = htmlContent;

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
    // Method 1: Try to extract code between the specified markers
    const markerStart = '```MACRO_CODE_START';
    const markerEnd = '```MACRO_CODE_END';

    const startIndex = rawResponse.indexOf(markerStart);
    const endIndex = rawResponse.indexOf(markerEnd);

    if (startIndex !== -1 && endIndex !== -1) {
      return rawResponse.substring(startIndex + markerStart.length, endIndex).trim();
    }

    // Method 2: Try standard code blocks with improved regex
    const codeBlockPatterns = [
      /```(?:javascript|js)\s*([\s\S]*?)```/gi,
      /```\s*([\s\S]*?)```/gi,
      /`{3,}\s*(?:javascript|js)?\s*([\s\S]*?)`{3,}/gi
    ];

    for (const pattern of codeBlockPatterns) {
      const matches = rawResponse.match(pattern);
      if (matches && matches.length > 0) {
        // Get the largest code block that looks like valid JS
        const validBlocks = matches.filter(block => {
          const cleaned = block.replace(/```(?:javascript|js)?/gi, '').trim();
          return cleaned.includes('export default') || cleaned.includes('async function') || cleaned.includes('import');
        });

        if (validBlocks.length > 0) {
          const largestBlock = validBlocks.reduce((prev, current) =>
            current.length > prev.length ? current : prev
          );
          return largestBlock.replace(/```(?:javascript|js)?/gi, '').trim();
        }
      }
    }

    // Method 3: Look for function declarations directly
    const functionMatch = rawResponse.match(/export default async function[\s\S]*?(?=\n\n|\n```|$)/);
    if (functionMatch) {
      return functionMatch[0].trim();
    }

    // Method 4: Look for import statements and extract from there
    const importMatch = rawResponse.match(/import[\s\S]*?export default async function[\s\S]*?(?=\n\n|\n```|$)/);
    if (importMatch) {
      return importMatch[0].trim();
    }

    // Final fallback: return the whole response if no code blocks found
    console.warn('⚠️  Could not extract code blocks, using full response');
    return rawResponse;
  }
}