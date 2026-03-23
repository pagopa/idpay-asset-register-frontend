const regexReplace = require("regex-replace");

regexReplace(
  'readonly sort\\?: array;',
  'readonly sort?: Array<string>;',
  'src/api/generated/register/requestTypes.ts',
  { fileContentsOnly: true }
);

const fs = require("fs");
const path = require("path");

const clientFile = path.resolve(__dirname, "../../src/api/generated/register/client.ts");
let content = fs.readFileSync(clientFile, "utf8");

content = content.replace(
  /body: \(\{ \["category"\]: category \}\) => category\.uri,/g,
  'body: ({ ["category"]: category }) => category,'
);

// Normalize optional header names that might be generated with a trailing `?` in the key
// (this happens when the spec contains `x-organization-selected?` instead of `x-organization-selected`)
content = content.replace(/"x-organization-selected\?"/g, '"x-organization-selected"');

// If the spec marks `x-organization-selected` as optional, the generated requestTypes will
// correctly type it as optional, but some generators still emit a required parameter type
// in the headers producer. Fix the produced signature to accept an optional value.
content = content.replace(
  /"x-organization-selected"\]: xOrganizationSelected_([\s\S]*?)"x-organization-selected": string;/g,
  '"x-organization-selected"]: xOrganizationSelected_$1"x-organization-selected"?: string;'
);

fs.writeFileSync(clientFile, content);

// Some environments/tools may emit wrong file extensions (eg. `.tsX` instead of `.ts`)
// which breaks TS module resolution on Linux (Azure pipelines).
// Normalize those extensions in the generated folder.
const generatedDir = path.resolve(
  __dirname,
  "../../src/api/generated/register"
);

if (fs.existsSync(generatedDir)) {
  for (const entry of fs.readdirSync(generatedDir)) {
    if (entry.endsWith(".tsX")) {
      const from = path.join(generatedDir, entry);
      const to = path.join(generatedDir, entry.slice(0, -1)); // -> .ts
      fs.renameSync(from, to);
    }
  }
}
