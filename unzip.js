const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const sourceDir = path.join(__dirname, 'Downloaded_Worlds');
const destDir = path.join(process.env.APPDATA, '.minecraft', 'saves');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.readdirSync(sourceDir).forEach(file => {
    if (file.endsWith('.zip')) {
        const zipPath = path.join(sourceDir, file);
        const extractPath = path.join(destDir, path.basename(file, '.zip'));
        console.log(`Extracting ${file} to ${extractPath}`);
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);
    }
});