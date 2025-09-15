import fs from 'fs/promises';
import path from 'path';

export class ResultStorage {
  constructor() {
    this.resultsDir = path.join(process.cwd(), 'benchmark_results');
    this.reportsDir = path.join(this.resultsDir, 'reports');
    this.dataDir = path.join(this.resultsDir, 'data');
    this.screenshotsDir = path.join(this.resultsDir, 'screenshots');

    this.initialize();
  }

  async initialize() {
    await fs.mkdir(this.resultsDir, { recursive: true });
    await fs.mkdir(this.reportsDir, { recursive: true });
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.mkdir(this.screenshotsDir, { recursive: true });
  }

  async saveResult(result) {
    const filename = `result_${result.id}.json`;
    const filepath = path.join(this.dataDir, filename);

    const resultData = {
      ...result,
      savedAt: new Date().toISOString(),
      version: '1.0'
    };

    await fs.writeFile(filepath, JSON.stringify(resultData, null, 2));
    console.log(`💾 Result saved: ${filename}`);
    return filepath;
  }

  async saveBenchmarkReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlFilename = `benchmark_report_${timestamp}.html`;
    const jsonFilename = `benchmark_report_${timestamp}.json`;

    // Save JSON data with memory safety
    const jsonPath = path.join(this.dataDir, jsonFilename);
    try {
      const jsonString = JSON.stringify(report, null, 2);
      await fs.writeFile(jsonPath, jsonString);
    } catch (error) {
      if (error.message.includes('Invalid string length')) {
        console.warn('⚠️  Large data detected, saving summary only...');
        // Save summary version without detailed logs
        const summaryReport = {
          ...report,
          results: report.results.map(result => ({
            id: result.id,
            website: result.website,
            task: { id: result.task.id, description: result.task.description },
            success: result.success,
            totalExecutionTime: result.totalExecutionTime,
            attempts: result.attempts.length
          }))
        };
        const summaryString = JSON.stringify(summaryReport, null, 2);
        await fs.writeFile(jsonPath, summaryString);
      } else {
        throw error;
      }
    }

    // Generate HTML report
    const htmlPath = path.join(this.reportsDir, htmlFilename);
    const htmlContent = await this.generateHTMLReport(report);
    await fs.writeFile(htmlPath, htmlContent);

    console.log(`📊 Benchmark report saved: ${htmlFilename}`);
    return { htmlPath, jsonPath };
  }

  async generateHTMLReport(report) {
    const { summary, websiteStats, difficultyStats, attemptStats, results } = report;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LLM Macro Benchmark Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }

        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #3b82f6;
        }

        .stat-label {
            color: #64748b;
            margin-top: 5px;
        }

        .success {
            color: #10b981;
        }

        .failed {
            color: #ef4444;
        }

        .section {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }

        .section h2 {
            color: #1e293b;
            margin-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }

        th {
            background: #f8fafc;
            font-weight: 600;
            color: #475569;
        }

        .result-row {
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .result-row:hover {
            background: #f8fafc;
        }

        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: 500;
        }

        .status-success {
            background: #dcfce7;
            color: #16a34a;
        }

        .status-failed {
            background: #fef2f2;
            color: #dc2626;
        }

        .attempts-badge {
            background: #ede9fe;
            color: #7c3aed;
        }

        .details {
            display: none;
            background: #f8fafc;
            padding: 15px;
            border-left: 4px solid #3b82f6;
            margin-top: 10px;
        }

        .toggle-details {
            color: #3b82f6;
            cursor: pointer;
            font-size: 0.9em;
        }

        .progress-bar {
            background: #e2e8f0;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }

        .progress-fill {
            background: #10b981;
            height: 100%;
            transition: width 0.3s ease;
        }

        .chart-container {
            margin: 20px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 6px;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            table {
                font-size: 0.9em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 LLM Macro Benchmark Report</h1>
            <p>Generated on ${new Date(report.generatedAt).toLocaleString()}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${summary.totalTasks}</div>
                <div class="stat-label">Total Tasks</div>
            </div>
            <div class="stat-card">
                <div class="stat-value success">${summary.successfulTasks}</div>
                <div class="stat-label">Successful</div>
            </div>
            <div class="stat-card">
                <div class="stat-value failed">${summary.failedTasks}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.successRate}</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 Website Performance</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${summary.successRate}"></div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Website</th>
                        <th>Total Tasks</th>
                        <th>Successful</th>
                        <th>Failed</th>
                        <th>Success Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(websiteStats).map(([website, stats]) => `
                        <tr>
                            <td><strong>${website}</strong></td>
                            <td>${stats.total}</td>
                            <td class="success">${stats.success}</td>
                            <td class="failed">${stats.failed}</td>
                            <td>${((stats.success / stats.total) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🎯 Task Difficulty Analysis</h2>
            <table>
                <thead>
                    <tr>
                        <th>Difficulty</th>
                        <th>Total Tasks</th>
                        <th>Successful</th>
                        <th>Failed</th>
                        <th>Success Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(difficultyStats).map(([difficulty, stats]) => `
                        <tr>
                            <td><strong>${difficulty}</strong></td>
                            <td>${stats.total}</td>
                            <td class="success">${stats.success}</td>
                            <td class="failed">${stats.failed}</td>
                            <td>${((stats.success / stats.total) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🔄 Retry Attempts Distribution</h2>
            <table>
                <thead>
                    <tr>
                        <th>Attempts Needed</th>
                        <th>Number of Tasks</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(attemptStats).map(([attempts, count]) => `
                        <tr>
                            <td><strong>${attempts}</strong></td>
                            <td>${count}</td>
                            <td>${((count / summary.totalTasks) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>📋 Detailed Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Task ID</th>
                        <th>Website</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Attempts</th>
                        <th>Execution Time</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map((result, index) => `
                        <tr class="result-row">
                            <td><code>${result.task.id}</code></td>
                            <td>${result.website}</td>
                            <td>${result.task.description}</td>
                            <td>
                                <span class="status-badge ${result.success ? 'status-success' : 'status-failed'}">
                                    ${result.success ? '✅ SUCCESS' : '❌ FAILED'}
                                </span>
                            </td>
                            <td>
                                <span class="status-badge attempts-badge">
                                    ${result.attempts.length}/${report.config.maxRetries}
                                </span>
                            </td>
                            <td>${(result.totalExecutionTime / 1000).toFixed(2)}s</td>
                            <td>
                                <span class="toggle-details" onclick="toggleDetails(${index})">
                                    👁️ View Details
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="7">
                                <div id="details-${index}" class="details">
                                    <h4>Task Details</h4>
                                    <p><strong>Objective:</strong> ${result.task.expectedResult || 'N/A'}</p>
                                    <p><strong>Difficulty:</strong> ${result.task.difficulty}</p>
                                    <p><strong>Category:</strong> ${result.task.category}</p>

                                    <h4>Execution Attempts</h4>
                                    ${result.attempts.map((attempt, attemptIndex) => `
                                        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                                            <strong>Attempt ${attempt.attemptNumber}:</strong>
                                            <span class="status-badge ${attempt.success ? 'status-success' : 'status-failed'}">
                                                ${attempt.success ? 'SUCCESS' : 'FAILED'}
                                            </span>
                                            <br>
                                            <small>Time: ${(attempt.executionTime / 1000).toFixed(2)}s</small>
                                            ${attempt.error ? `<br><small style="color: #dc2626;">Error: ${attempt.error}</small>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>⚙️ Configuration</h2>
            <p><strong>Max Retries:</strong> ${report.config.maxRetries}</p>
            <p><strong>Timeout:</strong> ${report.config.timeoutMs / 1000}s</p>
            <p><strong>Screenshot on Error:</strong> ${report.config.screenshotOnError ? 'Yes' : 'No'}</p>
            <p><strong>Save All Logs:</strong> ${report.config.saveAllLogs ? 'Yes' : 'No'}</p>
        </div>
    </div>

    <script>
        function toggleDetails(index) {
            const details = document.getElementById('details-' + index);
            const isVisible = details.style.display === 'block';
            details.style.display = isVisible ? 'none' : 'block';
        }

        // Auto-expand failed tasks
        document.addEventListener('DOMContentLoaded', function() {
            const failedResults = ${JSON.stringify(results.map((r, i) => ({ index: i, failed: !r.success })))};
            failedResults.forEach(result => {
                if (result.failed) {
                    toggleDetails(result.index);
                }
            });
        });
    </script>
</body>
</html>`;
  }

  async loadResult(resultId) {
    const filename = `result_${resultId}.json`;
    const filepath = path.join(this.dataDir, filename);

    try {
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Could not load result ${resultId}: ${error.message}`);
    }
  }

  async getResultFilenames() {
    const files = await fs.readdir(this.dataDir);
    return files.filter(f => f.startsWith('result_') && f.endsWith('.json'));
  }

  async getAllResults() {
    const files = await fs.readdir(this.dataDir);
    const resultFiles = files.filter(f => f.startsWith('result_') && f.endsWith('.json'));

    const results = [];
    for (const file of resultFiles) {
      try {
        const data = await fs.readFile(path.join(this.dataDir, file), 'utf-8');
        results.push(JSON.parse(data));
      } catch (error) {
        console.warn(`Could not load ${file}: ${error.message}`);
      }
    }

    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getReportPath() {
    return this.reportsDir;
  }

  getDataPath() {
    return this.dataDir;
  }

  async exportResults(format = 'json') {
    const results = await this.getAllResults();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      const filename = `benchmark_export_${timestamp}.json`;
      const filepath = path.join(this.dataDir, filename);
      await fs.writeFile(filepath, JSON.stringify(results, null, 2));
      return filepath;
    } else if (format === 'csv') {
      // Implement CSV export if needed
      throw new Error('CSV export not implemented yet');
    }

    throw new Error(`Unsupported export format: ${format}`);
  }
}