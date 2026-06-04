/// <reference types="jest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDataGrid from '../ProductDataGrid';

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

jest.mock('../../../hooks/useInitiativeConfig', () => ({
  useInitiativeConfig: () => ({
    config: {
      tables: {
        products: {},
      },
      subRoles: {
        ADMIN: {
          permissions: { tables: ['products'] },
        },
      },
    },
  }),
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

jest.mock('./ProductResultMessages', () => ({
  __esModule: true,
  default: () => <div data-testid="result-messages" />,
}));

describe('ProductDataGrid', () => {
  it('renders grid view when permission exists', () => {
    render(<ProductDataGrid organizationId="org-1" />);
    expect(screen.getByTestId('grid-view')).toBeInTheDocument();
  });
});
