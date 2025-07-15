import { render, screen, waitFor } from '@testing-library/react';
import withLogin from '../withLogin';
import { useSelector } from 'react-redux';
import { useLogin } from '../../hooks/useLogin';
import useLoading from '@pagopa/selfcare-common-frontend/lib/hooks/useLoading';
import '@testing-library/jest-dom';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('../../hooks/useLogin', () => ({
  useLogin: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useLoading', () => jest.fn());

const DummyComponent = () => <div data-testid="dummy">Contenuto protetto</div>;
const WrappedComponent = withLogin(DummyComponent);

describe('withLogin HOC', () => {
  const mockSetLoading = jest.fn();
  const mockAttemptSilentLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLogin as jest.Mock).mockReturnValue({
      attemptSilentLogin: mockAttemptSilentLogin,
    });
    (useLoading as jest.Mock).mockReturnValue(mockSetLoading);
  });

  test('non mostra il componente se user è null e chiama attemptSilentLogin', async () => {
    (useSelector as jest.Mock).mockReturnValue(null);

    render(<WrappedComponent />);

    expect(screen.queryByTestId('dummy')).not.toBeInTheDocument();
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    await waitFor(() => {
      expect(mockAttemptSilentLogin).toHaveBeenCalled();
    });
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  test('mostra il componente se user è presente', () => {
    (useSelector as jest.Mock).mockReturnValue({ name: 'Mario Rossi' });

    render(<WrappedComponent />);

    expect(screen.getByTestId('dummy')).toBeInTheDocument();
    expect(mockAttemptSilentLogin).not.toHaveBeenCalled();
  });
});
