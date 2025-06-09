import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import TOSLayout from '../TOSLayout';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for TOSLayout', () => {
  test('test render TosLayout', () => {
    renderWithContext(<TOSLayout />);
  });
});
