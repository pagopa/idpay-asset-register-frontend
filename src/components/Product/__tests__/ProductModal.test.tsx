import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductModal from '../ProductModal';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
}));

jest.mock('../../../utils/constants', () => ({
  PRODUCTS_STATES: {
    SUPERVISED: 'SUPERVISED',
    REJECTED: 'REJECTED',
  },
  MIDDLE_STATES: {
    REJECT_APPROVATION: 'REJECT_APPROVATION',
    ACCEPT_APPROVATION: 'ACCEPT_APPROVATION',
  },
  MIN_LENGTH_TEXTFIELD_POPUP: 2,
  MAX_LENGTH_TEXTFIELD_POPUP: 200,
  EMPTY_DATA: '',
}));

jest.mock('../../../api/generated/register', () => ({
  ProductStatus: { DRAFT: 'DRAFT' },
}));

jest.mock('../../../services/registerService', () => ({
  setSupervisionedStatusList: jest.fn(),
  setRejectedStatusList: jest.fn(),
  setRestoredStatusList: jest.fn(),
  setApprovedStatusList: jest.fn(),
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => "init-test"
}))

import {
  setSupervisionedStatusList,
  setRejectedStatusList,
  setRestoredStatusList,
  setApprovedStatusList,
} from '../../../services/registerService';

const mockSetSupervisionedStatusList = setSupervisionedStatusList as unknown as jest.Mock;
const mockSetRejectedStatusList = setRejectedStatusList as unknown as jest.Mock;
const mockSetRestoredStatusList = setRestoredStatusList as unknown as jest.Mock;
const mockSetApprovedStatusList = setApprovedStatusList as unknown as jest.Mock;

type ActionType = 'SUPERVISED' | 'REJECTED' | 'REJECT_APPROVATION' | 'ACCEPT_APPROVATION';

const defaultProducts = [
  { status: 'DRAFT' as any, productName: 'A', gtinCode: '001' },
  { status: 'DRAFT' as any, productName: 'B', gtinCode: '002' },
];

const renderModal = (props?: Partial<React.ComponentProps<typeof ProductModal>>) => {
  const onClose = jest.fn();
  const onUpdateTable = jest.fn();
  const onSuccess = jest.fn();

  const defaultProps: React.ComponentProps<typeof ProductModal> = {
    open: true,
    onClose,
    actionType: 'SUPERVISED',
    onUpdateTable,
    selectedProducts: defaultProducts,
    onSuccess,
  };

  const allProps = { ...defaultProps, ...props };
  const utils = render(<ProductModal {...allProps} />);
  return { ...utils, onClose, onUpdateTable, onSuccess, props: allProps };
};

const clickConfirm = async (values: Array<string> = []) => {
  if (values.length > 0) {
    const textboxes = screen.getAllByRole('textbox');

    for (const [idx, value] of values.entries()) {
      if (textboxes[idx]) {
        await userEvent.type(textboxes[idx], value);
      }
    }
  }

  await userEvent.click(screen.getByRole('button', { name: /buttonTextConfirm/i }));
};

const expectSuccessFlow = async ({
  apiMock,
  onClose,
  onUpdateTable,
  onSuccess,
  props,
  values = [],
  expectedApiArgs,
  expectedSuccessArg,
}: {
  apiMock: jest.Mock;
  onClose: jest.Mock;
  onUpdateTable: jest.Mock;
  onSuccess: jest.Mock;
  props: React.ComponentProps<typeof ProductModal>;
  values?: Array<string>;
  expectedApiArgs: (props: React.ComponentProps<typeof ProductModal>) => Array<any>;
  expectedSuccessArg: ActionType;
}) => {
  await clickConfirm(values);

  await waitFor(() => {
    expect(apiMock).toHaveBeenCalledWith(...expectedApiArgs(props));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onUpdateTable).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(expectedSuccessArg);
  });
};

const expectErrorFlow = async ({
  onClose,
  onUpdateTable,
  onSuccess,
  values = [],
}: {
  onClose: jest.Mock;
  onUpdateTable: jest.Mock;
  onSuccess: jest.Mock;
  values?: Array<string>;
}) => {
  await clickConfirm(values);

  await waitFor(() => {
    expect(onClose).toHaveBeenCalledWith(true);
    expect(onUpdateTable).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByText('msgResutlt.errorGenericDescription')).toBeInTheDocument();
  });
};

jest.mock('../../../redux/api/initiativesApi', () => ({
  useGetInitiativesQuery: () => ({ data: [], isLoading: false }),
}));

describe('ProductModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders null if selectedProducts is missing or empty', () => {
    const { container: c1 } = render(
      <ProductModal open={true} onClose={jest.fn()} actionType="SUPERVISED" />
    );
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(
      <ProductModal open={true} onClose={jest.fn()} actionType="SUPERVISED" selectedProducts={[]} />
    );
    expect(c2.firstChild).toBeNull();
  });

  test('renders SUPERVISED modal with correct texts and char counter', () => {
    renderModal({ actionType: 'SUPERVISED' });
    expect(screen.getByText('invitaliaModal.supervised.title')).toBeInTheDocument();
    expect(screen.getByText('invitaliaModal.supervised.description')).toBeInTheDocument();
    expect(screen.getByText('invitaliaModal.supervised.listTitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttonTextConfirm/i })).toHaveTextContent('(2)');
    expect(screen.getByText('0/200')).toBeInTheDocument();
  });

  test('SUPERVISED: validation error on empty reason', async () => {
    renderModal({ actionType: 'SUPERVISED' });
    const confirm = screen.getByRole('button', { name: /buttonTextConfirm/i });
    await userEvent.click(confirm);
    expect(await screen.findByText('Campo obbligatorio')).toBeInTheDocument();
    expect(mockSetSupervisionedStatusList).not.toHaveBeenCalled();
  });

  test('SUPERVISED: char counter updates while typing', async () => {
    renderModal({ actionType: 'SUPERVISED' });
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await userEvent.type(input, 'hi');
    expect(screen.getByText('2/200')).toBeInTheDocument();
  });

  test('SUPERVISED: successful flow calls API, closes, updates table, calls onSuccess', async () => {
    mockSetSupervisionedStatusList.mockResolvedValueOnce(undefined);
    const { onClose, onUpdateTable, onSuccess, props } = renderModal({ actionType: 'SUPERVISED' });
    await expectSuccessFlow({
      apiMock: mockSetSupervisionedStatusList,
      onClose,
      onUpdateTable,
      onSuccess,
      props,
      values: ['Valid reason'],
      expectedApiArgs: (currentProps) => [
        'init-test',
        currentProps.selectedProducts!.map((p) => p.gtinCode),
        currentProps.selectedProducts![0].status,
        'Valid reason',
      ],
      expectedSuccessArg: 'SUPERVISED',
    });
  });

  test('SUPERVISED: error flow closes modal and shows generic error without success', async () => {
    mockSetSupervisionedStatusList.mockRejectedValueOnce(new Error('boom'));
    const { onClose, onUpdateTable, onSuccess } = renderModal({ actionType: 'SUPERVISED' });
    await expectErrorFlow({ onClose, onUpdateTable, onSuccess, values: ['Reason'] });
  });

  test('SUPERVISED: Cancel button calls onClose', async () => {
    const { onClose } = renderModal({ actionType: 'SUPERVISED' });
    await userEvent.click(
      screen.getByRole('button', { name: 'invitaliaModal.supervised.buttonTextCancel' })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('REJECTED: renders dedicated UI, validates both fields, calls API, closes, updates table, calls onSuccess', async () => {
    mockSetRejectedStatusList.mockResolvedValueOnce(undefined);
    const { onClose, onUpdateTable, onSuccess, props } = renderModal({
      actionType: 'REJECTED',
      selectedProducts: [{ status: 'DRAFT' as any, gtinCode: '001' }],
    });

    expect(screen.getByText('invitaliaModal.rejected.title')).toBeInTheDocument();
    await expectSuccessFlow({
      apiMock: mockSetRejectedStatusList,
      onClose,
      onUpdateTable,
      onSuccess,
      props,
      values: ['Reject reason interna', 'Motivazione formale'],
      expectedApiArgs: (currentProps) => [
        'init-test',
        currentProps.selectedProducts!.map((p) => p.gtinCode),
        currentProps.selectedProducts![0].status,
        'Reject reason interna',
        'Motivazione formale',
      ],
      expectedSuccessArg: 'REJECTED',
    });
  });

  test('REJECTED: error flow closes modal and shows generic error without success', async () => {
    mockSetRejectedStatusList.mockRejectedValueOnce(new Error('fail'));
    const { onClose, onUpdateTable, onSuccess } = renderModal({ actionType: 'REJECTED' });
    await expectErrorFlow({ onClose, onUpdateTable, onSuccess, values: ['Reason', 'Motivazione'] });
  });

  test('REJECTED: validation with spaces only shows error', async () => {
    renderModal({ actionType: 'REJECTED' });
    const textboxes = screen.getAllByRole('textbox');
    await userEvent.type(textboxes[0], '   ');
    await userEvent.type(textboxes[1], '   ');
    const confirm = screen.getByRole('button', { name: /buttonTextConfirm/i });
    await userEvent.click(confirm);

    const errors = await screen.findAllByText('Campo obbligatorio');
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  test('REJECTED: validation with less than 2 chars shows min length error', async () => {
    renderModal({ actionType: 'REJECTED' });
    const textboxes = screen.getAllByRole('textbox');
    await userEvent.type(textboxes[0], 'a');
    await userEvent.type(textboxes[1], 'b');
    const confirm = screen.getByRole('button', { name: /buttonTextConfirm/i });
    await userEvent.click(confirm);

    const errors = await screen.findAllByText('Inserire minimo 2 caratteri');
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  test('REJECTED: error on both fields shows both errors', async () => {
    renderModal({ actionType: 'REJECTED' });
    const confirm = screen.getByRole('button', { name: /buttonTextConfirm/i });
    await userEvent.click(confirm);

    const allHelperTexts = Array.from(document.querySelectorAll('p.MuiFormHelperText-root'));
    const errors = allHelperTexts.filter((el) => el.textContent === 'Campo obbligatorio');
    expect(errors).toHaveLength(2);
  });

  test('REJECT_APPROVATION: renders, validates, calls API, closes, updates table, calls onSuccess', async () => {
    mockSetRestoredStatusList.mockResolvedValueOnce(undefined);
    const { onClose, onUpdateTable, onSuccess, props } = renderModal({
      actionType: 'REJECT_APPROVATION',
      selectedProducts: [{ status: 'DRAFT' as any, gtinCode: '001' }],
    });

    expect(screen.getByText('invitaliaModal.rejectApprovation.title')).toBeInTheDocument();
    await expectSuccessFlow({
      apiMock: mockSetRestoredStatusList,
      onClose,
      onUpdateTable,
      onSuccess,
      props,
      values: ['Motivo ripristino'],
      expectedApiArgs: (currentProps) => [
        'init-test',
        currentProps.selectedProducts!.map((p) => p.gtinCode),
        currentProps.selectedProducts![0].status,
        'Motivo ripristino',
      ],
      expectedSuccessArg: 'REJECT_APPROVATION',
    });
  });

  test('REJECT_APPROVATION: validation error on empty', async () => {
    renderModal({ actionType: 'REJECT_APPROVATION' });
    const confirm = screen.getByRole('button', { name: /buttonTextConfirm/i });
    await userEvent.click(confirm);
    const errors = await screen.findAllByText('Campo obbligatorio');
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(mockSetRestoredStatusList).not.toHaveBeenCalled();
  });

  test('REJECT_APPROVATION: error flow closes modal and shows generic error without success', async () => {
    mockSetRestoredStatusList.mockRejectedValueOnce(new Error('fail'));
    const { onClose, onUpdateTable, onSuccess } = renderModal({ actionType: 'REJECT_APPROVATION' });
    await expectErrorFlow({ onClose, onUpdateTable, onSuccess, values: ['Motivo'] });
  });

  test('ACCEPT_APPROVATION: renders, calls API, closes, updates table, calls onSuccess', async () => {
    mockSetApprovedStatusList.mockResolvedValueOnce(undefined);
    const { onClose, onUpdateTable, onSuccess, props } = renderModal({
      actionType: 'ACCEPT_APPROVATION',
      selectedProducts: [{ status: 'DRAFT' as any, gtinCode: '001' }],
    });

    expect(screen.getByText('invitaliaModal.acceptApprovation.title')).toBeInTheDocument();
    await expectSuccessFlow({
      apiMock: mockSetApprovedStatusList,
      onClose,
      onUpdateTable,
      onSuccess,
      props,
      expectedApiArgs: (currentProps) => [
        'init-test',
        currentProps.selectedProducts!.map((p) => p.gtinCode),
        currentProps.selectedProducts![0].status,
        '',
      ],
      expectedSuccessArg: 'ACCEPT_APPROVATION',
    });
  });

  test('ACCEPT_APPROVATION: error flow closes modal and shows generic error without success', async () => {
    mockSetApprovedStatusList.mockRejectedValueOnce(new Error('fail'));
    const { onClose, onUpdateTable, onSuccess } = renderModal({ actionType: 'ACCEPT_APPROVATION' });
    await expectErrorFlow({ onClose, onUpdateTable, onSuccess });
  });

  test('clears stale generic error when selection is emptied before selecting again', async () => {
    mockSetApprovedStatusList.mockRejectedValueOnce(new Error('fail'));
    const { rerender, props } = renderModal({ actionType: 'ACCEPT_APPROVATION' });

    await userEvent.click(screen.getByRole('button', { name: /buttonTextConfirm/i }));

    await waitFor(() => {
      expect(screen.getByText('msgResutlt.errorGenericDescription')).toBeInTheDocument();
    });

    rerender(<ProductModal {...props} open={false} selectedProducts={[]} />);

    await waitFor(() => {
      expect(screen.queryByText('msgResutlt.errorGenericDescription')).not.toBeInTheDocument();
    });

    rerender(<ProductModal {...props} open={false} selectedProducts={defaultProducts} />);

    expect(screen.queryByText('msgResutlt.errorGenericDescription')).not.toBeInTheDocument();
  });

  test('state resets when modal reopens (open prop effect)', async () => {
    const { rerender } = render(
      <ProductModal
        open={true}
        onClose={jest.fn()}
        actionType="SUPERVISED"
        onUpdateTable={jest.fn()}
        selectedProducts={[{ status: 'DRAFT' as any, gtinCode: '001' }]}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await userEvent.type(input, 'test');
    expect(screen.getByText('4/200')).toBeInTheDocument();

    await waitFor(() => {
      rerender(
        <ProductModal
          open={false}
          onClose={jest.fn()}
          actionType="SUPERVISED"
          onUpdateTable={jest.fn()}
          selectedProducts={[{ status: 'DRAFT' as any, gtinCode: '001' }]}
        />
      );
    });

    await waitFor(() => {
      rerender(
        <ProductModal
          open={true}
          onClose={jest.fn()}
          actionType="SUPERVISED"
          onUpdateTable={jest.fn()}
          selectedProducts={[{ status: 'DRAFT' as any, gtinCode: '001' }]}
        />
      );
    });

    const inputAfter = screen.getByRole('textbox') as HTMLInputElement;
    expect(inputAfter).toHaveValue('');
    await waitFor(() => {
      const charCounter = document.querySelector('.MuiBox-root.css-1jn4ags');
      expect(charCounter).not.toBeNull();
      expect(['0/200', '2/200']).toContain(charCounter?.textContent?.replace(/\s/g, ''));
    });
  });

  test('renders without actionType: shows textbox', () => {
    renderModal({ actionType: undefined as any });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test.each([
    ['SUPERVISED', 'invitaliaModal.supervised.title'],
    ['REJECTED', 'invitaliaModal.rejected.title'],
    ['REJECT_APPROVATION', 'invitaliaModal.rejectApprovation.title'],
    ['ACCEPT_APPROVATION', 'invitaliaModal.acceptApprovation.title'],
  ] as const)('renders correct texts for %s', (actionType, title) => {
    renderModal({ actionType });
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
