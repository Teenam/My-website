import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '../public/config.json');

// Get commit count
let commitCount = '0';
try {
    commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim();
} catch (error) {
    console.warn('⚠️ Could not get git commit count, defaulting to 0');
}

// Calculate version based on commits
// v1.0.0 starts at commit 1
// Every 10 commits = minor version bump
// Every 100 commits = major version bump
const count = parseInt(commitCount) || 0;
const major = Math.floor(count / 100) + 1;
const minor = Math.floor((count % 100) / 10);
const patch = count % 10;

const version = `v${major}.${minor}.${patch}`;

// Read and update config
let config = {};
try {
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
} catch (e) {
    console.warn('⚠️ Could not read config.json, creating new one');
}

config.version = version;

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log(`✅ Updated version to ${version} (${count} commits)`);
