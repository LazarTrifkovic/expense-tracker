const fs = require('fs');
const path = require('path');

const nextDir = path.join(process.cwd(), '.next');
const exportDetailPath = path.join(nextDir, 'export-detail.json');

if (!fs.existsSync(exportDetailPath)) {
  console.log('Creating missing export-detail.json for Vercel compatibility...');
  fs.writeFileSync(exportDetailPath, JSON.stringify({
    version: 1,
    outDirectory: 'out',
    success: true
  }));
  console.log('export-detail.json created at:', exportDetailPath);
} else {
  console.log('export-detail.json already exists');
}
