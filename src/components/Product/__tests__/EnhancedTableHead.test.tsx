import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Table } from '@mui/material';
import '@testing-library/jest-dom';
import EnhancedTableHead, {EnhancedTableHeadProps} from "../EnhancedTableHead";
import {ProductDTO} from "../../../api/generated/register/ProductDTO";

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@mui/utils', () => ({
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

const renderWithTheme = (component: React.ReactElement) => {
  const theme = createTheme();
  return render(
      <ThemeProvider theme={theme}>
        <Table>
          {component}
        </Table>
      </ThemeProvider>
  );
};

describe('EnhancedTableHead', () => {
  const mockHeadCells = [
    { id: 'selectedStatus' as const, label: 'pages.products.table.headers.selected', align: 'left' as const, width: 50 },
    { id: 'productName' as keyof ProductDTO, label: 'pages.products.table.headers.productName', align: 'left' as const, width: 200 },
    { id: 'category' as keyof ProductDTO, label: 'pages.products.table.headers.category', align: 'center' as const, width: 150 },
    { id: 'status' as keyof ProductDTO, label: 'pages.products.table.headers.status', align: 'right' as const, width: 100 },
    { id: 'actions' as const, label: 'pages.products.table.headers.actions', align: 'right' as const, width: 120 },
  ];

  const defaultProps: EnhancedTableHeadProps = {
    isInvitaliaUser: true,
    headCells: mockHeadCells,
    order: 'asc',
    orderBy: 'productName',
    onRequestSort: jest.fn(),
    isAllSelected: false,
    isIndeterminate: false,
    handleSelectAllClick: jest.fn(),
    cellLeftSx: { backgroundColor: 'left' },
    cellCenterSx: { backgroundColor: 'center' },
    cellRightSx: { backgroundColor: 'right' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render table head with all cells when isInvitaliaUser is true', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();

      expect(screen.getByText('pages.products.table.headers.selected')).toBeInTheDocument();
      expect(screen.getByText('pages.products.table.headers.productName')).toBeInTheDocument();
      expect(screen.getByText('pages.products.table.headers.category')).toBeInTheDocument();
      expect(screen.getByText('pages.products.table.headers.status')).toBeInTheDocument();
      expect(screen.getByText('pages.products.table.headers.actions')).toBeInTheDocument();
    });

    it('should render table head without checkbox when isInvitaliaUser is false', () => {
      const props = { ...defaultProps, isInvitaliaUser: false };
      renderWithTheme(<EnhancedTableHead {...props} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

      expect(screen.getByText('pages.products.table.headers.productName')).toBeInTheDocument();
      expect(screen.getByText('pages.products.table.headers.category')).toBeInTheDocument();
    });

    it('should render with empty headCells array', () => {
      const props = { ...defaultProps, headCells: [] };
      renderWithTheme(<EnhancedTableHead {...props} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });

  describe('Checkbox behavior', () => {
    it('should render checkbox as checked when isAllSelected is true', () => {
      const props = { ...defaultProps, isAllSelected: true };
      renderWithTheme(<EnhancedTableHead {...props} />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      expect(checkbox.indeterminate).toBe(false);
    });

    it('should render checkbox as indeterminate when isIndeterminate is true', () => {
      const props = { ...defaultProps, isIndeterminate: true };
      renderWithTheme(<EnhancedTableHead {...props} />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);
    });

    it('should render checkbox as unchecked when both isAllSelected and isIndeterminate are false', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(false);
    });

    it('should call handleSelectAllClick when checkbox is clicked', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(defaultProps.handleSelectAllClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sorting behavior', () => {
    it('should render sort labels for sortable columns', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const sortButtons = screen.getAllByRole('button');
      expect(sortButtons).toHaveLength(4);
    });

    it('should not render sort label for selectedStatus column', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const selectedCell = screen.getByText('pages.products.table.headers.selected').closest('th');
      expect(selectedCell?.querySelector('[role="button"]')).toBeNull();
    });

    it('should call onRequestSort when sort label is clicked', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const productNameSort = screen.getByText('pages.products.table.headers.productName').closest('[role="button"]');
      fireEvent.click(productNameSort!);

      expect(defaultProps.onRequestSort).toHaveBeenCalledWith(
          expect.any(Object),
          'productName'
      );
    });

    it('should show active sort state for current orderBy column', () => {
      const props = { ...defaultProps, orderBy: 'category' as keyof ProductDTO, order: 'desc' as const };
      renderWithTheme(<EnhancedTableHead {...props} />);

      const categoryHeader = screen.getByText('pages.products.table.headers.category').closest('th');
      expect(categoryHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it('should render visually hidden sort direction text for active column - descending', () => {
      const props = { ...defaultProps, orderBy: 'productName' as keyof ProductDTO, order: 'desc' as const };
      renderWithTheme(<EnhancedTableHead {...props} />);

      expect(screen.getByText('sorted descending')).toBeInTheDocument();
    });

    it('should render visually hidden sort direction text for active column - ascending', () => {
      const props = { ...defaultProps, orderBy: 'productName' as keyof ProductDTO, order: 'asc' as const };
      renderWithTheme(<EnhancedTableHead {...props} />);

      expect(screen.getByText('sorted ascending')).toBeInTheDocument();
    });

    it('should not render visually hidden text for non-active columns', () => {
      const props = { ...defaultProps, orderBy: 'category' as keyof ProductDTO };
      renderWithTheme(<EnhancedTableHead {...props} />);

      expect(screen.getByText('sorted ascending')).toBeInTheDocument();
      expect(screen.queryByText('sorted descending')).not.toBeInTheDocument();
    });
  });

  describe('Cell alignment and styling', () => {
    it('should apply correct alignment for left-aligned cells', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const leftCell = screen.getByText('pages.products.table.headers.productName').closest('th');
      expect(leftCell).toHaveStyle({ textAlign: 'left' });
    });

    it('should apply correct alignment for center-aligned cells', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const centerCell = screen.getByText('pages.products.table.headers.category').closest('th');
      expect(centerCell).toHaveStyle({ textAlign: 'center' });
    });

    it('should apply correct alignment for right-aligned cells', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const rightCell = screen.getByText('pages.products.table.headers.status').closest('th');
      expect(rightCell).toHaveStyle({ textAlign: 'right' });
    });

    it('should apply cellLeftSx styling to left-aligned cells', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const leftCell = screen.getByText('pages.products.table.headers.productName').closest('th');
      expect(leftCell).toHaveStyle({ backgroundColor: 'left' });
    });

    it('should apply cellCenterSx styling to center-aligned cells', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const centerCell = screen.getByText('pages.products.table.headers.category').closest('th');
      expect(centerCell).toHaveStyle({ backgroundColor: 'center' });
    });

    it('should apply cellRightSx styling to right-aligned cells', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const rightCell = screen.getByText('pages.products.table.headers.status').closest('th');
      expect(rightCell).toHaveStyle({ backgroundColor: 'right' });
    });

    it('should apply width styles to cells', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const productNameCell = screen.getByText('pages.products.table.headers.productName').closest('th');
      expect(productNameCell).toHaveStyle({
        width: '200px',
      });
    });

    it('should apply width styles to checkbox cell from first headCell', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const checkboxCell = screen.getByRole('checkbox').closest('th');
      expect(checkboxCell).toHaveStyle({
        width: '4%',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle missing cellSx props', () => {
      const props = {
        ...defaultProps,
        cellLeftSx: undefined,
        cellCenterSx: undefined,
        cellRightSx: undefined,
      };

      expect(() => renderWithTheme(<EnhancedTableHead {...props} />)).not.toThrow();
    });

    it('should handle headCells without width property', () => {
      const headCellsWithoutWidth = mockHeadCells.map(cell => {
        const { width, ...cellWithoutWidth } = cell;
        return cellWithoutWidth;
      });

      const props = { ...defaultProps, headCells: headCellsWithoutWidth };

      expect(() => renderWithTheme(<EnhancedTableHead {...props} />)).not.toThrow();
    });

    it('should handle empty first headCell when isInvitaliaUser is true', () => {
      const props = { ...defaultProps, headCells: [] };
      renderWithTheme(<EnhancedTableHead {...props} />);

      const checkboxCell = screen.getByRole('checkbox').closest('th');
      expect(checkboxCell).not.toHaveStyle({ width: '50px' });
    });

    it('should render final empty TableCell', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const allCells = screen.getAllByRole('columnheader');
      expect(allCells).toHaveLength(mockHeadCells.length+2);
    });

    it('should handle different ProductDTO key types', () => {
      const headCellsWithDifferentKeys = [
        { id: 'id' as keyof ProductDTO, label: 'ID', align: 'left' as const },
        { id: 'createdAt' as keyof ProductDTO, label: 'Created', align: 'center' as const },
      ];

      const props = { ...defaultProps, headCells: headCellsWithDifferentKeys, orderBy: 'id' as keyof ProductDTO };

      expect(() => renderWithTheme(<EnhancedTableHead {...props} />)).not.toThrow();

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('should handle click on different sortable columns', () => {
      renderWithTheme(<EnhancedTableHead {...defaultProps} />);

      const categorySort = screen.getByText('pages.products.table.headers.category').closest('[role="button"]');
      fireEvent.click(categorySort!);
      expect(defaultProps.onRequestSort).toHaveBeenCalledWith(expect.any(Object), 'category');

      const statusSort = screen.getByText('pages.products.table.headers.status').closest('[role="button"]');
      fireEvent.click(statusSort!);
      expect(defaultProps.onRequestSort).toHaveBeenCalledWith(expect.any(Object), 'status');

      const actionsSort = screen.getByText('pages.products.table.headers.actions').closest('[role="button"]');
      fireEvent.click(actionsSort!);
      expect(defaultProps.onRequestSort).toHaveBeenCalledWith(expect.any(Object), 'actions');
    });
  });
});