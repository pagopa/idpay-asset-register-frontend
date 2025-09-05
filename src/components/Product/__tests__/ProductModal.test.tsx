import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductModal from '../ProductModal';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k }),
}));

jest.mock('../../../utils/constants', () => ({
    PRODUCTS_STATES: { SUPERVISED: 'SUPERVISED', REJECTED: 'REJECTED' },
}));

jest.mock('../../../api/generated/register/ProductStatus', () => ({
    ProductStatusEnum: { DRAFT: 'DRAFT' },
}));

jest.mock('../../../services/registerService', () => ({
    setSupervisionedStatusList: jest.fn(),
    setRejectedStatusList: jest.fn(),
}));

import {
    setSupervisionedStatusList,
    setRejectedStatusList,
} from '../../../services/registerService';

const mockSetSupervisionedStatusList = setSupervisionedStatusList as unknown as jest.Mock;
const mockSetRejectedStatusList = setRejectedStatusList as unknown as jest.Mock;

const renderModal = (props?: Partial<React.ComponentProps<typeof ProductModal>>) => {
    const onClose = jest.fn();
    const onUpdateTable = jest.fn();

    const defaultProps: React.ComponentProps<typeof ProductModal> = {
        open: true,
        onClose,
        actionType: 'SUPERVISED',
        onUpdateTable,
        selectedProducts: [
            { status: 'DRAFT' as any, productName: 'A', gtinCode: '001' },
            { status: 'DRAFT' as any, productName: 'B', gtinCode: '002' },
        ],
    };

    const allProps = { ...defaultProps, ...props };
    const utils = render(<ProductModal {...allProps} />);
    return { ...utils, onClose, onUpdateTable, props: allProps };
};

describe('ProductModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('base render (SUPERVISED): headings/descriptions and char counter', () => {
        renderModal({ actionType: 'SUPERVISED' });

        expect(screen.getByText('invitaliaModal.supervised.title')).toBeInTheDocument();
        expect(screen.getByText('invitaliaModal.supervised.description')).toBeInTheDocument();
        expect(screen.getByText('invitaliaModal.supervised.listTitle')).toBeInTheDocument();

        expect(
            screen.getByRole('button', { name: /invitaliaModal\.supervised\.buttonTextConfirm/i })
        ).toHaveTextContent('(2)');

        expect(screen.getByText('0/200')).toBeInTheDocument();
    });

    test('validation: rejects empty reason on supervised confirm', async () => {
        renderModal({ actionType: 'SUPERVISED' });

        const confirm = screen.getByRole('button', { name: /buttonTextConfirm/i });
        await userEvent.click(confirm);

        expect(await screen.findByText('Campo obbligatorio')).toBeInTheDocument();

        expect(mockSetSupervisionedStatusList).not.toHaveBeenCalled();
    });

    test('char counter updates while typing', async () => {
        renderModal({ actionType: 'SUPERVISED' });
        const input = screen.getByRole('textbox') as HTMLInputElement;
        await userEvent.type(input, 'hi');
        expect(screen.getByText('2/200')).toBeInTheDocument();
    });

    test('successful SUPERVISED flow: calls API with mapped gtins and status, then closes and updates table', async () => {
        mockSetSupervisionedStatusList.mockResolvedValueOnce(undefined);

        const { onClose, onUpdateTable, props } = renderModal({ actionType: 'SUPERVISED' });

        const input = screen.getByRole('textbox') as HTMLInputElement;
        await userEvent.type(input, 'Valid reason');

        const confirm = screen.getByRole('button', { name: /buttonTextConfirm/i });
        await userEvent.click(confirm);

        await waitFor(() => {
            expect(mockSetSupervisionedStatusList).toHaveBeenCalledWith(
                props.selectedProducts!.map(p => p.gtinCode),
                props.selectedProducts![0].status,
                'Valid reason'
            );
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(onUpdateTable).toHaveBeenCalledTimes(1);
        });
    });

    test('error SUPERVISED flow: closes but does not update table', async () => {
        mockSetSupervisionedStatusList.mockRejectedValueOnce(new Error('boom'));
        const { onClose, onUpdateTable } = renderModal({ actionType: 'SUPERVISED' });

        await userEvent.type(screen.getByRole('textbox'), 'Reason');
        await userEvent.click(screen.getByRole('button', { name: /buttonTextConfirm/i }));

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(onUpdateTable).not.toHaveBeenCalled();
        });
    });


    test('Cancel button and Close icon: call onClose and onUpdateTable', async () => {
        const { onClose, onUpdateTable } = renderModal({ actionType: 'SUPERVISED' });

        await userEvent.click(
            screen.getByRole('button', { name: 'invitaliaModal.supervised.buttonTextCancel' })
        );
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onUpdateTable).toHaveBeenCalledTimes(1);

        await userEvent.click(screen.getByRole('button', { name: /close/i }));
        expect(onClose).toHaveBeenCalledTimes(2);
        expect(onUpdateTable).toHaveBeenCalledTimes(2);
    });

    test('REJECTED branch: dedicated UI and setRejectedStatusList call', async () => {
        mockSetRejectedStatusList.mockResolvedValueOnce(undefined);

        const { onClose, onUpdateTable, props } = renderModal({
            actionType: 'REJECTED',
            selectedProducts: [{ status: 'DRAFT' as any, gtinCode: '001' }],
        });

        expect(screen.getByText('invitaliaModal.rejected.title')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();

        await userEvent.type(screen.getByRole('textbox'), 'Reject reason');
        await userEvent.click(
            screen.getByRole('button', { name: 'invitaliaModal.rejected.buttonTextConfirm' })
        );

        await waitFor(() => {
            expect(mockSetRejectedStatusList).toHaveBeenCalledWith(
                props.selectedProducts!.map(p => p.gtinCode),
                props.selectedProducts![0].status,
                'Reject reason'
            );
            expect(onClose).toHaveBeenCalled();
            expect(onUpdateTable).toHaveBeenCalled();
        });
    });

    test('error REJECTED flow: closes but does not update table', async () => {
        mockSetRejectedStatusList.mockRejectedValueOnce(new Error('fail'));
        const { onClose, onUpdateTable } = renderModal({ actionType: 'REJECTED' });

        await userEvent.type(screen.getByRole('textbox'), 'Reason');
        await userEvent.click(
            screen.getByRole('button', { name: 'invitaliaModal.rejected.buttonTextConfirm' })
        );

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(2);
            expect(onUpdateTable).not.toHaveBeenCalled();
        });
    });

    test('validation with spaces only: sets touched and shows error', async () => {
        renderModal({ actionType: 'REJECTED' });
        await userEvent.type(screen.getByRole('textbox'), '   ');
        await userEvent.click(
            screen.getByRole('button', { name: 'invitaliaModal.rejected.buttonTextConfirm' })
        );
        expect(await screen.findByText('Campo obbligatorio')).toBeInTheDocument();
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

        rerender(
            <ProductModal
                open={false}
                onClose={jest.fn()}
                actionType="SUPERVISED"
                onUpdateTable={jest.fn()}
                selectedProducts={[{ status: 'DRAFT' as any, gtinCode: '001' }]}
            />
        );

        rerender(
            <ProductModal
                open={true}
                onClose={jest.fn()}
                actionType="SUPERVISED"
                onUpdateTable={jest.fn()}
                selectedProducts={[{ status: 'DRAFT' as any, gtinCode: '001' }]}
            />
        );

        const inputAfter = screen.getByRole('textbox') as HTMLInputElement;
        expect(inputAfter).toHaveValue('');
        expect(screen.getByText('0/200')).toBeInTheDocument();
    });


    test('returns null when selectedProducts is missing or empty', () => {
        const { container: c1 } = render(
            <ProductModal open={true} onClose={jest.fn()} actionType="SUPERVISED" />
        );
        expect(c1.firstChild).toBeNull();

        const { container: c2 } = render(
            <ProductModal
                open={true}
                onClose={jest.fn()}
                actionType="SUPERVISED"
                selectedProducts={[]}
            />
        );
        expect(c2.firstChild).toBeNull();
    });

    test('renders without actionType: shows textbox', () => {
        renderModal({ actionType: undefined as any });
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
});
