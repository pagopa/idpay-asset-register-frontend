jest.mock('./utils/env', () => ({
  ENV: {
    PUBLIC_URL: '/base',
  },
}));

describe('ROUTES', () => {
  it('costruisce correttamente tutte le route a partire da ENV.PUBLIC_URL', () => {
    const ROUTES = require('../routes.tsx').default;

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
