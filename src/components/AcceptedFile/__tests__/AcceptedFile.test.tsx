import { fireEvent, screen } from '@testing-library/react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import AcceptedFile from '../AcceptedFile';

jest.mock('../../../utils/env', () => ({
  __esModule: true,
  ENV: {
    UPCOMING_INITIATIVE_DAY: 'xx/xx/xx',
    URL_API: {
      OPERATION: 'https://mock-api/register',
      LOGOUT: 'https://mock-api/logout',
    },
  },
}));

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for AcceptedFile', () => {
  test('render AcceptedFile', () => {
    const handleUpload = jest.fn();
    renderWithContext(
      <AcceptedFile
        fileName={'test'}
        fileDate={'24/02/2023'}
        chipLabel={'Caricato'}
        buttonLabel={'Carica'}
        buttonHandler={handleUpload}
      />
    );

    expect(screen.getByText('Caricato')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Carica' }));
    expect(handleUpload).toHaveBeenCalledTimes(1);
  });
});
