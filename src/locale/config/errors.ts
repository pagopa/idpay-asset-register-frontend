export class InitiativeNotFoundError extends Error {
  constructor(path: string) {
    super(`Initiative config not found at ${path}`);
    this.name = 'InitiativeNotFoundError';
  }
}
