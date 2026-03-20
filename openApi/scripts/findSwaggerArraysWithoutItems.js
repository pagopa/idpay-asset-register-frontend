/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const swaggerPath = 'openApi/generated/register-swagger20.json';

if (!fs.existsSync(swaggerPath)) {
  console.error(`File not found: ${swaggerPath}`);
  process.exit(1);
}

const json = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

const bad = [];

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function walk(node, path) {
  if (isPlainObject(node)) {
    if (node.type === 'array') {
      const items = node.items;
      const missing = items === undefined;
      const emptyObj = isPlainObject(items) && Object.keys(items).length === 0;
      if (missing || emptyObj) {
        bad.push(path);
      }
    }

    for (const k of Object.keys(node)) {
      walk(node[k], `${path}.${k}`);
    }
  } else if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      walk(node[i], `${path}[${i}]`);
    }
  }
}

walk(json, '$');

console.log(`arrays with missing/empty items: ${bad.length}`);
for (const p of bad) {
  console.log(p);
}
