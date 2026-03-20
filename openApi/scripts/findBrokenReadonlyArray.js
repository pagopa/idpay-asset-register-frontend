/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const dir = path.resolve('src/api/generated/register');

if (!fs.existsSync(dir)) {
  console.error(`Dir not found: ${dir}`);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts'));

const patterns = [
  /t\.readonlyArray\(\s*t\.\s*,/g, // t.readonlyArray(t., ...)
  /t\.readonlyArray\(\s*t\.\s*\)/g, // t.readonlyArray(t.)
  /t\.readonlyArray\(\s*t\.\s*"/g, // t.readonlyArray(t."... (any other weirdness)
];

let found = 0;

for (const f of files) {
  const p = path.join(dir, f);
  const c = fs.readFileSync(p, 'utf8');

  for (const re of patterns) {
    if (re.test(c)) {
      console.log(`BROKEN in ${p} (pattern ${re})`);
      found++;
      break;
    }
  }
}

console.log(`broken files: ${found}`);
