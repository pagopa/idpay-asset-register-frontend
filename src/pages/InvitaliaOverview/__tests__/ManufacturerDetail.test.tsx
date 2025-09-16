import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ManufacturerDetail from '../ManufacturerDetail';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockData = {
  description: 'ACME S.p.A.',
  fiscalCode: 'ABCDEF12G34H567I',
  vatNumber: '12345678901',
  address: 'Via Roma 1, 00100 Roma',
  digitalAddress: 'acme@pec.it',
};

describe('ManufacturerDetail', () => {
  it('renders all DrawerItems with correct values', () => {
    render(<ManufacturerDetail data={mockData as any} />);
    expect(screen.getAllByText(mockData.description).length).toBeGreaterThan(0);
    expect(screen.getByText(mockData.fiscalCode)).toBeInTheDocument();
    expect(screen.getByText(mockData.vatNumber)).toBeInTheDocument();
    expect(screen.getByText(mockData.address)).toBeInTheDocument();
    expect(screen.getByText(String(mockData.digitalAddress))).toBeInTheDocument();
  });

  it('renders DrawerItem with copyable for digitalAddress', () => {
    render(<ManufacturerDetail data={mockData as any} />);
    expect(screen.getByTestId('ContentCopyIcon')).toBeInTheDocument();
  });

  it('has data-testid manufacturer-detail on root element', () => {
    render(<ManufacturerDetail data={mockData as any} />);
    expect(screen.getByTestId('manufacturer-detail')).toBeInTheDocument();
  });
});
