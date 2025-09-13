import XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class TaskExtractor {
  constructor() {
    this.projectRoot = path.dirname(__dirname);
  }

  async extractTasksFromXlsx(xlsxPath) {
    try {
      const workbook = XLSX.readFile(xlsxPath);
      const tasks = [];

      // Read all sheets
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Parse tasks from sheet data
        for (let i = 1; i < data.length; i++) { // Skip header row
          const row = data[i];
          if (row && row.length > 0) {
            const task = this.parseTaskRow(row, sheetName);
            if (task) tasks.push(task);
          }
        }
      }

      return tasks;
    } catch (error) {
      console.error(`Error reading ${xlsxPath}:`, error.message);
      return [];
    }
  }

  parseTaskRow(row, sheetName) {
    // Flexible parsing to handle different xlsx formats
    // Handle both standard format and the observed format where columns may be swapped
    let task;

    // Try to detect format by checking if first column looks like task ID
    if (row[0] && (row[0].toString().includes('TASK') || row[0].toString().includes('YT_') || row[0].toString().includes('T0'))) {
      // Standard format: ID, Description, Objective, ExpectedResult, Difficulty, Category, Tags, Notes
      task = {
        id: row[0] || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: row[1] || '',
        objective: row[2] || '',
        expectedResult: row[3] || '',
        difficulty: row[4] || 'medium',
        category: row[5] || sheetName || 'general',
        tags: row[6] ? row[6].split(',').map(t => t.trim()) : [],
        notes: row[7] || ''
      };
    } else {
      // Alternative format observed in some files: Description, Objective, ExpectedResult, Difficulty, Category, Tags, Notes
      task = {
        id: `${sheetName}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        description: row[0] || '',
        objective: row[1] || '',
        expectedResult: row[2] || '',
        difficulty: row[3] || 'medium',
        category: row[4] || sheetName || 'general',
        tags: row[5] ? row[5].split(',').map(t => t.trim()) : [],
        notes: row[6] || ''
      };
    }

    // Filter out summary rows and invalid tasks
    if (!task.description ||
        task.description.toString().toLowerCase().includes('total tasks') ||
        task.description.toString().toLowerCase().includes('summary') ||
        task.description.length < 3) {
      return null;
    }

    return task;
  }

  async discoverAllTasks() {
    const allTasks = {};

    // Find all xlsx files automatically
    const { glob } = await import('glob');
    const pattern = path.join(this.projectRoot, '**/*.xlsx').replace(/\\/g, '/');
    const taskFiles = await glob(pattern);

    // Convert to relative paths
    const relativeTaskFiles = taskFiles.map(file =>
      path.relative(this.projectRoot, file).replace(/\\/g, '/')
    );

    for (const taskFile of relativeTaskFiles) {
      const xlsxPath = path.join(this.projectRoot, taskFile);
      const websiteName = path.dirname(taskFile);

      try {
        await fs.access(xlsxPath);
        const tasks = await this.extractTasksFromXlsx(xlsxPath);
        allTasks[websiteName] = tasks;
        console.log(`✅ Loaded ${tasks.length} tasks from ${websiteName}`);
      } catch (error) {
        console.log(`⚠️  Task file not found: ${xlsxPath}`);
        allTasks[websiteName] = [];
      }
    }

    return allTasks;
  }

  async getWebsiteInfo(websiteName) {
    const websitePath = path.join(this.projectRoot, websiteName);
    const info = {
      name: websiteName,
      htmlFiles: [],
      hasIndex: false,
      structure: {}
    };

    try {
      const files = await fs.readdir(websitePath);

      for (const file of files) {
        const filePath = path.join(websitePath, file);
        const stat = await fs.stat(filePath);

        if (stat.isFile() && file.endsWith('.html')) {
          info.htmlFiles.push(file);
          if (file === 'index.html') {
            info.hasIndex = true;
          }
        }
      }
    } catch (error) {
      console.error(`Error reading website directory ${websitePath}:`, error.message);
    }

    return info;
  }
}