#!/usr/bin/env node

/**
 * Auto-commit watcher for content changes
 * Watches the public/content directory and automatically commits + pushes changes
 */

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');

const WATCH_DIR = path.join(__dirname, '../public/content');
const DEBOUNCE_MS = 2000; // Wait 2 seconds after last change before committing

let timeout = null;
let pendingChanges = new Set();

console.log('🔍 Watching for content changes...');
console.log(`📁 Directory: ${WATCH_DIR}\n`);

const watcher = chokidar.watch(WATCH_DIR, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true
});

function commitAndPush() {
    if (pendingChanges.size === 0) return;

    const changes = Array.from(pendingChanges);
    pendingChanges.clear();

    try {
        console.log('\n📝 Changes detected:');
        changes.forEach(file => console.log(`   - ${file}`));

        // Regenerate content.json
        console.log('\n🔄 Regenerating content.json...');
        execSync('node scripts/generate_content.js', { stdio: 'inherit' });

        // Git add, commit, push
        console.log('📦 Staging changes...');
        execSync('git add public/content public/content.json', { stdio: 'inherit' });

        const timestamp = new Date().toISOString();
        const commitMsg = `Auto-update content (${changes.length} file${changes.length > 1 ? 's' : ''}) - ${timestamp}`;

        console.log('💾 Committing...');
        execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });

        console.log('🚀 Pushing to GitHub...');
        execSync('git push', { stdio: 'inherit' });

        console.log('✅ Successfully deployed!\n');
        console.log('🔍 Watching for more changes...\n');
    } catch (error) {
        console.error('❌ Error during auto-commit:', error.message);
    }
}

function scheduleCommit(filePath) {
    const relativePath = path.relative(WATCH_DIR, filePath);
    pendingChanges.add(relativePath);

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
        commitAndPush();
    }, DEBOUNCE_MS);
}

watcher
    .on('add', filePath => {
        console.log(`➕ File added: ${path.basename(filePath)}`);
        scheduleCommit(filePath);
    })
    .on('change', filePath => {
        console.log(`📝 File changed: ${path.basename(filePath)}`);
        scheduleCommit(filePath);
    })
    .on('unlink', filePath => {
        console.log(`🗑️  File removed: ${path.basename(filePath)}`);
        scheduleCommit(filePath);
    })
    .on('error', error => console.error(`❌ Watcher error: ${error}`));

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping watcher...');
    watcher.close();
    process.exit(0);
});
