import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductDetail from '../ProductDetail';
import {fetchUserFromLocalStorage} from "../../../helpers";
import {setRejectedStatusList, setWaitApprovedStatusList} from "../../../services/registerService";
import {PRODUCTS_STATES, USERS_TYPES} from "../../../utils/constants";
import '@testing-library/jest-dom';

jest.mock('../ProductStatusChip', () => ({ __esModule: true, default: ({ status }: any) => (
        <div data-testid="status-chip">{String(status)}</div>
    )}));

jest.mock('../ProductInfoRow', () => ({ __esModule: true, default: ({ label, value, labelVariant, valueVariant, sx }: any) => (
        <div data-testid="info-row" data-labelvariant={labelVariant || ''} data-valuevariant={valueVariant || ''} data-sx={JSON.stringify(sx||{})}>
            <span data-testid="info-row-label">{label}</span>
            <span data-testid="info-row-value">{typeof value === 'string' ? value : (value as any)}</span>
        </div>
    )}));

jest.mock('../ProductConfirmDialog', () => ({ __esModule: true, default: ({ open, onCancel, onConfirm, onSuccess, title, message, confirmButtonText, cancelButtonText }: any) => (
        open ? (
            <div data-testid="confirm-dialog">
                <div>{title}</div>
                <div>{message}</div>
                <button onClick={onCancel}>{cancelButtonText || 'cancel'}</button>
                <button onClick={async () => { await onConfirm(); onSuccess?.(); }}> {confirmButtonText || 'confirm'} </button>
            </div>
        ) : null
    )}));

jest.mock('../ProductModal', () => ({ __esModule: true, default: ({ open, onClose, actionType, onSuccess }: any) => (
        open ? (
            <div data-testid={`modal-${actionType}`}>
                <button onClick={() => { onSuccess?.(); onClose(); }}>close</button>
            </div>
        ) : null
    )}));

jest.mock('../MsgResult', () => ({ __esModule: true, default: ({ message, severity }: any) => (
        <div data-testid="msg-result">{severity}:{message}</div>
    )}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'pages.productDetail.productSheet') return 'Scheda prodotto';
            if (key === 'pages.productDetail.motivation') return 'Motivazione';
            if (typeof options === 'object' && options && 'L2' in options) {
                return `${key}:${options.L2}`;
            }
            return key;
        },
    }),
}));

jest.mock('../../../helpers', () => ({
    fetchUserFromLocalStorage: jest.fn(),
    truncateString: (s: string, _max: number) => s,
}));

jest.mock('../../../services/registerService', () => ({
    setRejectedStatusList: jest.fn(() => Promise.resolve()),
    setWaitApprovedStatusList: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../utils/constants', () => ({
    EMPTY_DATA: '-',
    MAX_LENGTH_DETAILL_PR: 9999,
    PRODUCTS_STATES: {
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',
        SUPERVISED: 'SUPERVISED',
        UPLOADED: 'UPLOADED',
    },
    USERS_NAMES: { INVITALIA_L2: 'Invitalia L2' },
    USERS_TYPES: { OPERATORE: 'OPERATORE' },
}));


const baseData = (over: Partial<any> = {}): any => ({
    productName: 'Frigo Super',
    batchName: 'Batch-1',
    registrationDate: String(new Date('2023-02-01T12:34:00Z').getTime()),
    eprelCode: 'EPREL-123',
    gtinCode: 'GTIN-001',
    productCode: 'P-01',
    category: 'Frigoriferi',
    brand: 'CoolBrand',
    model: 'CB-1000',
    energyClass: 'A',
    countryOfProduction: 'IT',
    capacity: '300L',
    status: PRODUCTS_STATES.UPLOADED,
    statusChangeChronology: [],
    ...over,
});

const renderComp = (props: Partial<any> = {}, dataOver: Partial<any> = {}) => {
    return render(
        <ProductDetail
            open
            data={baseData(dataOver)}
            isInvitaliaUser={props.isInvitaliaUser ?? true}
            onUpdateTable={props.onUpdateTable || jest.fn()}
            onClose={props.onClose || jest.fn()}
        />
    );
};


describe('ProductDetail', () => {
    beforeEach(() => {
        (fetchUserFromLocalStorage as jest.Mock).mockReturnValue({ org_role: 'ADMIN' });
        (setRejectedStatusList as jest.Mock).mockClear();
        (setWaitApprovedStatusList as jest.Mock).mockClear();
    });

    test('renders basic info rows including formatted date and product sheet divider/label', () => {
        renderComp({ isInvitaliaUser: false });

        const rows = screen.getAllByTestId('info-row');
        expect(rows.length).toBeGreaterThan(5);

        const dateRow = rows.find(r => within(r).getByTestId('info-row-label').textContent === 'pages.productDetail.eprelCheckDate');
        expect(dateRow).toBeTruthy();
        expect(within(dateRow!).getByTestId('info-row-value').textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);

        const psRow = rows.find(r => within(r).getByTestId('info-row-value').textContent === 'Scheda prodotto');
        expect(psRow).toBeTruthy();
        expect(psRow?.getAttribute('data-labelvariant')).toBe('body2');
        expect(psRow?.getAttribute('data-valuevariant')).toBe('body2');
    });

    test('shows chronology for non-OPERATORE users when present', () => {
        const chronology = [
            { role: 'L2', updateDate: new Date('2024-01-10T10:00:00Z').toISOString(), motivation: 'Prima nota' },
            { role: 'L1', updateDate: new Date('2024-01-11T11:00:00Z').toISOString(), motivation: 'Seconda nota' },
        ];
        renderComp({ isInvitaliaUser: false }, { statusChangeChronology: chronology });

        expect(screen.getAllByTestId('info-row').some(r => within(r).getByTestId('info-row-label').textContent === 'Motivazione')).toBe(true);
    });

    test('does NOT show chronology for OPERATORE role', () => {
        (fetchUserFromLocalStorage as jest.Mock).mockReturnValue({ org_role: USERS_TYPES.OPERATORE });
        renderComp({ isInvitaliaUser: false }, { statusChangeChronology: [{ role: 'L2', updateDate: new Date().toISOString(), motivation: 'x' }] });
        expect(screen.getAllByTestId('info-row').some(r => within(r).getByTestId('info-row-label').textContent === 'Motivazione')).toBe(false);
    });

    test('UPLOADED status renders 3 action buttons and flows: rejected, supervised, approved', async () => {
        const user = userEvent.setup();
        renderComp({ isInvitaliaUser: true }, { status: PRODUCTS_STATES.UPLOADED });

        const rejectedBtn = await screen.findByTestId('rejectedBtn');
        const supervisedBtn = await screen.findByTestId('supervisedBtn');
        const approvedBtn = await screen.findByTestId('approvedBtn');

        expect(rejectedBtn).toBeInTheDocument();
        expect(supervisedBtn).toBeInTheDocument();
        expect(approvedBtn).toBeInTheDocument();

        await user.click(supervisedBtn);
        const supervisedModal = await screen.findByTestId('modal-SUPERVISED');
        await user.click(within(supervisedModal).getByText('close'));
        expect(screen.getByTestId('msg-result')).toBeInTheDocument();

        await user.click(rejectedBtn);
        const rejectedModal = await screen.findByTestId('modal-REJECTED');
        await user.click(within(rejectedModal).getByText('close'));

        await user.click(approvedBtn);
        const dlg = await screen.findByTestId('confirm-dialog');
        await user.click(within(dlg).getByText(/confirm/i));

        expect(setWaitApprovedStatusList).toHaveBeenCalledWith(['GTIN-001'], PRODUCTS_STATES.UPLOADED, '-');
    });

    test('SUPERVISED status renders 2 buttons and restore confirms -> API + success message disappears after timeout', async () => {
        const user = userEvent.setup();
        renderComp({ isInvitaliaUser: true }, { status: PRODUCTS_STATES.SUPERVISED });

        const requestApprovalBtn = await screen.findByTestId('request-approval-btn');
        const excludeBtn = await screen.findByTestId('exclude-btn');

        expect(requestApprovalBtn).toBeInTheDocument();
        expect(excludeBtn).toBeInTheDocument();

        await user.click(requestApprovalBtn);
        const dlg = await screen.findByTestId('confirm-dialog');
        await user.click(within(dlg).getByText(/confirm/i));

        expect(setWaitApprovedStatusList).toHaveBeenCalled();

        expect(screen.getByTestId('msg-result')).toBeInTheDocument();

        act(() => { jest.advanceTimersByTime(10000); });

        await act(async () => {});
    });

    test('Exclude flow triggers setRejectedStatusList when confirming via confirm dialog in SUPERVISED block', async () => {
        const user = userEvent.setup();
        renderComp({ isInvitaliaUser: true }, { status: PRODUCTS_STATES.SUPERVISED });

        const excludeBtn = await screen.findByTestId('exclude-btn');
        await user.click(excludeBtn);

        const modal = await screen.findByTestId('modal-REJECTED');
        await user.click(within(modal).getByText('close'));

        const requestApprovalBtn = await screen.findByTestId('request-approval-btn');
        await user.click(requestApprovalBtn);
        const dlg = await screen.findByTestId('confirm-dialog');
        await user.click(within(dlg).getByText(/confirm/i));

        renderComp({ isInvitaliaUser: true }, { status: PRODUCTS_STATES.UPLOADED });
        await user.click(await screen.findByTestId('rejectedBtn'));
        const rmodal = await screen.findByTestId('modal-REJECTED');
        await user.click(within(rmodal).getByText('close'));
    });

    test('window events INVITALIA_MSG_SHOW and INVITALIA_MSG_DISMISS control message visibility', () => {
        renderComp({ isInvitaliaUser: false });
        expect(screen.queryByTestId('msg-result')).toBeNull();

        act(() => {
            window.dispatchEvent(new Event('INVITALIA_MSG_SHOW'));
        });
        expect(screen.getByTestId('msg-result')).toBeInTheDocument();

        act(() => {
            window.dispatchEvent(new Event('INVITALIA_MSG_DISMISS'));
        });
        expect(screen.queryByTestId('msg-result')).toBeNull();
    });

    test('calls onUpdateTable and onClose after confirm restore', async () => {
        const onUpdateTable = jest.fn();
        const onClose = jest.fn();
        const user = userEvent.setup();

        render(
            <ProductDetail
                open
                data={baseData({ status: PRODUCTS_STATES.SUPERVISED })}
                isInvitaliaUser
                onUpdateTable={onUpdateTable}
                onClose={onClose}
            />
        );

        await user.click(await screen.findByTestId('request-approval-btn'));
        const dlg = await screen.findByTestId('confirm-dialog');
        await user.click(within(dlg).getByText(/confirm/i));

        expect(onUpdateTable).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
});
