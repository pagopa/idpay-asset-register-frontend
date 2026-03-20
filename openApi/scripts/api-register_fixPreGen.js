// eslint-disable-next-line
const regexReplace = require('regex-replace');

regexReplace(
  '"items": \\{\\},',
  '"items":{"type": "object"},',
  'openApi/generated/register-swagger20.json',
  {
    fileContentsOnly: true,
  }
);

/**
 * Some conversions produce arrays without `items` at all, e.g.:
 *   { "type": "array", ... }
 * which breaks @pagopa/openapi-codegen-ts generation (it emits `t.readonlyArray(t., ...)`).
 *
 * This patch adds a default `items` definition when missing.
 *
 * Note: we need to handle both pretty-printed JSON and minified JSON, so we patch:
 * - `"type": "array"` (with spaces)
 * - `"type":"array"` (no spaces)
 */
regexReplace(
  '"type": "array"',
  '"type": "array","items":{"type":"object"}',
  'openApi/generated/register-swagger20.json',
  {
    fileContentsOnly: true,
  }
);

regexReplace(
  '"type":"array"',
  '"type":"array","items":{"type":"object"}',
  'openApi/generated/register-swagger20.json',
  {
    fileContentsOnly: true,
  }
);

/**
 * Some arrays have `items` but the object is missing both `type` and `$ref`
 * (it only contains `properties`), e.g.:
 *   "items": { "properties": { ... } }
 * This also breaks generation of the io-ts codec (it can’t infer the item codec name).
 *
 * Fix: wrap it as an anonymous object schema: `items: { type: "object", properties: ... }`
 */
regexReplace(
  '"items":{"properties":',
  '"items":{"type":"object","properties":',
  'openApi/generated/register-swagger20.json',
  {
    fileContentsOnly: true,
  }
);

regexReplace(
  '"items": {"properties":',
  '"items": {"type":"object","properties":',
  'openApi/generated/register-swagger20.json',
  {
    fileContentsOnly: true,
  }
);

regexReplace(
  '"rewardRule": \\{\\},',
  '"rewardRule":{"type": "object"},',
  'openApi/generated/register-swagger20.json',
  {
    fileContentsOnly: true,
  }
);

regexReplace(
  '"operationId": "returns-fixed-automated-criteria",',
  '"operationId":"returnsFixedAutomatedCriteria",',
  'openApi/generated/register-swagger20.json',
  {
    fileContentsOnly: true,
  }
);
