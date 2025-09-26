import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import UpcomingInitiative from '../upcomingInitiative';

jest.mock('../../../utils/env', () => ({
    __esModule: true,
    ENV: {
        URL_API: {
            OPERATION: 'https://mock-api/register',
            LOGOUT: 'https://mock-api/logout',
        },
    },
}));

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

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => ({
    useUnloadEventOnExit: () => (fn?: () => void) => {
        if (typeof fn === 'function') {
            fn();
        }
    },
}));

jest.mock('../../../asset/images/hourglass.png', () => 'hourglass.png');

jest.mock('../../../helpers', () => ({
    __esModule: true,
    customExitAction: () => console.log({ event: 'exit' }),
}));



describe('UpcomingInitiative', () => {
    test('renderizza immagine 60x60, titolo, sottotitolo interpolato e bottone', () => {
        render(<UpcomingInitiative />);

        const img = screen.getByAltText(/hourglass icon/i) as HTMLImageElement;
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('width', '60');
        expect(img).toHaveAttribute('height', '60');

        const title = screen.getByRole('heading', { name: 'Titolo Mock' });
        expect(title).toBeInTheDocument();

        expect(screen.getByText('Sottotitolo 20/10/2025')).toBeInTheDocument();

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
