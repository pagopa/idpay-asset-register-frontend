/// <reference types="jest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDataGrid from '../ProductDataGrid';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({ t: (k: string) => k }),
}));

jest.mock('../../../hooks/useInitiativeConfig', () => ({
  useInitiativeConfig: () => ({
    config: {
      tables: {
        products: {
          columns: [{ id: 'name', labelKey: 'name' }],
        },
      },
    },
  }),
}));

jest.mock('../../../hooks/useResolvedProductTableConfig', () => ({
  __esModule: true,
  default: () => ({
    columns: [{ id: 'name', labelKey: 'name' }],
  }),
}));

jest.mock('../../../hooks/useSelectedPartyProducts', () => ({
  useSelectedPartyProducts: () => ({
    products: [{ id: '1', name: 'Prod 1' }],
    isLoading: false,
  }),
}));

jest.mock('../ProductTable', () => ({
  __esModule: true,
  default: () => <div data-testid="grid-view">grid</div>,
}));

describe('ProductDataGrid', () => {
  it('renders grid when permission exists', () => {
    render(<ProductDataGrid organizationId="org-1" />);
    expect(screen.getByTestId('grid-view')).toBeInTheDocument();
  });

  it('renders empty state when no products', () => {
    jest.doMock('../../../hooks/useSelectedPartyProducts', () => ({
      useSelectedPartyProducts: () => ({
        products: [],
        isLoading: false,
      }),
    }));

    render(<ProductDataGrid organizationId="org-1" />);
    expect(screen.getByTestId('empty-list-table')).toBeInTheDocument();
  });

  it('returns null when config is missing', () => {
    jest.doMock('../../../hooks/useResolvedProductTableConfig', () => ({
      __esModule: true,
      default: () => undefined,
    }));

    const { container } = render(<ProductDataGrid organizationId="org-1" />);
    expect(container.firstChild).toBeNull();
  });
});
