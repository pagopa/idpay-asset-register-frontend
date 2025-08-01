import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductActionButtons from '../ProductActionButtons';

const mockOnRestore = jest.fn();
const mockOnExclude = jest.fn();
const mockOnSupervision = jest.fn();

describe('ProductActionButtons', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering conditions', () => {
        it('should return null when isInvitaliaUser is false', () => {
            const {container} = render(
                <ProductActionButtons
                    isInvitaliaUser={false}
                    status="APPROVED"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(container.firstChild).toBeNull();
        });

        it('should return null when status is undefined', () => {
            const {container} = render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status={undefined}
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(container.firstChild).toBeNull();
        });

        it('should return null when status is empty string', () => {
            const {container} = render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status=""
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(container.firstChild).toBeNull();
        });

        it('should return null when both isInvitaliaUser is false and status is undefined', () => {
            const {container} = render(
                <ProductActionButtons
                    isInvitaliaUser={false}
                    status={undefined}
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(container.firstChild).toBeNull();
        });
    });

    describe('APPROVED status', () => {
        it('should render Contrassegna and Escludi buttons when status is APPROVED', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="APPROVED"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(screen.getByText('Contrassegna')).toBeInTheDocument();
            expect(screen.getByText('Escludi')).toBeInTheDocument();
            expect(screen.queryByText('Ripristina')).not.toBeInTheDocument();
        });

        it('should call onSupervision when Contrassegna button is clicked', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="APPROVED"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            fireEvent.click(screen.getByText('Contrassegna'));
            expect(mockOnSupervision).toHaveBeenCalledTimes(1);
        });

        it('should call onExclude when Escludi button is clicked in APPROVED status', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="APPROVED"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            fireEvent.click(screen.getByText('Escludi'));
            expect(mockOnExclude).toHaveBeenCalledTimes(1);
        });

        it('should disable Contrassegna button when onSupervision is not provided', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="APPROVED"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                />
            );

            const contrassegnaButton = screen.getByText('Contrassegna');
            expect(contrassegnaButton).toBeDisabled();
        });

        it('should disable Contrassegna button when onSupervision is undefined', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="APPROVED"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={undefined}
                />
            );

            const contrassegnaButton = screen.getByText('Contrassegna');
            expect(contrassegnaButton).toBeDisabled();
        });
    });

    describe('Non-REJECTED status (but not APPROVED)', () => {
        it('should render Ripristina and Escludi buttons when status is PENDING', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="PENDING"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(screen.getByText('Ripristina')).toBeInTheDocument();
            expect(screen.getByText('Escludi')).toBeInTheDocument();
            expect(screen.queryByText('Contrassegna')).not.toBeInTheDocument();
        });

        it('should render Ripristina and Escludi buttons when status is DRAFT', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="DRAFT"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(screen.getByText('Ripristina')).toBeInTheDocument();
            expect(screen.getByText('Escludi')).toBeInTheDocument();
        });

        it('should call onRestore when Ripristina button is clicked in non-REJECTED status', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="PENDING"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            fireEvent.click(screen.getByText('Ripristina'));
            expect(mockOnRestore).toHaveBeenCalledTimes(1);
        });

        it('should call onExclude when Escludi button is clicked in non-REJECTED status', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="PENDING"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            fireEvent.click(screen.getByText('Escludi'));
            expect(mockOnExclude).toHaveBeenCalledTimes(1);
        });
    });

    describe('REJECTED status', () => {
        it('should render only Ripristina button when status is REJECTED', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="REJECTED"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(screen.getByText('Ripristina')).toBeInTheDocument();
            expect(screen.queryByText('Escludi')).not.toBeInTheDocument();
            expect(screen.queryByText('Contrassegna')).not.toBeInTheDocument();
        });

        it('should call onRestore when Ripristina button is clicked in REJECTED status', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="REJECTED"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            fireEvent.click(screen.getByText('Ripristina'));
            expect(mockOnRestore).toHaveBeenCalledTimes(1);
        });
    });

    describe('Component structure and styling', () => {
        it('should render with correct MUI components structure for APPROVED status', () => {
            const {container} = render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="APPROVED"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(container.querySelector('.MuiListItem-root')).toBeInTheDocument();

            expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();

            const buttons = container.querySelectorAll('.MuiButton-root');
            expect(buttons).toHaveLength(2);
        });

        it('should render with correct MUI components structure for REJECTED status', () => {
            const {container} = render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="REJECTED"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(container.querySelector('.MuiListItem-root')).toBeInTheDocument();

            expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();

            const buttons = container.querySelectorAll('.MuiButton-root');
            expect(buttons).toHaveLength(1);
        });
    });

    describe('Edge cases', () => {
        it('should handle unknown status values as non-REJECTED', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="UNKNOWN_STATUS"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(screen.getByText('Ripristina')).toBeInTheDocument();
            expect(screen.getByText('Escludi')).toBeInTheDocument();
            expect(screen.queryByText('Contrassegna')).not.toBeInTheDocument();
        });

        it('should handle case-sensitive status comparison', () => {
            render(
                <ProductActionButtons
                    isInvitaliaUser={true}
                    status="approved"
                    onRestore={mockOnRestore}
                    onExclude={mockOnExclude}
                    onSupervision={mockOnSupervision}
                />
            );

            expect(screen.getByText('Ripristina')).toBeInTheDocument();
            expect(screen.getByText('Escludi')).toBeInTheDocument();
            expect(screen.queryByText('Contrassegna')).not.toBeInTheDocument();
        });
    });
});