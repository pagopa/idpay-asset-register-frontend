/// <reference types="jest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: () => ({}),
}));

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({ t: (k: string) => k }),
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../hooks/useResolvedProductTableConfig', () => ({
  useResolvedProductTableConfig: () => ({
    tableConfig: {
      columns: [{ id: 'name', labelKey: 'name' }],
      selection: { rules: {} },
    },
    paginationConfig: {},
    filtersConfig: [],
    templateConfig: {},
  }),
}));

jest.mock('../hooks/useProductDataGridInit', () => ({
  useProductDataGridInit: () => ({
    batchFilterItems: [],
  }),
}));

jest.mock('../hooks/useProductsTable', () => ({
  useProductsTable: () => ({
    tableData: [],
    loading: false,
    itemsQty: 0,
    paginatorFrom: 0,
    paginatorTo: 0,
  }),
}));

jest.mock('../hooks/useEnrichedProductFilters', () => ({
  useEnrichedProductFilters: () => ({
    enrichedFiltersConfig: [],
  }),
}));

jest.mock('../hooks/useTargetOrganization', () => ({
  useTargetOrganization: () => ({
    targetId: 'org-1',
  }),
}));

jest.mock('../../DetailDrawer/DetailDrawer', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('../../FiltersDrawer/FiltersDrawer', () => ({
  __esModule: true,
  default: () => <div data-testid="filters-drawer" />,
}));

jest.mock('../ProductDataGridView', () => ({
  __esModule: true,
  default: () => <div data-testid="grid-view" />,
}));

jest.mock('../ProductResultMessages', () => ({
  __esModule: true,
  default: () => <div data-testid="result-messages" />,
}));

describe('ProductDataGrid', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('renders grid when permission exists', async () => {
    jest.doMock('../../../hooks/useInitiativeConfig', () => ({
      useInitiativeConfig: () => ({
        config: {
          tables: { products: {} },
          subRoles: {
            ADMIN: { permissions: { tables: ['products'] } },
          },
        },
      }),
    }));

    const ProductDataGrid = (await import('../ProductDataGrid')).default;
    render(<ProductDataGrid organizationId="org-1" />);
    expect(screen.getByTestId('grid-view')).toBeInTheDocument();
  });

  it('renders empty state when no permission', async () => {
    jest.doMock('../../../hooks/useInitiativeConfig', () => ({
      useInitiativeConfig: () => ({
        config: {
          tables: { products: {} },
          subRoles: {
            ADMIN: { permissions: { tables: [] } },
          },
        },
      }),
    }));

    const ProductDataGrid = (await import('../ProductDataGrid')).default;
    render(<ProductDataGrid organizationId="org-1" />);
    expect(screen.queryByTestId('grid-view')).not.toBeInTheDocument();
  });

  it('returns null when tableConfig is undefined', async () => {
    jest.doMock('../../../hooks/useInitiativeConfig', () => ({
      useInitiativeConfig: () => ({
        config: {
          tables: { products: {} },
          subRoles: {
            ADMIN: { permissions: { tables: ['products'] } },
          },
        },
      }),
    }));

    jest.doMock('../hooks/useResolvedProductTableConfig', () => ({
      useResolvedProductTableConfig: () => ({
        tableConfig: undefined,
        paginationConfig: {},
        filtersConfig: [],
        templateConfig: {},
      }),
    }));

    const ProductDataGrid = (await import('../ProductDataGrid')).default;
    const { container } = render(<ProductDataGrid organizationId="org-1" />);
    expect(container.firstChild).toBeNull();
  });
});
