import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedTableHead from '../EnhancedTableHead';

// Mock useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('EnhancedTableHead', () => {
  const onRequestSort = jest.fn();

  const defaultProps = {
    order: 'asc' as const,
    orderBy: 'category' as const,
    onRequestSort,
  };

  it('renderizza tutte le intestazioni di colonna', () => {
    render(<EnhancedTableHead {...defaultProps} />);
    expect(screen.getByText('pages.products.listHeader.category')).toBeInTheDocument();
    expect(screen.getByText('pages.products.listHeader.energeticClass')).toBeInTheDocument();
    expect(screen.getByText('pages.products.listHeader.eprelCode')).toBeInTheDocument();
    expect(screen.getByText('pages.products.listHeader.gtinCode')).toBeInTheDocument();
    expect(screen.getByText('pages.products.listHeader.batch')).toBeInTheDocument();
  });

  it('chiama onRequestSort con la proprietà corretta al click su TableSortLabel', () => {
    render(<EnhancedTableHead {...defaultProps} />);
    const sortLabels = screen.getAllByRole('button');
    // Clicca sulla prima colonna (category)
    fireEvent.click(sortLabels[0]);
    expect(onRequestSort).toHaveBeenCalledWith(expect.any(Object), 'category');
  });

  it('visualizza l’indicatore di ordinamento sulla colonna attiva', () => {
    render(<EnhancedTableHead {...defaultProps} />);
    // Deve esserci il testo di ordinamento per la colonna attiva
    expect(screen.getByText(/sorted ascending|sorted descending/)).toBeInTheDocument();
  });
});
