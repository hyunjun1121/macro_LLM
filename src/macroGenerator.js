import OpenAI from 'openai';
import fs from 'fs/promises';

export class MacroGenerator {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
  }

  async readFullHTML(htmlPath) {
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    return htmlContent;
  }

  async generateMacroCode(task, htmlPath, previousAttempts, selectedModel) {
    const htmlContent = await this.readFullHTML(htmlPath);

    let prompt = `
You are a web automation expert. Generate Playwright JavaScript code to perform the following task:

Task: ${task.description}

HTML Content:
${htmlContent}

Generate clean, working Playwright code that:
1. Uses import syntax (not require) since this is ES module
2. Opens the HTML file using fileUrl parameter
3. Performs the requested action
4. Includes proper waits and error handling
5. Takes screenshots using screenshotsDir parameter with path.join()
6. Returns detailed result object with action summary and data extracted

IMPORTANT:
- Use ES6 import syntax, NOT require()
- Use the provided parameters: page, fileUrl, screenshotsDir
- Import path if needed: import path from 'path'
- Return detailed object with extracted data

Return only the JavaScript code without any markdown formatting or explanation.
`;

    // Add error context from previous attempts for multi-turn improvement
    if (previousAttempts && previousAttempts.length > 0) {
      const errorContext = previousAttempts
        .filter(attempt => !attempt.success && attempt.error)
        .map(attempt => `Attempt ${attempt.attemptNumber}: ${attempt.error}`)
        .join('\n');

      if (errorContext) {
        prompt += `

PREVIOUS ERRORS TO AVOID:
${errorContext}

Please fix these issues in your new code.`;
      }
    }

    const response = await this.openai.chat.completions.create({
      model: selectedModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  }
}