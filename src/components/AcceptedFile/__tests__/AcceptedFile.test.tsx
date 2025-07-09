import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AcceptedFile from './AcceptedFile';

jest.mock('../../helpers', () => ({
  formatFileName: (name: string) => `formatted-${name}`,
}));

describe('AcceptedFile', () => {
  const defaultProps = {
    fileName: 'testfile.csv',
    fileDate: '01/01/2024',
    chipLabel: 'Caricato',
    buttonLabel: 'Carica nuovo',
    buttonHandler: jest.fn(),
  };

  it('renderizza correttamente tutti i dati', () => {
    render(<AcceptedFile {...defaultProps} />);
    expect(screen.getByText('formatted-testfile.csv')).toBeInTheDocument();
    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
    expect(screen.getByText('Caricato')).toBeInTheDocument();
    expect(screen.getByText('Carica nuovo')).toBeInTheDocument();
  });

  it('chiama buttonHandler al click sul bottone', () => {
    render(<AcceptedFile {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.buttonHandler).toHaveBeenCalledTimes(1);
  });

  it('gestisce fileName undefined', () => {
    render(<AcceptedFile {...defaultProps} fileName={undefined} />);
    expect(screen.getByText('formatted-undefined')).toBeInTheDocument();
  });

  it('gestisce fileDate undefined', () => {
    render(<AcceptedFile {...defaultProps} fileDate={undefined} />);
    // Typography renderizza stringa vuota
    expect(screen.getByText('')).toBeInTheDocument();
  });
});
