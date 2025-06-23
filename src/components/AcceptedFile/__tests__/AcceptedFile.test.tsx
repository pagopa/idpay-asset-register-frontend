import React from 'react';
import { renderWithContext } from '../../../utils/test-utils';
import AcceptedFile from '../AcceptedFile';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for AcceptedFile', () => {
  test('render AcceptedFile', () => {
    renderWithContext(
      <AcceptedFile
        fileName={'test'}
        fileDate={'24/02/2023'}
        chipLabel={'test'}
        buttonLabel={'test'}
        buttonHandler={jest.fn()}
      />
    );
  });
});
