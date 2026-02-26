const fs = require('fs');
const path = require('path');

const nextDir = path.join(process.cwd(), '.next');
const exportDetailPath = path.join(nextDir, 'export-detail.json');

if (!fs.existsSync(exportDetailPath)) {
  console.log('Creating missing export-detail.json for Vercel compatibility...');
  fs.writeFileSync(exportDetailPath, JSON.stringify({
    version: 1,
    outDirectory: path.resolve(process.cwd(), 'out'),
    success: true
  }));
  console.log('export-detail.json created at:', exportDetailPath);
  console.log('outDirectory set to:', path.resolve(process.cwd(), 'out'));

  // Also create the out directory
  const outDir = path.resolve(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    console.log('Created out directory at:', outDir);
  }
} else {
  console.log('export-detail.json already exists');
}
