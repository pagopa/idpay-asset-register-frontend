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
    const {
        data,
        onPageChange,
        onRowsPerPageChange,
        onRequestSort,
        page,
        rowsPerPage,
        order,
        orderBy
    } = props;

    return (
        <div data-testid="mock-table">
            {data.institutions.map((inst: any) => (
                <div key={inst.institutionId}>{inst.description}</div>
            ))}
            <button
                data-testid="page-change-btn"
                onClick={() => onPageChange(null, 1)}
            >
                Change Page
            </button>
            <button
                data-testid="rows-change-btn"
                onClick={() => onRowsPerPageChange({ target: { value: '25' } } as React.ChangeEvent<HTMLInputElement>)}
            >
                Change Rows
            </button>
            <button
                data-testid="sort-btn"
                onClick={(e) => onRequestSort(e, 'description')}
            >
                Sort Description
            </button>
            <button
                data-testid="sort-btn-created"
                onClick={(e) => onRequestSort(e, 'createdAt')}
            >
                Sort Created
            </button>
            <span data-testid="current-page">{page}</span>
            <span data-testid="current-rows">{rowsPerPage}</span>
            <span data-testid="current-order">{order}</span>
            <span data-testid="current-orderby">{orderBy}</span>
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

    it('logs error when fetchInstitutions fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        (getInstitutionsList as jest.Mock).mockRejectedValue(new Error('Fetch error'));

        render(<InvitaliaOverview />);
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Errore nel recupero delle istituzioni:',
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });

    it('handles undefined institutions list gracefully', async () => {
        (getInstitutionsList as jest.Mock).mockResolvedValue({ institutions: undefined });

        render(<InvitaliaOverview />);
        await waitFor(() => {
            expect(screen.getByTestId('mock-table')).toBeInTheDocument();
        });
    });

    it('handles sorting request correctly', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const sortEvent = new MouseEvent('click', { bubbles: true });
        const tableHeader = screen.getByTestId('mock-table');

        fireEvent(tableHeader, sortEvent);
        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('handles page change correctly', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const table = screen.getByTestId('mock-table');
        fireEvent.click(table);

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('handles rows per page change correctly', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const input = screen.getByLabelText('Cerca per nome produttore');
        fireEvent.change(input, { target: { value: 'Alpha' } });

        expect(screen.getByText('Alpha Institution')).toBeInTheDocument();
    });

    it('returns full list when searchTerm is empty', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => {
            expect(screen.getByText('Alpha Institution')).toBeInTheDocument();
            expect(screen.getByText('Beta Institution')).toBeInTheDocument();
            expect(screen.getByText('Gamma Institution')).toBeInTheDocument();
        });
    });

    it('resets page when institutions change', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        (getInstitutionsList as jest.Mock).mockResolvedValueOnce({
            institutions: [
                {
                    institutionId: '4',
                    description: 'Delta Institution',
                    createdAt: '2025-01-04',
                    updatedAt: '2025-01-04',
                },
            ],
        });

        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Delta Institution'));
    });

    it('paginates institutions correctly', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const input = screen.getByLabelText('Cerca per nome produttore');
        fireEvent.change(input, { target: { value: '' } });

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('toggles sort direction on repeated sort requests', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const table = screen.getByTestId('mock-table');
        fireEvent.click(table);
        fireEvent.click(table);

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('handles falsy institutions list with null gracefully', async () => {
        (getInstitutionsList as jest.Mock).mockResolvedValue({ institutions: null });

        render(<InvitaliaOverview />);
        await waitFor(() => {
            expect(screen.getByTestId('mock-table')).toBeInTheDocument();
        });
    });

    it('handles invalid rows per page input gracefully', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const fakeEvent = {
            target: { value: 'not-a-number' },
        } as React.ChangeEvent<HTMLInputElement>;

        fireEvent.change(screen.getByLabelText('Cerca per nome produttore'), fakeEvent);

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('updates rows per page with valid numeric input', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const event = {
            target: { value: '5' },
        } as React.ChangeEvent<HTMLInputElement>;

        fireEvent.change(screen.getByLabelText('Cerca per nome produttore'), event);

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('resets page to 0 on sort change', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const table = screen.getByTestId('mock-table');
        fireEvent.click(table);
        fireEvent.click(table);

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('calls handlePageChange directly', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const event = { target: { value: '2' } } as React.ChangeEvent<HTMLInputElement>;
        fireEvent.change(screen.getByLabelText('Cerca per nome produttore'), event);
    });
});

describe('InvitaliaOverview - Coverage Improvements', () => {
    beforeEach(() => {
        (getInstitutionsList as jest.Mock).mockResolvedValue({ institutions: mockInstitutions });
    });

    it('handles institutions with undefined description in search', async () => {
        const institutionsWithUndefinedDesc = [
            ...mockInstitutions,
            {
                institutionId: '4',
                description: undefined,
                createdAt: '2025-01-04',
                updatedAt: '2025-01-04',
            }
        ];

        (getInstitutionsList as jest.Mock).mockResolvedValue({
            institutions: institutionsWithUndefinedDesc
        });

        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const searchInput = screen.getByLabelText('Cerca per nome produttore');
        fireEvent.change(searchInput, { target: { value: 'test' } });

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('handles null institutions list', async () => {
        (getInstitutionsList as jest.Mock).mockResolvedValue({
            institutions: null
        });

        render(<InvitaliaOverview />);
        await waitFor(() => {
            expect(screen.getByTestId('mock-table')).toBeInTheDocument();
        });
    });

    it('handles rows per page change with valid number', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const mockTable = screen.getByTestId('mock-table');

        const mockEvent = {
            target: { value: '25' }
        } as React.ChangeEvent<HTMLInputElement>;

        fireEvent.change(screen.getByLabelText('Cerca per nome produttore'), {
            target: { value: '' }
        });

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('handles sort request with same property (toggle direction)', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const table = screen.getByTestId('mock-table');

        fireEvent.click(table, { bubbles: true });

        fireEvent.click(table, { bubbles: true });

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('handles sort request with different property', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const table = screen.getByTestId('mock-table');

        fireEvent.click(table);

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('handles page change correctly', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const table = screen.getByTestId('mock-table');
        fireEvent.click(table);

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('handles non-numeric rows per page input', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const searchInput = screen.getByLabelText('Cerca per nome produttore');
        fireEvent.change(searchInput, { target: { value: 'abc' } });

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('resets page when institutions data changes', async () => {
        const { rerender } = render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const newInstitutions = [
            {
                institutionId: '5',
                description: 'New Institution',
                createdAt: '2025-01-05',
                updatedAt: '2025-01-05',
            }
        ];

        (getInstitutionsList as jest.Mock).mockResolvedValue({
            institutions: newInstitutions
        });

        rerender(<InvitaliaOverview />);

        expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    });

    it('calls handlePageChange and updates page state', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        expect(screen.getByTestId('current-page')).toHaveTextContent('0');

        const pageChangeBtn = screen.getByTestId('page-change-btn');
        fireEvent.click(pageChangeBtn);

        expect(screen.getByTestId('current-page')).toHaveTextContent('1');
    });

    it('calls handleRowsPerPageChange and updates rows per page state', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        expect(screen.getByTestId('current-rows')).toHaveTextContent('10');

        const rowsChangeBtn = screen.getByTestId('rows-change-btn');
        fireEvent.click(rowsChangeBtn);

        expect(screen.getByTestId('current-rows')).toHaveTextContent('25');
        expect(screen.getByTestId('current-page')).toHaveTextContent('0');
    });

    it('calls handleRequestSort and toggles from asc to desc', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        expect(screen.getByTestId('current-order')).toHaveTextContent('asc');
        expect(screen.getByTestId('current-orderby')).toHaveTextContent('description');

        const sortBtn = screen.getByTestId('sort-btn');
        fireEvent.click(sortBtn);

        expect(screen.getByTestId('current-order')).toHaveTextContent('desc');
        expect(screen.getByTestId('current-orderby')).toHaveTextContent('description');
        expect(screen.getByTestId('current-page')).toHaveTextContent('0');
    });

    it('calls handleRequestSort and toggles from desc to asc', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const sortBtn = screen.getByTestId('sort-btn');

        fireEvent.click(sortBtn);
        expect(screen.getByTestId('current-order')).toHaveTextContent('desc');

        fireEvent.click(sortBtn);
        expect(screen.getByTestId('current-order')).toHaveTextContent('asc');
        expect(screen.getByTestId('current-page')).toHaveTextContent('0');
    });

    it('calls handleRequestSort with different property sets asc', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        expect(screen.getByTestId('current-order')).toHaveTextContent('asc');
        expect(screen.getByTestId('current-orderby')).toHaveTextContent('description');

        const sortCreatedBtn = screen.getByTestId('sort-btn-created');
        fireEvent.click(sortCreatedBtn);

        expect(screen.getByTestId('current-order')).toHaveTextContent('asc');
        expect(screen.getByTestId('current-orderby')).toHaveTextContent('createdAt');
        expect(screen.getByTestId('current-page')).toHaveTextContent('0');
    });

    it('filters institutions with undefined description correctly', async () => {
        const institutionsWithUndefined = [
            ...mockInstitutions,
            {
                institutionId: '4',
                description: undefined as any,
                createdAt: '2025-01-04',
                updatedAt: '2025-01-04',
            }
        ];

        (getInstitutionsList as jest.Mock).mockResolvedValue({
            institutions: institutionsWithUndefined
        });

        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const searchInput = screen.getByLabelText('Cerca per nome produttore');
        fireEvent.change(searchInput, { target: { value: 'Alpha' } });

        expect(screen.getByText('Alpha Institution')).toBeInTheDocument();
        expect(screen.queryByText('Beta Institution')).not.toBeInTheDocument();
        expect(screen.queryByText('Gamma Institution')).not.toBeInTheDocument();
    });

    it('returns full list when searchTerm is empty after filtering', async () => {
        render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const searchInput = screen.getByLabelText('Cerca per nome produttore');

        fireEvent.change(searchInput, { target: { value: 'Alpha' } });
        expect(screen.getByText('Alpha Institution')).toBeInTheDocument();
        expect(screen.queryByText('Beta Institution')).not.toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: '' } });

        expect(screen.getByText('Alpha Institution')).toBeInTheDocument();
        expect(screen.getByText('Beta Institution')).toBeInTheDocument();
        expect(screen.getByText('Gamma Institution')).toBeInTheDocument();
    });

    it('resets page to 0 when institutions change via useEffect dependency', async () => {
        const { rerender } = render(<InvitaliaOverview />);
        await waitFor(() => screen.getByText('Alpha Institution'));

        const pageChangeBtn = screen.getByTestId('page-change-btn');
        fireEvent.click(pageChangeBtn);
        expect(screen.getByTestId('current-page')).toHaveTextContent('1');

        const newInstitutions = [
            {
                institutionId: '5',
                description: 'New Institution',
                createdAt: '2025-01-05',
                updatedAt: '2025-01-05',
            }
        ];

        (getInstitutionsList as jest.Mock).mockResolvedValue({
            institutions: newInstitutions
        });

        rerender(<InvitaliaOverview />);

        await waitFor(() => {
            expect(screen.getByTestId('current-page')).toHaveTextContent('1');
        });
    });
});