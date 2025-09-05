import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductsTable from '../ProductsTable';
import type { ProductDTO } from '../../../api/generated/register/ProductDTO';

const CategoryEnumLocal = {
  Frigorifero: 'Frigorifero',
  Lavatrice: 'Lavatrice',
  Lavastoviglie: 'Lavastoviglie',
  Forno: 'Forno',
} as const;

jest.mock('../../../api/generated/register/ProductStatus', () => ({
  ProductStatusEnum: {
    DRAFT: 'DRAFT',
    APPROVED : 'APPROVED',
    WAIT_APPROVED : 'WAIT_APPROVED',
    REJECTED : 'REJECTED',
    SUPERVISED : 'SUPERVISED',
    UPLOADED : 'UPLOADED'
  },
}));

const basePreloadedState = {
  invitalia: {
    institutionList: [],
    selectedInstitution: null,
    loading: false,
    error: null,
  },
  ui: { locale: 'it' },
  auth: { user: { id: 'u1' } },
};

const createTestStore = (preloadedState: any = {}) =>
  configureStore({
    reducer: (state = preloadedState) => state,
    preloadedState,
  });

const TestWrapper: React.FC<{ children: React.ReactNode; preloadedState?: any }> = ({
  children,
  preloadedState = {},
}) => {
  const mergedState = {
    ...basePreloadedState,
    ...preloadedState,
    invitalia: {
      ...basePreloadedState.invitalia,
      ...(preloadedState.invitalia ?? {}),
    },
  };
  const store = createTestStore(mergedState);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </Provider>
  );
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'pages.products.listHeader.status': 'Status',
        'pages.products.listHeader.category': 'Category',
        'pages.products.listHeader.energeticClass': 'Energy Class',
        'pages.products.listHeader.eprelCode': 'EPREL Code',
        'pages.products.listHeader.gtinCode': 'GTIN Code',
        'pages.products.listHeader.batch': 'Batch',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('../../../components/Product/EprelLinks', () => {
  return function EprelLinks({ row }: { row: ProductDTO }) {
    return <div data-testid="eprel-links">{row.eprelCode}</div>;
  };
});

jest.mock('../../../components/Product/EnhancedTableHead', () => {
  return function EnhancedTableHead({
    isInvitaliaUser,
    headCells,
    order,
    orderBy,
    onRequestSort,
    isAllSelected,
    isIndeterminate,
    handleSelectAllClick,
  }: any) {
    return (
      <thead data-testid="enhanced-table-head">
        <tr>
          {isInvitaliaUser && (
            <th>
              <input
                type="checkbox"
                data-testid="select-all-checkbox"
                checked={isAllSelected}
                onChange={handleSelectAllClick}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
              />
            </th>
          )}
          {headCells.map((cell: any) => (
            <th
              key={cell.id}
              onClick={(event) => onRequestSort(event, cell.id)}
              data-testid={`header-${cell.id}`}
            >
              {cell.label} {orderBy === cell.id ? (order === 'asc' ? '↑' : '↓') : ''}
            </th>
          ))}
        </tr>
      </thead>
    );
  };
});

jest.mock('../../../helpers', () => ({
  fetchUserFromLocalStorage: jest.fn(() => ({ org_role: 'INVITALIA_L1' })),
}));

jest.mock('../../../utils/constants', () => ({
  INVITALIA: 'INVITALIA',
  USERS_TYPES: {
    INVITALIA_L1: 'INVITALIA_L1',
    INVITALIA_L2: 'INVITALIA_L2',
    OTHER: 'OTHER',
  },
}));

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {ProductStatusEnum} from "../../../api/generated/register/ProductStatus";

const theme = createTheme();

describe('ProductsTable', () => {
  const mockOnRequestSort = jest.fn();
  const mockHandleListButtonClick = jest.fn();
  const mockSetSelected = jest.fn();

  const mockProductData: ProductDTO[] = [
    {
      status: ProductStatusEnum.APPROVED,
      category: CategoryEnumLocal.Frigorifero,
      energyClass: 'A++',
      eprelCode: 'EPREL001',
      gtinCode: 'GTIN001',
      batchName: 'Batch001',
    },
    {
      status: ProductStatusEnum.SUPERVISED,
      category: CategoryEnumLocal.Lavatrice,
      energyClass: 'A+',
      eprelCode: 'EPREL002',
      gtinCode: 'GTIN002',
      batchName: 'Batch002',
    },
    {
      status: ProductStatusEnum.REJECTED,
      category: CategoryEnumLocal.Lavastoviglie,
      energyClass: 'B',
      eprelCode: 'EPREL003',
      gtinCode: 'GTIN003',
      batchName: 'Batch003',
    },
    {
      status: ProductStatusEnum.WAIT_APPROVED,
      category: CategoryEnumLocal.Forno,
      energyClass: 'C',
      eprelCode: 'EPREL004',
      gtinCode: 'GTIN004',
      batchName: 'Batch004',
    },
  ];

  const defaultProps = {
    tableData: mockProductData,
    emptyData: 'N/A',
    order: 'asc' as const,
    orderBy: 'category' as keyof ProductDTO,
    onRequestSort: mockOnRequestSort,
    handleListButtonClick: mockHandleListButtonClick,
    selected: [],
    setSelected: mockSetSelected,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Invitalia User Tests', () => {
    it('should render table with all columns for Invitalia user', () => {
      render(
        <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
          <ProductsTable {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('enhanced-table-head')).toBeInTheDocument();
      expect(screen.getByTestId('header-status')).toBeInTheDocument();
      expect(screen.getByTestId('header-category')).toBeInTheDocument();
    });
  });
});
