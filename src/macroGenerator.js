import OpenAI from 'openai';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

export class MacroGenerator {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeHTML(htmlPath) {
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    const $ = cheerio.load(htmlContent);
    
    const structure = {
      forms: [],
      buttons: [],
      inputs: [],
      links: []
    };

    $('form').each((i, el) => {
      structure.forms.push({
        id: $(el).attr('id'),
        action: $(el).attr('action'),
        method: $(el).attr('method')
      });
    });

    $('button, input[type="submit"]').each((i, el) => {
      structure.buttons.push({
        text: $(el).text() || $(el).val(),
        id: $(el).attr('id'),
        class: $(el).attr('class'),
        type: $(el).attr('type')
      });
    });

    $('input:not([type="submit"])').each((i, el) => {
      structure.inputs.push({
        name: $(el).attr('name'),
        id: $(el).attr('id'),
        type: $(el).attr('type'),
        placeholder: $(el).attr('placeholder')
      });
    });

    $('a').each((i, el) => {
      structure.links.push({
        text: $(el).text(),
        href: $(el).attr('href'),
        id: $(el).attr('id')
      });
    });

    return { htmlContent, structure };
  }

  async generateMacroCode(instruction, htmlPath) {
    const { htmlContent, structure } = await this.analyzeHTML(htmlPath);
    
    const prompt = `
You are a web automation expert. Generate Playwright JavaScript code to perform the following task:

Task: ${instruction}

Page Structure:
${JSON.stringify(structure, null, 2)}

HTML Content (first 2000 chars):
${htmlContent.substring(0, 2000)}

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

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  }
}