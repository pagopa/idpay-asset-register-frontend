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
import { buildNamespaceKey } from '../utils/buildNamespaceKey';

export const buildInitiativeFolderName = (displayName: string, startDate?: string): string => {
  if (!displayName || !startDate) {
    return '';
  }

  return buildNamespaceKey(displayName, startDate);
};

export const getInitiativeBasePath = (displayName: string, startDate?: string): string => {
  const folder = buildInitiativeFolderName(displayName, startDate);
  return `./it/${folder}/`;
};
