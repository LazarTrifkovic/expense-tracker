const fs = require('fs');
const path = require('path');

const exportDetailPath = path.join(process.cwd(), '.next', 'export-detail.json');

if (!fs.existsSync(exportDetailPath)) {
  console.log('Creating missing export-detail.json...');
  fs.writeFileSync(exportDetailPath, JSON.stringify({
    version: 1,
    outDirectory: 'out'
  }));
  console.log('export-detail.json created successfully');
} else {
  console.log('export-detail.json already exists');
}
