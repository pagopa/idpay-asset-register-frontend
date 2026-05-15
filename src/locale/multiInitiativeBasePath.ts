/**
 * Resolves the technical folder name for an initiative.
 *
 * Rules:
 * - Normalize displayName to camelCase.
 * - Append the year extracted from startDate (if provided).
 * - Build the base path as: "./it/" + folderName + "/".
 *
 * Ensures deterministic, scalable, and hardcoding-free folder resolution.
 */
export const normalizeInitiativeName = (displayName: string): string =>
  displayName
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');

export const buildInitiativeFolderName = (displayName: string, startDate?: string): string => {
  const base = normalizeInitiativeName(displayName);

  if (!startDate) {
    return base;
  }

  const year = new Date(startDate).getFullYear();

  return `${base}${year}`;
};

export const getInitiativeBasePath = (displayName: string, startDate?: string): string => {
  const folder = buildInitiativeFolderName(displayName, startDate);
  return `./it/${folder}/`;
};
