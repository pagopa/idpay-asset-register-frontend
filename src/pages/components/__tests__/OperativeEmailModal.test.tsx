import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import OperativeEmailModal from '../OperativeEmailModal';

const mockTranslations = {
  'pages.overview.operativeEmailModal.emailLabel': 'Inserisci e-mail',
  'pages.overview.operativeEmailModal.emailPlaceholder': 'Inserisci e-mail',
  'pages.overview.operativeEmailModal.emailAriaLabel': 'E-mail',
  'pages.overview.operativeEmailModal.confirmEmailLabel': 'Conferma e-mail',
  'pages.overview.operativeEmailModal.confirmEmailPlaceholder': 'Conferma e-mail',
  'pages.overview.operativeEmailModal.confirmEmailAriaLabel': 'Conferma e-mail',
  'pages.overview.operativeEmailModal.saveButton': 'Salva',
  'pages.overview.operativeEmailModal.requiredError': 'Campo obbligatorio',
  'pages.overview.operativeEmailModal.invalidEmailError':
    'Inserisci un indirizzo e-mail valido',
  'pages.overview.operativeEmailModal.emailMismatchError': 'Le e-mail non coincidono',
};

const mockT = (key: string) => mockTranslations[key as keyof typeof mockTranslations] ?? key;

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: mockT,
    isLoading: false,
  }),
}));

const renderModal = (props?: Partial<React.ComponentProps<typeof OperativeEmailModal>>) => {
  const defaultProps: React.ComponentProps<typeof OperativeEmailModal> = {
    open: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  return {
    props: { ...defaultProps, ...props },
    ...render(<OperativeEmailModal {...defaultProps} {...props} />),
  };
};

describe('OperativeEmailModal', () => {
  it('shows required errors for empty fields', async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Salva' }));

    expect(screen.getAllByText('Campo obbligatorio')).toHaveLength(2);
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('shows email format errors for invalid emails', async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.type(screen.getByLabelText('E-mail'), 'not-email');
    await user.type(screen.getByLabelText('Conferma e-mail'), 'still-not-email');
    await user.click(screen.getByRole('button', { name: 'Salva' }));

    expect(screen.getAllByText('Inserisci un indirizzo e-mail valido')).toHaveLength(2);
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('prefills only the first email field when an initial email is provided', () => {
    renderModal({ initialEmail: 'current@example.com' });

    expect(screen.getByLabelText('E-mail')).toHaveValue('current@example.com');
    expect(screen.getByLabelText('Conferma e-mail')).toHaveValue('');
  });

  it('rejects emails that do not match the backend pattern', async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.type(screen.getByLabelText('E-mail'), 'name@example.c');
    await user.type(screen.getByLabelText('Conferma e-mail'), 'name@example.c');
    await user.click(screen.getByRole('button', { name: 'Salva' }));

    expect(screen.getAllByText('Inserisci un indirizzo e-mail valido')).toHaveLength(2);
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('shows mismatch error when emails are different', async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.type(screen.getByLabelText('E-mail'), 'one@example.com');
    await user.type(screen.getByLabelText('Conferma e-mail'), 'two@example.com');
    await user.click(screen.getByRole('button', { name: 'Salva' }));

    expect(screen.getByText('Le e-mail non coincidono')).toBeInTheDocument();
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('saves the trimmed email when both fields are valid and matching', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    renderModal({ onSave });

    await user.type(screen.getByLabelText('E-mail'), ' test@example.com ');
    await user.type(screen.getByLabelText('Conferma e-mail'), ' test@example.com ');
    await user.click(screen.getByRole('button', { name: 'Salva' }));

    expect(onSave).toHaveBeenCalledWith('test@example.com');
  });

  it('accepts emails with characters allowed by the backend pattern', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    renderModal({ onSave });

    await user.type(screen.getByLabelText('E-mail'), 'test+name_1.2@example-domain.sub.it');
    await user.type(
      screen.getByLabelText('Conferma e-mail'),
      'test+name_1.2@example-domain.sub.it'
    );
    await user.click(screen.getByRole('button', { name: 'Salva' }));

    expect(onSave).toHaveBeenCalledWith('test+name_1.2@example-domain.sub.it');
  });
});
