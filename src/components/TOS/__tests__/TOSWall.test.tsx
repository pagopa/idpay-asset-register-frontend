import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import TOSWall from '../TOSWall';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: any) => key }),
  Trans: () => {
    return null;
  },
}));

describe('tests for TOSWall', () => {
  test('test render of TOSWall component with not already accepted tos', async () => {
    const mockAcceptTos = jest.fn();
    renderWithContext(
      <TOSWall acceptTOS={mockAcceptTos} tosRoute={''} privacyRoute={''} firstAcceptance={true} />
    );
    const acceptTosBtn = screen.getByText('Accedi');
    fireEvent.click(acceptTosBtn);
    expect(mockAcceptTos).toHaveBeenCalledTimes(1);
  });

  test('test render of TOSWall component with tos already accepted', async () => {
    renderWithContext(
      <TOSWall acceptTOS={jest.fn()} tosRoute={''} privacyRoute={''} firstAcceptance={true} />
    );
  });
});
