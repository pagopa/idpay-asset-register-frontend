const fs = require('fs');
const path = require('path');

const sourcePath = path.resolve(
  __dirname,
  '../../node_modules/@pagopa/selfcare-common-frontend/utils/fixSwagger20ArraySchemaDef.js'
);

const targetDir = path.resolve(__dirname);
const targetPath = path.join(targetDir, 'fixSwagger20ArraySchemaDef.cjs');

if (!fs.existsSync(sourcePath)) {
  console.error('Source helper not found at:', sourcePath);
  process.exit(1);
}

let content = fs.readFileSync(sourcePath, 'utf8');

// Transform ESM import to CommonJS if needed
content = content.replace(
  /import fs from ['"]node:fs\/promises['"];?/,
  "const fs = require('fs').promises;"
);

// Ensure target directory exists
fs.mkdirSync(targetDir, { recursive: true });

// Write transformed file as true CommonJS
fs.writeFileSync(targetPath, content);

console.log('Prepared fixSwagger20ArraySchemaDef.cjs successfully.');
