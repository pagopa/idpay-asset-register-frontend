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
});
