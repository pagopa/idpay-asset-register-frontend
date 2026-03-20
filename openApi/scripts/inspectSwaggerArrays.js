/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const swaggerPath = 'openApi/generated/register-swagger20.json';

const s = fs.readFileSync(swaggerPath, 'utf8');

const typeArrayMatches = (s.match(/"type"\s*:\s*"array"/g) || []).length;
const itemsMatches = (s.match(/"items"\s*:/g) || []).length;
const emptyItemsMatches = (s.match(/"items"\s*:\s*\{\s*\}/g) || []).length;
const tReadonlyArrayMatches = (s.match(/readonlyArray/g) || []).length;

console.log({
  swaggerPath,
  typeArrayMatches,
  itemsMatches,
  emptyItemsMatches,
  tReadonlyArrayMatches,
});
