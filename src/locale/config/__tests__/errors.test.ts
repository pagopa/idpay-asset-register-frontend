/// <reference types="jest" />

import { InitiativeNotFoundError } from '../errors';

describe('InitiativeNotFoundError', () => {
  it('should create an error with correct name and message', () => {
    const error = new InitiativeNotFoundError('./it/test/');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('InitiativeNotFoundError');
    expect(error.message).toBe('Initiative config not found at ./it/test/');
  });
});
