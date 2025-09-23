import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: Record<string, any>) => {
            if (key === 'pages.upcomingInitiative.title') return 'Titolo Mock';
            if (key === 'pages.upcomingInitiative.subTitle') return `Sottotitolo ${opts?.x ?? ''}`;
            if (key === 'commons.closeBtn') return 'Chiudi';
            return key;
        },
    }),
}));

import UpcomingInitiative from '../upcomingInitiative';

describe('UpcomingInitiative', () => {
    test('renderizza immagine 60x60, titolo, sottotitolo interpolato e bottone', () => {
        render(<UpcomingInitiative />);

        const img = screen.getByAltText(/hourglass icon/i) as HTMLImageElement;
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('width', '60');
        expect(img).toHaveAttribute('height', '60');

        const title = screen.getByRole('heading', { name: 'Titolo Mock' });
        expect(title).toBeInTheDocument();

        expect(screen.getByText('Sottotitolo xx/xx/xx')).toBeInTheDocument();

        const button = screen.getByRole('button', { name: 'Chiudi' });
        expect(button).toBeInTheDocument();
    });

    test('il click sul bottone invoca console.log con l’evento', async () => {
        const user = userEvent.setup();
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        render(<UpcomingInitiative />);

        const button = screen.getByRole('button', { name: 'Chiudi' });
        await user.click(button);

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy.mock.calls[0][0]).toBeInstanceOf(Object);

        logSpy.mockRestore();
    });
});
