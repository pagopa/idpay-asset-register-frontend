class SchemaError extends Error {
  constructor(issues = []) {
    super(issues[0]?.message ?? 'Schema validation failed');
    this.name = 'SchemaError';
    this.issues = issues;
  }
}

const getDotPath = (issue) => {
  if (!issue?.path?.length) {
    return null;
  }

  return issue.path
    .map((item) => (typeof item === 'object' ? item.key : item))
    .filter((key) => typeof key === 'string' || typeof key === 'number')
    .join('.');
};

module.exports = {
  SchemaError,
  getDotPath,
};
