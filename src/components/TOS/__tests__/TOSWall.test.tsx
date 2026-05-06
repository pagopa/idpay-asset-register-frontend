import { fireEvent, screen } from '@testing-library/react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import TOSWall from '../TOSWall';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({ t: (key: any) => key, isLoading: false }),
}));

jest.mock('../../../utils/constants', () => ({
  I18N_MULTI_INIT_ENABLED: false,
}));

jest.mock('../../../context/initiative/InitiativeContext', () => ({
  __esModule: true,
  useInitiativeContext: () => ({ initiativeId: 'bonusElettrodomestici2025' }),
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

  test('test render of TOSWall component with tos not accepted yet', async () => {
    renderWithContext(
      <TOSWall acceptTOS={jest.fn()} tosRoute={''} privacyRoute={''} firstAcceptance={false} />
    );
  });
});
