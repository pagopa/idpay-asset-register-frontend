import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { getInstitutionsList } from '../../../services/registerService';
import { Institution } from '../../../model/Institution';
import '@testing-library/jest-dom';
import InvitaliaOverview from "../invitaliaOverview";

jest.mock('../../../services/registerService', () => ({
    getInstitutionsList: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: () => new Promise(() => {}),
        },
    }),
    withTranslation: () => (Component: any) => {
        Component.defaultProps = { ...(Component.defaultProps || {}), t: (k: string) => k };
        return Component;
    },
    Trans: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../institutionsTable', () => (props: any) => {
    const { data } = props;
    return (
        <div data-testid="mock-table">
            {data.institutions.map((inst: any) => (
                <div key={inst.institutionId}>{inst.description}</div>
            ))}
        </div>
    );
});

const mockInstitutions: Institution[] = [
    {
        institutionId: '1',
        description: 'Alpha Institution',
        createdAt: '2025-01-01',
        updatedAt:'2025-01-01',
    },
    {
        institutionId: '2',
        description: 'Beta Institution',
        createdAt: '2025-01-02',
        updatedAt: '2025-01-02',
    },
    {
        institutionId: '3',
        description: 'Gamma Institution',
        createdAt: '2025-01-03',
        updatedAt: '2025-01-03',
    },
];

describe('InvitaliaOverview', () => {
    beforeEach(() => {
        (getInstitutionsList as jest.Mock).mockResolvedValue({ institutions: mockInstitutions });
    });

    it('renders title and subtitle', async () => {
        render(<InvitaliaOverview />);
        expect(await screen.findByText('pages.invitaliaOverview.overviewTitle')).toBeInTheDocument();
    });

    it('displays institutions in table after loading', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => {
            expect(screen.getByText('Alpha Institution')).toBeInTheDocument();
            expect(screen.getByText('Beta Institution')).toBeInTheDocument();
        });
    });

    it('filters institutions by search term', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const searchInput = screen.getByLabelText('Cerca per nome produttore');
        fireEvent.change(searchInput, { target: { value: 'Gamma' } });

        expect(screen.queryByText('Alpha Institution')).not.toBeInTheDocument();
        expect(screen.queryByText('Beta Institution')).not.toBeInTheDocument();
        expect(screen.getByText('Gamma Institution')).toBeInTheDocument();
    });

    it('resets page on search change', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const searchInput = screen.getByLabelText('Cerca per nome produttore');
        fireEvent.change(searchInput, { target: { value: 'Alpha' } });

        expect(screen.getByText('Alpha Institution')).toBeInTheDocument();
    });
});
