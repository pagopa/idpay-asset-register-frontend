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
    expect(ROUTES.OVERVIEW).toBe('/base/:initiativeId/panoramica');
    expect(ROUTES.ADD_PRODUCTS).toBe('/base/:initiativeId/aggiungi-prodotti');
    expect(ROUTES.ASSISTANCE).toBe('/base/:initiativeId/assistenza');
    expect(ROUTES.TOS).toBe('/base/terms-of-service');
    expect(ROUTES.PRIVACY_POLICY).toBe('/base/privacy-policy');
    expect(ROUTES.PRODUCTS).toBe('/base/:initiativeId/prodotti');
    expect(ROUTES.UPLOADS).toBe('/base/:initiativeId/storico-caricamenti');
    expect(ROUTES.INVITALIA_PRODUCTS_LIST).toBe('/base/:initiativeId/lista-prodotti');
    expect(ROUTES.PRODUCERS).toBe('/base/:initiativeId/produttori');
    expect(ROUTES.UPCOMING).toBe('/base/:initiativeId/iniziativa-in-arrivo');
  });
});
