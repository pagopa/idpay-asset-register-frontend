import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import OneTrustContentWrapper from '../OneTrustContentWrapper';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for OneTrustContentWrapper', () => {
  test('render OneTrustContentWrapper', () => {
    renderWithContext(<OneTrustContentWrapper idSelector={''} />);
  });
});
