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

  async analyzeHTML(htmlPath) {
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    const $ = cheerio.load(htmlContent);

    const structure = {
      title: $('title').text() || 'Unknown',
      forms: [],
      buttons: [],
      inputs: [],
      links: [],
      images: [],
      selects: [],
      textareas: [],
      divs: [],
      spans: []
    };

    // Forms analysis
    $('form').each((i, el) => {
      structure.forms.push({
        id: $(el).attr('id'),
        class: $(el).attr('class'),
        action: $(el).attr('action'),
        method: $(el).attr('method'),
        inputs: $(el).find('input').map((j, input) => ({
          type: $(input).attr('type'),
          name: $(input).attr('name'),
          id: $(input).attr('id'),
          placeholder: $(input).attr('placeholder')
        })).get()
      });
    });

    // Interactive elements
    $('button, input[type="submit"], input[type="button"]').each((i, el) => {
      structure.buttons.push({
        text: $(el).text() || $(el).val() || $(el).attr('value'),
        id: $(el).attr('id'),
        class: $(el).attr('class'),
        type: $(el).attr('type'),
        onclick: $(el).attr('onclick'),
        selector: this.generateSelector($(el))
      });
    });

    $('input:not([type="submit"]):not([type="button"])').each((i, el) => {
      structure.inputs.push({
        name: $(el).attr('name'),
        id: $(el).attr('id'),
        type: $(el).attr('type'),
        placeholder: $(el).attr('placeholder'),
        class: $(el).attr('class'),
        selector: this.generateSelector($(el))
      });
    });

    $('a').each((i, el) => {
      structure.links.push({
        text: $(el).text().trim(),
        href: $(el).attr('href'),
        id: $(el).attr('id'),
        class: $(el).attr('class'),
        selector: this.generateSelector($(el))
      });
    });

    $('select').each((i, el) => {
      structure.selects.push({
        name: $(el).attr('name'),
        id: $(el).attr('id'),
        class: $(el).attr('class'),
        options: $(el).find('option').map((j, opt) => ({
          value: $(opt).attr('value'),
          text: $(opt).text()
        })).get(),
        selector: this.generateSelector($(el))
      });
    });

    $('textarea').each((i, el) => {
      structure.textareas.push({
        name: $(el).attr('name'),
        id: $(el).attr('id'),
        class: $(el).attr('class'),
        placeholder: $(el).attr('placeholder'),
        selector: this.generateSelector($(el))
      });
    });

    // Clickable divs and spans
    $('div[onclick], div[class*="btn"], div[class*="button"], div[role="button"]').each((i, el) => {
      structure.divs.push({
        text: $(el).text().trim().substring(0, 50),
        id: $(el).attr('id'),
        class: $(el).attr('class'),
        onclick: $(el).attr('onclick'),
        selector: this.generateSelector($(el))
      });
    });

    return {
      structure,
      htmlContent: htmlContent.substring(0, 5000) // First 5000 chars
    };
  }

  generateSelector(element) {
    const tag = element.prop('tagName').toLowerCase();
    const id = element.attr('id');
    const classes = element.attr('class');

    if (id) {
      return `#${id}`;
    } else if (classes) {
      const classList = classes.split(' ').filter(cls => cls.length > 0);
      return `${tag}.${classList.join('.')}`;
    } else {
      const text = element.text().trim();
      if (text && text.length < 50) {
        return `${tag}:contains("${text}")`;
      }
      return tag;
    }
  }

  async generateMacroCode(task, htmlPath, previousAttempts = [], model = 'openai/gpt-4o-mini') {
    console.log('      📊 Analyzing HTML structure...');
    const analysis = await this.analyzeHTML(htmlPath);

    const isRetryAttempt = previousAttempts.length > 0;
    const previousErrors = previousAttempts.map(attempt => ({
      attemptNumber: attempt.attemptNumber,
      error: attempt.error,
      macroCode: attempt.macroCode
    }));

    const prompt = this.buildPrompt(task, analysis, isRetryAttempt, previousErrors);

    console.log(`      🤖 Calling LLM (${model}) to generate macro...`);
    const response = await this.openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: isRetryAttempt ? 0.7 : 0.3, // Higher temperature for retries to get variation
    });

    const rawResponse = response.choices[0].message.content;
    return this.extractMacroCode(rawResponse);
  }

  buildPrompt(task, analysis, isRetryAttempt, previousErrors) {
    let prompt = `# WEB AUTOMATION MACRO GENERATION TASK

## TASK DESCRIPTION
**Objective**: ${task.description}
**Expected Result**: ${task.expectedResult || 'Complete the task successfully'}
**Difficulty**: ${task.difficulty || 'medium'}
**Category**: ${task.category || 'general'}

## WEBSITE ANALYSIS
**Title**: ${analysis.structure.title}

**Available Interactive Elements**:`;

    // Add detailed element information
    if (analysis.structure.forms.length > 0) {
      prompt += `\\n\\n**Forms** (${analysis.structure.forms.length}):`;
      analysis.structure.forms.forEach(form => {
        prompt += `\\n- Form: ${form.id || form.class || 'unnamed'} (action: ${form.action}, method: ${form.method})`;
        if (form.inputs.length > 0) {
          prompt += `\\n  Inputs: ${form.inputs.map(inp => `${inp.type}[name="${inp.name}"]${inp.placeholder ? ` placeholder="${inp.placeholder}"` : ''}`).join(', ')}`;
        }
      });
    }

    if (analysis.structure.buttons.length > 0) {
      prompt += `\\n\\n**Buttons** (${analysis.structure.buttons.length}):`;
      analysis.structure.buttons.slice(0, 10).forEach((btn, i) => {
        prompt += `\\n- Button ${i+1}: "${btn.text}" [selector: ${btn.selector}]`;
      });
    }

    if (analysis.structure.inputs.length > 0) {
      prompt += `\\n\\n**Input Fields** (${analysis.structure.inputs.length}):`;
      analysis.structure.inputs.slice(0, 10).forEach((inp, i) => {
        prompt += `\\n- Input ${i+1}: ${inp.type} [name="${inp.name}", placeholder="${inp.placeholder}", selector: ${inp.selector}]`;
      });
    }

    if (analysis.structure.links.length > 0) {
      prompt += `\\n\\n**Links** (${analysis.structure.links.length}):`;
      analysis.structure.links.slice(0, 8).forEach((link, i) => {
        prompt += `\\n- Link ${i+1}: "${link.text}" [href="${link.href}", selector: ${link.selector}]`;
      });
    }

    if (analysis.structure.selects.length > 0) {
      prompt += `\\n\\n**Select Dropdowns** (${analysis.structure.selects.length}):`;
      analysis.structure.selects.forEach((select, i) => {
        prompt += `\\n- Select ${i+1}: [name="${select.name}", selector: ${select.selector}]`;
        if (select.options.length > 0) {
          prompt += `\\n  Options: ${select.options.map(opt => `"${opt.text}"(value: ${opt.value})`).join(', ')}`;
        }
      });
    }

    // Add retry-specific context
    if (isRetryAttempt) {
      prompt += `\\n\\n## PREVIOUS FAILED ATTEMPTS
This is attempt #${previousErrors.length + 1}. The following attempts failed:`;

      previousErrors.forEach(error => {
        prompt += `\\n\\n**Attempt ${error.attemptNumber} - FAILED**`;
        prompt += `\\nError: ${error.error}`;
        if (error.macroCode) {
          prompt += `\\nPrevious code snippet: ${error.macroCode.substring(0, 200)}...`;
        }
      });

      prompt += `\\n\\n**LEARN FROM FAILURES**: Analyze the previous errors and generate a DIFFERENT approach. Try alternative selectors, different waiting strategies, or alternative interaction methods.`;
    }

    // Core instructions
    prompt += `\\n\\n## HTML STRUCTURE (First 5000 chars)
\`\`\`html
${analysis.htmlContent}
\`\`\`

## MACRO GENERATION INSTRUCTIONS

Generate a Playwright JavaScript macro that:

1. **Uses ES6 import syntax** (import, not require)
2. **Uses provided parameters**: \`page\`, \`fileUrl\`, \`screenshotsDir\`
3. **Navigates to the HTML file**: \`await page.goto(fileUrl)\`
4. **Implements robust waiting**: Use \`page.waitForSelector()\`, \`page.waitForLoadState()\`
5. **Takes screenshots**: Use \`path.join(screenshotsDir, 'step_X.png')\` for each major step
6. **Handles errors gracefully**: Use try-catch blocks
7. **Returns detailed result object** with:
   - \`success: boolean\`
   - \`action: string\` (description of what was accomplished)
   - \`extractedData: object\` (any data extracted from the page)
   - \`screenshots: array\` (paths to screenshots taken)
   - \`error: string\` (if failed)

**CRITICAL REQUIREMENTS**:
- Wait for elements before interacting
- Use multiple selector strategies (ID, class, text content)
- Handle dynamic content loading
- Take screenshot after each significant action
- Extract meaningful data to verify task completion

${isRetryAttempt ? '**IMPORTANT**: This is a retry - use DIFFERENT selectors and strategies from previous attempts!' : ''}

## OUTPUT FORMAT
Your response must contain the macro code between these markers:

\`\`\`MACRO_CODE_START
// Your Playwright macro code here
\`\`\`MACRO_CODE_END

Generate the macro code now:`;

    return prompt;
  }

  extractMacroCode(rawResponse) {
    // Try to extract code between the specified markers
    const markerStart = '```MACRO_CODE_START';
    const markerEnd = '```MACRO_CODE_END';

    const startIndex = rawResponse.indexOf(markerStart);
    const endIndex = rawResponse.indexOf(markerEnd);

    if (startIndex !== -1 && endIndex !== -1) {
      return rawResponse.substring(startIndex + markerStart.length, endIndex).trim();
    }

    // Fallback: extract from standard code blocks
    const codeBlocks = rawResponse.match(/```(?:javascript|js)?(.*?)```/gs);
    if (codeBlocks && codeBlocks.length > 0) {
      // Get the largest code block
      const largestBlock = codeBlocks.reduce((prev, current) =>
        current.length > prev.length ? current : prev
      );
      return largestBlock.replace(/```(?:javascript|js)?/g, '').trim();
    }

    // Final fallback: return the whole response if no code blocks found
    console.warn('⚠️  Could not extract code blocks, using full response');
    return rawResponse;
  }
}