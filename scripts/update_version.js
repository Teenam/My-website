import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '../public/config.json');

// Get commit count
const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim();

// Calculate version based on commits
// v1.0.0 starts at commit 1
// Every 10 commits = minor version bump
// Every 100 commits = major version bump
const major = Math.floor(parseInt(commitCount) / 100) + 1;
const minor = Math.floor((parseInt(commitCount) % 100) / 10);
const patch = parseInt(commitCount) % 10;

const version = `v${major}.${minor}.${patch}`;

// Read and update config
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
config.version = version;

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log(`✅ Updated version to ${version} (${commitCount} commits)`);
