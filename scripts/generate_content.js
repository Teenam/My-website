import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../public/content');
const outputFile = path.join(__dirname, '../public/content.json');

function scanDirectory(dirPath) {
    const folders = [];

    try {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory() && !item.startsWith('.')) {
                const files = fs.readdirSync(itemPath)
                    .filter(file => !file.startsWith('.'))
                    .sort();

                folders.push({
                    name: item,
                    files: files
                });
            }
        }
    } catch (error) {
        console.error('Error scanning directory:', error);
        process.exit(1);
    }

    return folders;
}

const content = scanDirectory(contentDir);

fs.writeFileSync(outputFile, JSON.stringify(content, null, 2));

console.log(`✅ Generated content.json with ${content.length} folders`);
content.forEach(folder => {
    console.log(`   📁 ${folder.name} (${folder.files.length} files)`);
});
