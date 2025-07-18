import { render, screen } from '@testing-library/react';
import ProductDetail from '../ProductDetail';
import { ProductDTO } from '../../../api/generated/register/ProductDTO';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../locale';
import '@testing-library/jest-dom';

const mockProduct: ProductDTO = {
    batchName: 'Batch 001',
    registrationDate: new Date('2023-01-01'),
    eprelCode: 'EPREL123456',
    gtinCode: '1234567890123',
    productCode: 'PROD001',
    category: 'APPLIANCES',
    brand: 'BrandX',
    model: 'ModelY',
    energyClass: 'A++',
    countryOfProduction: 'Italia',
};

describe('ProductDetail', () => {
    it('renders product details correctly', () => {
        render(
            <I18nextProvider i18n={i18n}>
                <ProductDetail data={mockProduct} />
            </I18nextProvider>
        );

        const detailBox = screen.getByTestId('product-detail');
        expect(detailBox).toBeInTheDocument();

        expect(screen.getByText('Batch 001')).toBeInTheDocument();
        expect(screen.getByText('01/01/2023')).toBeInTheDocument();
        expect(screen.getByText('EPREL123456')).toBeInTheDocument();
        expect(screen.getByText('1234567890123')).toBeInTheDocument();
        expect(screen.getByText('PROD001')).toBeInTheDocument();
        expect(screen.getByText('BrandX')).toBeInTheDocument();
        expect(screen.getByText('ModelY')).toBeInTheDocument();
        expect(screen.getByText('A++')).toBeInTheDocument();
        expect(screen.getByText('Italia')).toBeInTheDocument();
    });
});
