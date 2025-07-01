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

fs.writeFileSync(clientFile, content);
