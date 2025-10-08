import { fireEvent, screen } from '@testing-library/react';
import ExitModal from '../ExitModal';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import ROUTES from '../../../routes';
import '@testing-library/jest-dom';

jest.mock('../../../utils/env', () => ({
  default: {
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
    API_TIMEOUT_MS: 5000,
  },
}));

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home'
  },
  BASE_ROUTE: '/base'
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: any) => key }),
}));

describe('<ExitModal />', () => {
  const handleCloseExitModal = jest.fn();

  it('renders without crashing', () => {
    window.scrollTo = jest.fn();
  });

  it('the modal should be in the document', async () => {
    renderWithContext(
      <ExitModal
        title="Test title"
        subtitle="test subtitle"
        openExitModal={true}
        handleCloseExitModal={handleCloseExitModal}
        backRoute={ROUTES.HOME}
      />
    );

    const modal = document.querySelector('[data-testid="exit-modal-test"') as HTMLElement;
    expect(modal).toBeInTheDocument();

    const fade = document.querySelector('[data-testid="fade-test"]') as HTMLElement;
    expect(fade).toBeInTheDocument();

    const cancelBtn = screen.getByTestId('cancel-button-test') as HTMLButtonElement;
    fireEvent.click(cancelBtn);

    const exitBtn = screen.getByTestId('exit-button-test') as HTMLButtonElement;
    fireEvent.click(exitBtn);
  });
});
