#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const rules = require('./rules/deceptive-patterns');

const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css'];

function scanFile(filePath) {
  const results = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    rules.forEach(rule => {
      if (rule.regex.test(line)) {
        const analysis = rule.analyze ? rule.analyze(filePath, idx + 1) : null;
        results.push({
          file: filePath,
          line: idx + 1,
          pattern: rule.name,
          description: rule.description,
          match: line.trim(),
          analysis: analysis
        });
      }
    });
  });
  return results;
}

function scanDirectory(dirPath) {
  let results = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanDirectory(fullPath));
    } else if (SUPPORTED_EXTENSIONS.includes(path.extname(entry.name))) {
      results = results.concat(scanFile(fullPath));
    }
  });
  return results;
}

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

function getAuthenticatedRepoUrl(repoUrl, token) {
  // Only modify if using HTTPS and token is set
  if (!token) return repoUrl;
  if (!repoUrl.startsWith('https://')) return repoUrl;
  // Insert token after https://
  return repoUrl.replace('https://', `https://${token}@`);
}

function main() {
  const args = process.argv.slice(2);
  let target = args[0];
  let isGithub = false;
  let tempDir = null;

  if (args[0] === '--github' && args[1]) {
    isGithub = true;
    let repoUrl = args[1];
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      repoUrl = getAuthenticatedRepoUrl(repoUrl, token);
      console.log('Using GITHUB_TOKEN for authentication.');
    }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'humane-linter-'));
    console.log(`Cloning ${args[1]} to ${tempDir}...`);
    try {
      execSync(`git clone --depth 1 ${repoUrl} ${tempDir}`, { stdio: 'inherit' });
    } catch (err) {
      console.error('Failed to clone repository:', err.message);
      process.exit(1);
    }
    target = tempDir;
  }

  if (!target) {
    console.error('Usage: node index.js <path-to-scan> OR node index.js --github <repo-url>');
    process.exit(1);
  }
  const absPath = path.resolve(target);
  if (!fs.existsSync(absPath)) {
    console.error('Path does not exist:', absPath);
    process.exit(1);
  }

  let results = [];
  if (fs.lstatSync(absPath).isDirectory()) {
    results = scanDirectory(absPath);
  } else {
    results = scanFile(absPath);
  }

  // Console output
  if (results.length === 0) {
    console.log('✅ No dark patterns detected!');
  } else {
    console.log(`\nFound ${results.length} potential dark pattern(s):\n`);
    results.forEach(r => {
      console.log(`- [${r.pattern}] ${r.description}\n  File: ${r.file}\n  Line: ${r.line}\n  Match: ${r.match}`);
      if (r.analysis && r.analysis.details) {
        console.log('  Details:');
        Object.entries(r.analysis.details).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            console.log(`    - ${key}: ${value ? 'Yes' : 'No'}`);
          }
        });
      }
      console.log('');
    });
  }

  // Create reports directory structure
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Determine project name for folder
  let projectName = 'Unknown';
  if (isGithub && args[1]) {
    // Extract repo name from GitHub URL
    const repoMatch = args[1].match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (repoMatch) {
      projectName = `${repoMatch[1]}/${repoMatch[2]}`;
    }
  } else {
    // Use the directory name or file name
    projectName = path.basename(absPath);
  }

  // Create project-specific directory
  const projectDir = path.join(reportsDir, projectName);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  // Write JSON report with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(projectDir, `humane-linter-report-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nReport written to ${reportPath}`);

  // Clean up temp dir if used
  if (isGithub && tempDir) {
    console.log(`Cleaning up temporary directory: ${tempDir}`);
    deleteFolderRecursive(tempDir);
  }
}

main();
