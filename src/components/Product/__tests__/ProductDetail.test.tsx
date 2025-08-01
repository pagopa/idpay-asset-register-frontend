import { render, screen } from '@testing-library/react';
import ProductDetail from '../ProductDetail';
import { ProductDTO } from '../../../api/generated/register/ProductDTO';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../locale';
import '@testing-library/jest-dom';
import {CategoryEnum} from "../../../api/generated/register/UploadDTO";

jest.mock('../../../utils/env', () => ({
    __esModule: true,
    ENV: {
        URL_API: {
            OPERATION: 'https://mock-api/register',
        },
        ASSISTANCE: {
            EMAIL: 'email@example.com',
        },
        API_TIMEOUT_MS: {
            OPERATION: 5000,
        },
    },
}));

jest.mock('../../../routes', () => ({
    __esModule: true,
    default: {
        HOME: '/home'
    },
    BASE_ROUTE: '/base'
}));

const mockProduct: ProductDTO = {
    batchName: 'Batch 001',
    registrationDate: new Date('2023-01-01'),
    eprelCode: 'EPREL123456',
    gtinCode: '1234567890123',
    productCode: 'PROD001',
    category: 'Lavatrice' as CategoryEnum,
    brand: 'BrandX',
    model: 'ModelY',
    energyClass: 'A++',
    countryOfProduction: 'Italia',
};


const mockProductEmpty: ProductDTO = {
    batchName: '',
    registrationDate: null,
    eprelCode: '',
    gtinCode: '',
    productCode: '',
    category: '',
    brand: '',
    model: '',
    energyClass: '',
    countryOfProduction: '',
};
describe('ProductDetail', () => {
    it('renders product details correctly', () => {
        render(
            <I18nextProvider i18n={i18n}>
                <ProductDetail data={mockProduct} open={false} isInvitaliaUser={false} />
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

    it('renders product empty details correctly', () => {
        render(
            <I18nextProvider i18n={i18n}>
                <ProductDetail data={mockProductEmpty} open={false} isInvitaliaUser={false} />
            </I18nextProvider>
        );

        const detailBox = screen.getByTestId('product-detail');
        expect(detailBox).toBeInTheDocument();
    });
});
