import fs from 'fs/promises';
import path from 'path';

export class ReportGenerator {
  async generateHTMLReport(executionResult, instruction, macroCode) {
    const timestamp = new Date().toISOString();
    const reportName = `report_${Date.now()}.html`;
    
    const screenshotFiles = executionResult.screenshotsDir 
      ? await fs.readdir(executionResult.screenshotsDir).catch(() => [])
      : [];
    
    const screenshotHTML = screenshotFiles.map(file => 
      `<img src="../${path.relative(process.cwd(), path.join(executionResult.screenshotsDir, file))}" alt="${file}" style="max-width: 100%; margin: 10px 0;">`
    ).join('\n');

    const logHTML = executionResult.executionLog
      .map(log => `
        <div class="log-entry log-${log.type}">
          <span class="timestamp">${log.timestamp}</span>
          <span class="type">${log.type}</span>
          <pre>${JSON.stringify(log, null, 2)}</pre>
        </div>
      `).join('\n');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Macro Execution Report - ${timestamp}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: bold;
      color: white;
    }
    .status.success { background: #28a745; }
    .status.failure { background: #dc3545; }
    .section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .code-block {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
    .log-entry {
      border-left: 3px solid #007bff;
      padding: 10px;
      margin: 10px 0;
      background: #f8f9fa;
    }
    .log-entry.log-error {
      border-color: #dc3545;
      background: #fff5f5;
    }
    .log-entry.log-complete {
      border-color: #28a745;
      background: #f5fff5;
    }
    .timestamp {
      color: #6c757d;
      font-size: 12px;
      margin-right: 10px;
    }
    .type {
      font-weight: bold;
      margin-right: 10px;
    }
    pre {
      margin: 5px 0;
      white-space: pre-wrap;
    }
    img {
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Macro Execution Report</h1>
    <p><strong>Timestamp:</strong> ${timestamp}</p>
    <p><strong>Status:</strong> <span class="status ${executionResult.success ? 'success' : 'failure'}">${executionResult.success ? 'SUCCESS' : 'FAILURE'}</span></p>
    <p><strong>Instruction:</strong> ${instruction}</p>
  </div>

  <div class="section">
    <h2>Generated Macro Code</h2>
    <div class="code-block">
      <pre>${macroCode}</pre>
    </div>
  </div>

  <div class="section">
    <h2>Execution Result</h2>
    ${executionResult.success ? 
      `<p><strong>Result:</strong> ${JSON.stringify(executionResult.result)}</p>` :
      `<p style="color: red;"><strong>Error:</strong> ${executionResult.error}</p>`
    }
  </div>

  <div class="section">
    <h2>Screenshots</h2>
    ${screenshotHTML || '<p>No screenshots available</p>'}
  </div>

  <div class="section">
    <h2>Execution Log</h2>
    ${logHTML}
  </div>

  ${executionResult.videoPath ? `
  <div class="section">
    <h2>Video Recording</h2>
    <p><a href="../${path.relative(process.cwd(), executionResult.videoPath)}">View Recording</a></p>
  </div>
  ` : ''}
</body>
</html>`;

    const reportPath = path.join(process.cwd(), 'reports', reportName);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, html);
    
    return reportPath;
  }
}