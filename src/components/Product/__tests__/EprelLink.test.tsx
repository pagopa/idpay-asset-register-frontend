import React from 'react';
import { render, screen } from '@testing-library/react';
import EprelLink from '../eprelLink';
import { emptyData } from '../../../utils/constants';
import { ProductDTO } from '../../../api/generated/register/ProductDTO';

describe('EprelLink', () => {
  const baseRow: ProductDTO = {
    linkEprel: 'https://example.com/eprel',
    eprelCode: 'EPREL12345',
  };

  it('renderizza il link se eprelCode è valido', () => {
    render(<EprelLink row={baseRow} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', baseRow.linkEprel);
    expect(link).toHaveTextContent(baseRow.eprelCode as string);
  });

  it('renderizza solo Typography con emptyData se eprelCode è stringa vuota', () => {
    render(<EprelLink row={{ ...baseRow, eprelCode: '' }} />);
    expect(screen.getByText(emptyData)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renderizza solo Typography con emptyData se eprelCode è undefined', () => {
    render(<EprelLink row={{ ...baseRow, eprelCode: undefined }} />);
    expect(screen.getByText(emptyData)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renderizza solo Typography con emptyData se eprelCode è null', () => {
    render(<EprelLink row={{ ...baseRow, eprelCode: null as any }} />);
    expect(screen.getByText(emptyData)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();