/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const swaggerPath = 'openApi/generated/register-swagger20.json';
const json = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

const bad = [];

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function itemsLooksBad(items) {
  // missing handled outside
  if (items === null) return true;
  if (!isPlainObject(items)) return false;

  // Empty object
  if (Object.keys(items).length === 0) return true;

  // items: { type: "" } or missing both type and $ref
  if ('type' in items) {
    const t = items.type;
    if (typeof t !== 'string' || t.trim() === '') return true;
  }

  const hasType = typeof items.type === 'string' && items.type.trim() !== '';
  const hasRef = typeof items.$ref === 'string' && items.$ref.trim() !== '';

  if (!hasType && !hasRef) return true;

  // Swagger 2 items should not contain oneOf/anyOf (codegen often can't handle)
  if ('oneOf' in items || 'anyOf' in items || 'allOf' in items) return true;

  return false;
}

function walk(node, path) {
  if (isPlainObject(node)) {
    if (node.type === 'array') {
      const items = node.items;
      if (items === undefined) {
        bad.push({ path, reason: 'missing items' });
      } else if (itemsLooksBad(items)) {
        bad.push({ path, reason: 'bad items', items });
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

console.log(`bad arrays: ${bad.length}`);
for (const b of bad) {
  console.log(`${b.path} -> ${b.reason}`);
  if (b.items) console.log(JSON.stringify(b.items));
}
