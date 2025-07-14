import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterBar from '../FilterBar';

// Mock useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const defaultProps = {
  categoryFilter: '',
  setCategoryFilter: jest.fn(),
  setFiltering: jest.fn(),
  batchFilter: '',
  setBatchFilter: jest.fn(),
  batchFilterItems: [
    { productFileId: '1', batchName: 'Batch 1' },
    { productFileId: '2', batchName: 'Batch 2' },
  ],
  eprelCodeFilter: '',
  setEprelCodeFilter: jest.fn(),
  gtinCodeFilter: '',
  setGtinCodeFilter: jest.fn(),
  tableData: [
    {
      category: 'A',
      energyClass: 'A',
      eprelCode: '123',
      gtinCode: '456',
      batchName: 'Batch 1',
    },
  ],
  handleDeleteFiltersButtonClick: jest.fn(),
};

describe('FilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderizza i filtri se tableData ha elementi', () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByLabelText('pages.products.filterLabels.category')).toBeInTheDocument();
    expect(screen.getByLabelText('pages.products.filterLabels.batch')).toBeInTheDocument();
    expect(screen.getByLabelText('pages.products.filterLabels.eprelCode')).toBeInTheDocument();
    expect(screen.getByLabelText('pages.products.filterLabels.gtinCode')).toBeInTheDocument();
    expect(screen.getByText('pages.products.filterLabels.filter')).toBeInTheDocument();
    expect(screen.getByText('pages.products.filterLabels.deleteFilters')).toBeInTheDocument();
  });

  it('non renderizza nulla se tableData è vuoto', () => {
    render(<FilterBar {...defaultProps} tableData={[]} />);
    expect(screen.queryByLabelText('pages.products.filterLabels.category')).not.toBeInTheDocument();
  });

  it('chiama setCategoryFilter al cambio categoria', () => {
    render(<FilterBar {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('pages.products.filterLabels.category'), {
      target: { value: 'NuovaCategoria' },
    });
    expect(defaultProps.setCategoryFilter).toHaveBeenCalledWith('NuovaCategoria');
  });

  it('chiama setBatchFilter al cambio batch', () => {
    render(<FilterBar {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('pages.products.filterLabels.batch'), {
      target: { value: '2' },
    });
    expect(defaultProps.setBatchFilter).toHaveBeenCalledWith('2');
  });

  it('chiama setEprelCodeFilter al cambio eprelCode', () => {
    render(<FilterBar {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('pages.products.filterLabels.eprelCode'), {
      target: { value: 'EPREL' },
    });
    expect(defaultProps.setEprelCodeFilter).toHaveBeenCalledWith('EPREL');
  });

  it('chiama setGtinCodeFilter al cambio gtinCode', () => {
    render(<FilterBar {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('pages.products.filterLabels.gtinCode'), {
      target: { value: 'GTIN' },
    });
    expect(defaultProps.setGtinCodeFilter).toHaveBeenCalledWith('GTIN');
  });

  it('chiama setFiltering al click su "filter"', () => {
    render(<FilterBar {...defaultProps} />);
    const filterButton = screen.getByText('pages.products.filterLabels.filter');
    fireEvent.click(filterButton);
    expect(defaultProps.setFiltering).toHaveBeenCalledWith(true);
  });

  it('chiama handleDeleteFiltersButtonClick al click su "deleteFilters"', () => {
    render(<FilterBar {...defaultProps} />);
    const deleteButton = screen.getByText('pages.products.filterLabels.deleteFilters');
    fireEvent.click(deleteButton);
    expect(defaultProps.handleDeleteFiltersButtonClick).toHaveBeenCalled();
  });

  it('disabilita i bottoni se nessun filtro è impostato', () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByText('pages.products.filterLabels.filter')).toBeDisabled();
    expect(screen.getByText('pages.products.filterLabels.deleteFilters')).toBeDisabled();
  });

  it('abilita i bottoni se almeno un filtro è impostato', () => {
    render(
      <FilterBar
        {...defaultProps}
        categoryFilter="A"
      />
    );
    expect(screen.getByText('pages.products.filterLabels.filter')).not.toBeDisabled();
    expect(screen.getByText('pages.products.filterLabels.deleteFilters')).not.toBeDisabled();
  });