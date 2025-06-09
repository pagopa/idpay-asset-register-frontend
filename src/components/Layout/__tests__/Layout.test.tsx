import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import Layout from '../Layout';

jest.mock('../../../services/rolePermissionService');

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for Layout', () => {
  test('Test render Layout', () => {
    renderWithContext(<Layout children={<div />} />);
  });
});
