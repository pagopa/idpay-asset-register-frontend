jest.mock('../utils/env', () => ({
    ENV: {
        PUBLIC_URL: '/base',
    },
}));

import ROUTES, { BASE_ROUTE } from '../routes';

describe('ROUTES', () => {
    test('BASE_ROUTE should match ENV.PUBLIC_URL', () => {
        expect(BASE_ROUTE).toBe('/base');
    });

    test('should generate correct route paths', () => {
        expect(ROUTES.AUTH).toBe('/base/auth');
        expect(ROUTES.HOME).toBe('/base');
        expect(ROUTES.ADD_PRODUCTS).toBe('/base/aggiungi-prodotti');
        expect(ROUTES.ASSISTANCE).toBe('/base/assistenza');
        expect(ROUTES.TOS).toBe('/base/terms-of-service');
        expect(ROUTES.PRIVACY_POLICY).toBe('/base/privacy-policy');
        expect(ROUTES.PRODUCTS).toBe('/base/prodotti');
        expect(ROUTES.UPLOADS).toBe('/base/storico-caricamenti');
    });
});
