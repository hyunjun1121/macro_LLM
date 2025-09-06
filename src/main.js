import dotenv from 'dotenv';
import { MacroGenerator } from './macroGenerator.js';
import { MacroExecutor } from './macroExecutor.js';
import { ReportGenerator } from './reportGenerator.js';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

export class WebAgent {
  constructor() {
    this.generator = new MacroGenerator(process.env.OPENAI_API_KEY);
    this.executor = new MacroExecutor();
    this.reporter = new ReportGenerator();
  }

  async runMacro(instruction, htmlPath) {
    console.log('=' * 60);
    console.log(`📋 Task: ${instruction}`);
    console.log(`📄 Target HTML: ${htmlPath}`);
    console.log('=' * 60);

    try {
      console.log('\n1️⃣ Generating macro code with LLM...');
      const macroCode = await this.generator.generateMacroCode(instruction, htmlPath);
      
      const generatedCodePath = path.join(process.cwd(), 'generated', `macro_${Date.now()}.js`);
      await fs.mkdir(path.dirname(generatedCodePath), { recursive: true });
      await fs.writeFile(generatedCodePath, macroCode);
      console.log(`   ✅ Macro code saved to: ${generatedCodePath}`);

      console.log('\n2️⃣ Executing macro...');
      const executionResult = await this.executor.executeMacro(macroCode, htmlPath);
      
      if (executionResult.success) {
        console.log('   ✅ Macro executed successfully!');
        console.log(`   Result: ${JSON.stringify(executionResult.result)}`);
      } else {
        console.log('   ❌ Macro execution failed!');
        console.log(`   Error: ${executionResult.error}`);
      }

      console.log('\n3️⃣ Generating execution report...');
      const reportPath = await this.reporter.generateHTMLReport(
        executionResult, 
        instruction, 
        macroCode
      );
      console.log(`   ✅ Report saved to: ${reportPath}`);

      return {
        success: executionResult.success,
        macroCodePath: generatedCodePath,
        reportPath,
        executionResult
      };

    } catch (error) {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const agent = new WebAgent();
  
  const instruction = process.argv[2] || "Click the login button";
  const htmlPath = process.argv[3] || "./facebook/home.html";
  
  agent.runMacro(instruction, htmlPath)
    .then(result => {
      console.log('\n✨ Process completed!');
      console.log('Open the report file in your browser to see detailed results.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}