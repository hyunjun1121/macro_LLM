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

      // Determine which sheet to read based on file path (only ONE sheet per file)
      let sheetToRead = workbook.SheetNames[0]; // Default to first sheet

      if (xlsxPath.includes('TikTok')) {
        // TikTok: try multiple possible sheet names, pick FIRST match only
        const possibleSheets = ['Tasks', 'Sheet1', 'TikTok_Tasks', 'Task'];
        const foundSheet = workbook.SheetNames.find(name => possibleSheets.includes(name));
        if (foundSheet) sheetToRead = foundSheet;
      } else if (xlsxPath.includes('Airbnb')) {
        // Airbnb: try multiple possible sheet names, pick FIRST match only
        const possibleSheets = ['All_Tasks', 'Sheet1', 'Airbnb_Tasks', 'Tasks'];
        const foundSheet = workbook.SheetNames.find(name => possibleSheets.includes(name));
        if (foundSheet) sheetToRead = foundSheet;
      }

      const sheetsToRead = [sheetToRead]; // Always process exactly ONE sheet

      // Read specified sheets
      for (const sheetName of sheetsToRead) {
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

    // Define only incomplete websites (0% completion)
    const TARGET_WEBSITES = [
      'Amazon', 'TikTok', 'reddit', 'instagram', 'facebook', 'discord'
    ];

    // Find task files for target websites only
    const { glob } = await import('glob');
    const finalTaskFiles = [];

    for (const website of TARGET_WEBSITES) {
      // Search for both Excel and JSON files
      const xlsxPattern = path.join(this.projectRoot, website, '*.xlsx').replace(/\\/g, '/');
      const jsonPattern = path.join(this.projectRoot, website, '*tasks*.json').replace(/\\/g, '/');

      const xlsxFiles = await glob(xlsxPattern);
      const jsonFiles = await glob(jsonPattern);
      const websiteFiles = [...xlsxFiles, ...jsonFiles];

      console.log(`🔍 Searching ${website}:`);
      console.log(`   Excel pattern: ${xlsxPattern}`);
      console.log(`   JSON pattern: ${jsonPattern}`);
      console.log(`   Found files: ${websiteFiles.map(f => path.basename(f)).join(', ')}`);

      // Filter and prioritize improved files
      const validFiles = websiteFiles
        .filter(file => !file.includes('validation_report'))
        .map(file => path.relative(this.projectRoot, file).replace(/\\/g, '/'));

      console.log(`   Valid files: ${validFiles.map(f => path.basename(f)).join(', ')}`);

      if (validFiles.length > 0) {
        // ONLY use improved files, skip website if no improved file exists
        const improvedFiles = validFiles.filter(file => file.includes('improved') || file.includes('Improved'));
        console.log(`   Checking for improved: ${improvedFiles.length > 0 ? 'FOUND' : 'NOT FOUND'}`);

        if (improvedFiles.length > 0) {
          // For Threads, prioritize JSON files over Excel files
          let selectedFile;
          if (website === 'Threads') {
            selectedFile = improvedFiles.find(file => file.endsWith('.json')) || improvedFiles[0];
          } else {
            selectedFile = improvedFiles[0];
          }

          finalTaskFiles.push(selectedFile);
          console.log(`✅ Using improved file for ${website}: ${selectedFile}`);
        } else {
          console.warn(`⚠️  No improved file found for ${website}, skipping...`);
          console.log(`   Available files were: ${validFiles.join(', ')}`);
        }
      } else {
        console.warn(`⚠️  No task files found for ${website}`);
      }
    }

    for (const taskFile of finalTaskFiles) {
      const xlsxPath = path.join(this.projectRoot, taskFile);
      const websiteName = path.dirname(taskFile);

      try {
        await fs.access(xlsxPath);
        let tasks = [];
        if (taskFile.endsWith('.xlsx')) {
          tasks = await this.extractTasksFromXlsx(xlsxPath);
        } else if (taskFile.endsWith('.json')) {
          tasks = await this.extractTasksFromJson(xlsxPath);
        }

        // Try to load ground truth data
        const groundTruthPath = await this.findGroundTruthFile(websiteName);
        if (groundTruthPath) {
          try {
            const groundTruthData = JSON.parse(await fs.readFile(groundTruthPath, 'utf-8'));
            // Attach ground truth to tasks
            tasks.forEach((task) => {
              if (groundTruthData.tasks && groundTruthData.tasks[task.id]) {
                task.groundTruth = groundTruthData.tasks[task.id].ground_truth || groundTruthData.tasks[task.id];
              }
            });
            console.log(`✅ Loaded ${tasks.length} tasks from ${websiteName} (with ground truth)`);
          } catch (gtError) {
            console.log(`✅ Loaded ${tasks.length} tasks from ${websiteName} (no ground truth: ${gtError.message})`);
          }
        } else {
          console.log(`✅ Loaded ${tasks.length} tasks from ${websiteName}`);
        }

        allTasks[websiteName] = tasks;
      } catch (error) {
        console.log(`⚠️  Task file not found: ${xlsxPath}`);
        allTasks[websiteName] = [];
      }
    }

    return allTasks;
  }

  async findGroundTruthFile(websiteName) {
    const possibleNames = [
      `${websiteName}_ground_truth.json`,
      `ground_truth.json`,
      `ground_truth_validation.json`
    ];

    for (const fileName of possibleNames) {
      const groundTruthPath = path.join(this.projectRoot, websiteName, fileName);
      try {
        await fs.access(groundTruthPath);
        return groundTruthPath;
      } catch (error) {
        // File doesn't exist, try next
      }
    }
    return null;
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

  async extractTasksFromJson(jsonPath) {
    try {
      const content = await fs.readFile(jsonPath, 'utf8');
      const data = JSON.parse(content);
      const tasks = [];

      // Handle different JSON structures
      if (data.improved_tasks && data.improved_tasks.general_tasks) {
        // Threads-style JSON structure - process general tasks
        for (const taskData of data.improved_tasks.general_tasks) {
          const task = {
            id: taskData.task_id,                    // ✅ G001, G002, etc.
            description: taskData.task_name || taskData.task_description,  // ✅ "Navigate to Search View"
            objective: taskData.task_description,    // ✅ Full description
            expectedResult: taskData.specific_action, // ✅ Action details
            difficulty: taskData.difficulty || 'Medium',
            category: taskData.target_elements || '',
            tags: [taskData.estimated_time || '', taskData.success_criteria || ''].filter(Boolean),
            notes: taskData.rule_validation || '',
            groundTruth: taskData.ground_truth || null
          };
          if (task.id && task.description) {  // Only add valid tasks
            tasks.push(task);
          }
        }

        // Process harmful tasks if they exist
        if (data.improved_tasks.harmful_tasks) {
          for (const taskData of data.improved_tasks.harmful_tasks) {
            const task = {
              id: taskData.task_id,                    // ✅ H001, H002, etc.
              description: taskData.task_name || taskData.task_description,  // ✅ "Extract All Visible Usernames"
              objective: taskData.task_description,    // ✅ Full description
              expectedResult: taskData.specific_action, // ✅ Action details
              difficulty: taskData.difficulty || 'Medium',
              category: taskData.target_elements || '',
              tags: [taskData.estimated_time || '', taskData.success_criteria || ''].filter(Boolean),
              notes: taskData.rule_validation || '',
              groundTruth: taskData.ground_truth || null
            };
            if (task.id && task.description) {  // Only add valid tasks
              tasks.push(task);
            }
          }
        }
      } else if (Array.isArray(data)) {
        // Direct array of tasks
        for (const taskData of data) {
          const task = {
            id: taskData.id || taskData.task_id,
            description: taskData.description || taskData.task_name,
            objective: taskData.objective || taskData.task_description,
            expectedResult: taskData.expectedResult || taskData.specific_action,
            difficulty: taskData.difficulty || 'Medium',
            category: taskData.category || '',
            tags: taskData.tags || [],
            notes: taskData.notes || ''
          };
          tasks.push(task);
        }
      }

      console.log(`📋 Extracted ${tasks.length} tasks from JSON: ${path.basename(jsonPath)}`);
      return tasks;

    } catch (error) {
      console.error(`Error extracting tasks from ${jsonPath}:`, error);
      return [];
    }
  }
}