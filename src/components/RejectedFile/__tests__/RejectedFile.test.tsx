import { render, screen, fireEvent } from '@testing-library/react';
import RejectedFile from '../RejectedFile';
import '@testing-library/jest-dom';

describe('RejectedFile component', () => {
    const baseProps = {
        title: 'Errore',
        description: 'File non valido',
        dismissFn: jest.fn(),
    };

    it('renders title and description when isReport is false', () => {
        render(<RejectedFile {...baseProps} isReport={false} />);
        expect(screen.getByText('Errore')).toBeInTheDocument();
        expect(screen.getByText('File non valido')).toBeInTheDocument();
        expect(screen.queryByText('Scarica il report')).not.toBeInTheDocument();
    });

    it('renders download link and calls onDownloadReport when clicked', () => {
        const onDownloadReport = jest.fn();
        render(
            <RejectedFile
                {...baseProps}
                isReport={true}
                onDownloadReport={onDownloadReport}
            />
        );

        const downloadLink = screen.getByText('Scarica il report');
        expect(downloadLink).toBeInTheDocument();

        fireEvent.click(downloadLink);
        expect(onDownloadReport).toHaveBeenCalled();
    });

    it('renders when isReport is false', () => {
        const onDownloadReport = jest.fn();
        render(
            <RejectedFile
                {...baseProps}
                isReport={false}
                onDownloadReport={onDownloadReport}
            />
        );

        expect(screen.getByText(baseProps.title)).toBeInTheDocument();
        expect(screen.getByText(baseProps.description)).toBeInTheDocument();

        expect(screen.queryByText(/Scarica il report/i)).not.toBeInTheDocument();
    });

    it('renders correctly when isReport is omitted (default false)', () => {
        render(<RejectedFile {...baseProps} />);
        expect(screen.getByText(baseProps.title)).toBeInTheDocument();
        expect(screen.getByText(baseProps.description)).toBeInTheDocument();
        expect(screen.queryByText(/Scarica il report/i)).not.toBeInTheDocument();
    });
});
