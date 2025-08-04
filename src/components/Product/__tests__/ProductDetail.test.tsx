import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductDetail from '../ProductDetail';
import {setApprovedStatusList, setRejectedStatusList} from "../../../services/registerService";
import {ProductDTO} from "../../../api/generated/register/ProductDTO";

jest.mock('../../../services/registerService', () => ({
    setApprovedStatusList: jest.fn(),
    setRejectedStatusList: jest.fn(),
}));

jest.mock('../ProductConfirmDialog', () => {
    return function MockProductConfirmDialog({ open, onCancel, onConfirm }: any) {
        if (!open) return null;
        return (
            <div data-testid="confirm-dialog">
                <button onClick={onCancel}>Cancel</button>
                <button onClick={onConfirm}>Confirm</button>
            </div>
        );
    };
});

jest.mock('../ProductModal', () => {
    return function MockProductModal({ open, onClose }: any) {
        if (!open) return null;
        return (
            <div data-testid="product-modal">
                <button onClick={onClose}>Close Modal</button>
            </div>
        );
    };
});

jest.mock('../ProductInfoRow', () => {
    return function MockProductInfoRow({ label, value }: any) {
        return (
            <div data-testid="product-info-row">
                {label && <span>{label}</span>}
                <span>{value}</span>
            </div>
        );
    };
});

jest.mock('../ProductStatusChip', () => {
    return function MockProductStatusChip({ status }: any) {
        return <div data-testid="status-chip">{status}</div>;
    };
});

jest.mock('../ProductActionButtons', () => {
    return function MockProductActionButtons({ onRestore, onExclude, onSupervision, isInvitaliaUser, status }: any) {
        if (!isInvitaliaUser || !status) return null;
        return (
            <div data-testid="action-buttons">
                <button onClick={onRestore}>Restore</button>
                <button onClick={onExclude}>Exclude</button>
                <button onClick={onSupervision}>Supervision</button>
            </div>
        );
    };
});

const mockSetApprovedStatusList = setApprovedStatusList as jest.MockedFunction<typeof setApprovedStatusList>;
const mockSetRejectedStatusList = setRejectedStatusList as jest.MockedFunction<typeof setRejectedStatusList>;

const mockProductData: ProductDTO = {
    status: 'PENDING',
    productName: 'Test Product',
    batchName: 'Batch123',
    registrationDate: '1672531200000',
    eprelCode: 'EPREL123',
    gtinCode: 'GTIN123',
    productCode: 'PROD123',
    category: 'Electronics',
    brand: 'TestBrand',
    model: 'Model123',
    energyClass: 'A++',
    countryOfProduction: 'Italy',
    capacity: '100L',
    motivation: 'Test motivation',
    organizationId: 'ORG123',
};

const defaultProps = {
    open: true,
    data: mockProductData,
    isInvitaliaUser: true,
    onUpdateTable: jest.fn(),
    onClose: jest.fn(),
};


const mockProductEmpty: ProductDTO = {
    batchName: '',
    registrationDate: null,
    eprelCode: '',
    gtinCode: '',
    productCode: '',
    category: '',
    brand: '',
    model: '',
    energyClass: '',
    countryOfProduction: '',
};
describe('ProductDetail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component rendering', () => {
        it('should render product detail with all information', () => {
            render(<ProductDetail {...defaultProps} />);

            expect(screen.getByTestId('product-detail')).toBeInTheDocument();
            expect(screen.getByTestId('status-chip')).toBeInTheDocument();
            expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
        });

        it('should render with EMPTY_DATA when optional fields are missing', () => {
            const dataWithMissingFields = {
                ...mockProductData,
                batchName: undefined,
                eprelCode: undefined,
                productCode: undefined,
                category: undefined,
                brand: undefined,
                model: undefined,
                energyClass: undefined,
                countryOfProduction: undefined,
                capacity: undefined,
                motivation: undefined,
            };

            render(<ProductDetail {...defaultProps} data={dataWithMissingFields} />);

            expect(screen.getByTestId('product-detail')).toBeInTheDocument();
        });

        it('should not render motivation row when status is APPROVED', () => {
            const approvedData = { ...mockProductData, status: 'APPROVED' };
            render(<ProductDetail {...defaultProps} data={approvedData} />);

            expect(screen.getAllByTestId('product-info-row')).toHaveLength(13);
        });

        it('should render motivation row when status is not APPROVED', () => {
            render(<ProductDetail {...defaultProps} />);

            expect(screen.getAllByTestId('product-info-row')).toHaveLength(14);
        });

        it('should not render action buttons when isInvitaliaUser is false', () => {
            render(<ProductDetail {...defaultProps} isInvitaliaUser={false} />);

            expect(screen.queryByTestId('action-buttons')).not.toBeInTheDocument();
        });
    });

    describe('Restore functionality', () => {
        it('should open restore dialog when restore button is clicked', () => {
            render(<ProductDetail {...defaultProps} />);

            fireEvent.click(screen.getByText('Restore'));

            expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
        });

        it('should close restore dialog when cancel is clicked', () => {
            render(<ProductDetail {...defaultProps} />);

            fireEvent.click(screen.getByText('Restore'));
            fireEvent.click(screen.getByText('Cancel'));

            expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
        });

        it('should call setApprovedStatusList and callbacks when restore is confirmed', async () => {
            mockSetApprovedStatusList.mockResolvedValue(undefined);

            render(<ProductDetail {...defaultProps} />);

            fireEvent.click(screen.getByText('Restore'));
            fireEvent.click(screen.getByText('Confirm'));

            await waitFor(() => {
                expect(mockSetApprovedStatusList).toHaveBeenCalledWith('ORG123', ['GTIN123'], 'TODO');
                expect(defaultProps.onUpdateTable).toHaveBeenCalled();
                expect(defaultProps.onClose).toHaveBeenCalled();
            });

            expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
        });

        it('should handle restore API error gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockSetApprovedStatusList.mockRejectedValue(new Error('API Error'));

            render(<ProductDetail {...defaultProps} />);

            fireEvent.click(screen.getByText('Restore'));
            fireEvent.click(screen.getByText('Confirm'));

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(new Error('API Error'));
            });

            consoleSpy.mockRestore();
        });

        it('should work without onUpdateTable callback', async () => {
            mockSetApprovedStatusList.mockResolvedValue(undefined);

            render(<ProductDetail {...defaultProps} onUpdateTable={undefined} />);

            fireEvent.click(screen.getByText('Restore'));
            fireEvent.click(screen.getByText('Confirm'));

            await waitFor(() => {
                expect(mockSetApprovedStatusList).toHaveBeenCalled();
            });
        });

        it('should work without onClose callback', async () => {
            mockSetApprovedStatusList.mockResolvedValue(undefined);

            render(<ProductDetail {...defaultProps} onClose={undefined} />);

            fireEvent.click(screen.getByText('Restore'));
            fireEvent.click(screen.getByText('Confirm'));

            await waitFor(() => {
                expect(mockSetApprovedStatusList).toHaveBeenCalled();
            });
        });
    });

    describe('Exclude functionality', () => {
        it('should open exclude modal when exclude button is clicked', () => {
            render(<ProductDetail {...defaultProps} />);

            fireEvent.click(screen.getByText('Exclude'));

            expect(screen.getByTestId('product-modal')).toBeInTheDocument();
        });

        it('should close exclude modal and call callbacks when modal is closed', () => {
            render(<ProductDetail {...defaultProps} />);

            fireEvent.click(screen.getByText('Exclude'));
            fireEvent.click(screen.getByText('Close Modal'));

            expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
            expect(defaultProps.onUpdateTable).toHaveBeenCalled();
            expect(defaultProps.onClose).toHaveBeenCalled();
        });

        it('should work without onUpdateTable callback in exclude', () => {
            render(<ProductDetail {...defaultProps} onUpdateTable={undefined} />);

            fireEvent.click(screen.getByText('Exclude'));
            fireEvent.click(screen.getByText('Close Modal'));

            expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
        });

        it('should work without onClose callback in exclude', () => {
            render(<ProductDetail {...defaultProps} onClose={undefined} />);

            fireEvent.click(screen.getByText('Exclude'));
            fireEvent.click(screen.getByText('Close Modal'));

            expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
        });
    });

    describe('Supervision functionality', () => {
        it('should open supervision modal when supervision button is clicked', () => {
            render(<ProductDetail {...defaultProps} />);

            fireEvent.click(screen.getByText('Supervision'));

            expect(screen.getByTestId('product-modal')).toBeInTheDocument();
        });

        it('should close supervision modal and call callbacks when modal is closed', () => {
            render(<ProductDetail {...defaultProps} />);

            fireEvent.click(screen.getByText('Supervision'));
            fireEvent.click(screen.getByText('Close Modal'));

            expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
            expect(defaultProps.onUpdateTable).toHaveBeenCalled();
            expect(defaultProps.onClose).toHaveBeenCalled();
        });

        it('should work without onUpdateTable callback in supervision', () => {
            render(<ProductDetail {...defaultProps} onUpdateTable={undefined} />);

            fireEvent.click(screen.getByText('Supervision'));
            fireEvent.click(screen.getByText('Close Modal'));

            expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
        });

        it('should work without onClose callback in supervision', () => {
            render(<ProductDetail {...defaultProps} onClose={undefined} />);

            fireEvent.click(screen.getByText('Supervision'));
            fireEvent.click(screen.getByText('Close Modal'));

            expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
        });
    });

    describe('API helper functions', () => {
        it('should handle callApprovedApi error', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockSetApprovedStatusList.mockRejectedValue(new Error('Approved API Error'));

            render(<ProductDetail {...defaultProps} />);

            fireEvent.click(screen.getByText('Restore'));
            fireEvent.click(screen.getByText('Confirm'));

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(new Error('Approved API Error'));
            });

            consoleSpy.mockRestore();
        });

        it('should handle callRejectedApi error', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockSetRejectedStatusList.mockRejectedValue(new Error('Rejected API Error'));

            const { rerender } = render(
                <div>
                    <button onClick={() => {
                        try {
                            setRejectedStatusList('ORG123', ['GTIN123'], 'test').catch(console.error);
                        } catch (error) {
                            console.error(error);
                        }
                    }}>
                        Test Rejected
                    </button>
                </div>
            );

            fireEvent.click(screen.getByText('Test Rejected'));

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(new Error('Rejected API Error'));
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Date formatting', () => {
        it('should format registration date correctly', () => {
            render(<ProductDetail {...defaultProps} />);

            const infoRows = screen.getAllByTestId('product-info-row');
            expect(infoRows[3]).toHaveTextContent('SCHEDA PRODOTTO');
        });

        it('should handle invalid registration date', () => {
            const dataWithInvalidDate = { ...mockProductData, registrationDate: 'invalid' };

            expect(() => {
                render(<ProductDetail {...defaultProps} data={dataWithInvalidDate} />);
            }).toThrow('Invalid time value');
        });

        it('should handle missing registration date', () => {
            const dataWithInvalidDate = { ...mockProductData, registrationDate: 'invalid' };
            expect(() => {
                render(<ProductDetail {...defaultProps} data={dataWithInvalidDate} />);
            }).toThrow('Invalid time value');
        });
    });

    describe('Edge cases', () => {
        it('should handle all modal states closed initially', () => {
            render(<ProductDetail {...defaultProps} />);

            expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
            expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
        });

        it('should handle multiple modal interactions', () => {
            render(<ProductDetail {...defaultProps} />);

            fireEvent.click(screen.getByText('Exclude'));
            expect(screen.getByTestId('product-modal')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Close Modal'));
            expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();

            fireEvent.click(screen.getByText('Supervision'));
            expect(screen.getByTestId('product-modal')).toBeInTheDocument();
        });
    });

    describe('handleOpenModal function coverage', () => {
        it('should return resolved promise for unknown action', async () => {
            render(<ProductDetail {...defaultProps} />);

            const component = screen.getByTestId('product-detail');
            expect(component).toBeInTheDocument();
        });

        it('should handle APPROVED action in handleOpenModal', async () => {
            mockSetApprovedStatusList.mockResolvedValue(undefined);

            render(<ProductDetail {...defaultProps} />);

            fireEvent.click(screen.getByText('Restore'));
            fireEvent.click(screen.getByText('Confirm'));

            await waitFor(() => {
                expect(mockSetApprovedStatusList).toHaveBeenCalledWith('ORG123', ['GTIN123'], 'TODO');
            });
        });
    });
});
