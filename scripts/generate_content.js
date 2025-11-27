const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '../content');
const outputFile = path.join(__dirname, '../content.json');

const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const getFiles = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => !dirent.isDirectory() && !dirent.name.startsWith('.')) // Ignore hidden files
    .map(dirent => dirent.name);

try {
    if (!fs.existsSync(contentDir)){
        fs.mkdirSync(contentDir);
        console.log('Created content directory.');
    }

    const folders = getDirectories(contentDir);
    const content = folders.map(folder => {
        const folderPath = path.join(contentDir, folder);
        const files = getFiles(folderPath);
        return {
            name: folder,
            files: files
        };
    });

    fs.writeFileSync(outputFile, JSON.stringify(content, null, 2));
    console.log(`Successfully generated content.json with ${content.length} folders.`);

} catch (err) {
    console.error('Error generating content:', err);
}
