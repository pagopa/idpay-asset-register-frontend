import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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
const emailLabel = mockTranslations['pages.overview.operativeEmailModal.emailAriaLabel'];
const confirmEmailLabel =
  mockTranslations['pages.overview.operativeEmailModal.confirmEmailAriaLabel'];
const saveButtonName = mockTranslations['pages.overview.operativeEmailModal.saveButton'];
const invalidEmailError =
  mockTranslations['pages.overview.operativeEmailModal.invalidEmailError'];
const requiredError = mockTranslations['pages.overview.operativeEmailModal.requiredError'];
const mismatchError = mockTranslations['pages.overview.operativeEmailModal.emailMismatchError'];

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: mockT,
    isLoading: false,
  }),
}));

jest.mock('../../../hooks/useInitiativeConfig', () => {
  const defaultConfig = jest.requireActual('../../../locale/it/default/config.json');

  return {
    useInitiativeConfig: () => ({
      config: {
        validation: defaultConfig.validation,
      },
      loading: false,
      configError: undefined,
    }),
  };
});

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

const getEmailInput = () => screen.getByLabelText(emailLabel);
const getConfirmEmailInput = () => screen.getByLabelText(confirmEmailLabel);
const getSaveButton = () => screen.getByRole('button', { name: saveButtonName });

const fillEmailsAndSave = async (
  user: ReturnType<typeof userEvent.setup>,
  email: string,
  confirmEmail: string
) => {
  await user.type(getEmailInput(), email);
  await user.type(getConfirmEmailInput(), confirmEmail);
  await user.click(getSaveButton());
};

describe('OperativeEmailModal', () => {
  it('shows required errors for empty fields', async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.click(getSaveButton());

    expect(screen.getAllByText(requiredError)).toHaveLength(2);
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('shows email format errors for invalid emails', async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await fillEmailsAndSave(user, 'not-email', 'still-not-email');

    expect(screen.getAllByText(invalidEmailError)).toHaveLength(2);
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('prefills only the first email field when an initial email is provided', () => {
    renderModal({ initialEmail: 'current@example.com' });

    expect(getEmailInput()).toHaveValue('current@example.com');
    expect(getConfirmEmailInput()).toHaveValue('');
  });

  it.each([
    'name@example.c',
    '.name@example.com',
    'name.@example.com',
    'na..me@example.com',
    'name,part@example.com',
  ])('rejects email that does not match the backend pattern: %s', async (invalidEmail) => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await fillEmailsAndSave(user, invalidEmail, invalidEmail);

    expect(screen.getAllByText(invalidEmailError)).toHaveLength(2);
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('rejects an email longer than 255 characters', async () => {
    const user = userEvent.setup();
    const { props } = renderModal();
    const invalidEmail = `${'a'.repeat(244)}@example.com`;

    fireEvent.change(getEmailInput(), { target: { value: invalidEmail } });
    fireEvent.change(getConfirmEmailInput(), { target: { value: invalidEmail } });
    await user.click(getSaveButton());

    expect(screen.getAllByText(invalidEmailError)).toHaveLength(2);
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('shows mismatch error when emails are different', async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await fillEmailsAndSave(user, 'one@example.com', 'two@example.com');

    expect(screen.getByText(mismatchError)).toBeInTheDocument();
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('compares emails case-insensitively and saves the normalized email', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    renderModal({ onSave });

    await fillEmailsAndSave(user, ' Test@Example.COM ', ' test@example.com ');

    expect(onSave).toHaveBeenCalledWith('test@example.com');
  });

  it('accepts emails with characters allowed by the backend pattern', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    renderModal({ onSave });
    const validEmail = 'test+name_1-2.3@example-domain.sub.it';

    await fillEmailsAndSave(user, validEmail, validEmail);

    expect(onSave).toHaveBeenCalledWith(validEmail);
  });

  it('accepts an email exactly 255 characters long', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    renderModal({ onSave });
    const validEmail = `${'a'.repeat(243)}@example.com`;

    fireEvent.change(getEmailInput(), { target: { value: validEmail } });
    fireEvent.change(getConfirmEmailInput(), { target: { value: validEmail } });
    await user.click(getSaveButton());

    expect(onSave).toHaveBeenCalledWith(validEmail);
  });
});
