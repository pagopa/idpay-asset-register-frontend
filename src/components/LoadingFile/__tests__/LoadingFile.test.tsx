import React from 'react';
import { renderWithContext } from '../../../utils/test-utils';
import LoadingFile from '../LoadingFile';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for LoadingFile', () => {
  test('render LoadingFile', () => {
    renderWithContext(<LoadingFile message="message" />);
  });
});
