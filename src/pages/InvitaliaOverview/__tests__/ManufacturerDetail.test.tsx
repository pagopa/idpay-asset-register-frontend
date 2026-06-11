import '@testing-library/jest-dom';
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
  address: 'Via Roma 1',
  zipCode: '00100',
  city: 'Roma',
  county: 'RM',
  digitalAddress: 'acme@pec.it',
};

const emptyMockData = {
  description: undefined,
  fiscalCode: undefined,
  vatNumber: undefined,
  address: undefined,
  zipCode: undefined,
  city: undefined,
  county: undefined,
  digitalAddress: undefined,
};

jest.mock('../../../redux/api/initiativesApi', () => ({
  useGetInitiativesQuery: () => ({ data: [], isLoading: false }),
}));

describe('ManufacturerDetail', () => {
  it('renders all DrawerItems with correct labels and formatted values', () => {
    render(<ManufacturerDetail data={mockData as any} />);
    expect(screen.getByRole('heading', { name: mockData.description })).toBeInTheDocument();
    expect(
      screen.getByText('pages.invitaliaOverview.manufacturerSheet')
    ).toBeInTheDocument();
    expect(screen.getByText('pages.invitaliaProductsList.ragioneSociale')).toBeInTheDocument();
    expect(screen.getByText('pages.invitaliaProductsList.codiceFiscale')).toBeInTheDocument();
    expect(screen.getByText('pages.invitaliaProductsList.piva')).toBeInTheDocument();
    expect(screen.getByText('pages.invitaliaProductsList.sedeLegale')).toBeInTheDocument();
    expect(screen.getByText('pages.invitaliaProductsList.pec')).toBeInTheDocument();
    expect(screen.getByText(mockData.fiscalCode)).toBeInTheDocument();
    expect(screen.getByText(mockData.vatNumber)).toBeInTheDocument();
    expect(screen.getByText('Via Roma 1, 00100 Roma (RM)')).toBeInTheDocument();
    expect(screen.getByText(String(mockData.digitalAddress))).toBeInTheDocument();
  });

  it('renders empty values when data values are missing', () => {
    render(<ManufacturerDetail data={emptyMockData as any} />);
    expect(screen.getByText('pages.invitaliaOverview.manufacturerSheet')).toBeInTheDocument();
    expect(screen.getByText('pages.invitaliaProductsList.ragioneSociale')).toBeInTheDocument();
    expect(screen.getByText('pages.invitaliaProductsList.codiceFiscale')).toBeInTheDocument();
    expect(screen.getByText('pages.invitaliaProductsList.piva')).toBeInTheDocument();
    expect(screen.getByText('pages.invitaliaProductsList.sedeLegale')).toBeInTheDocument();
    expect(screen.getByText('pages.invitaliaProductsList.pec')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent('');
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
