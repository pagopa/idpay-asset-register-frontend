import { ENV } from './utils/env';

export const BASE_ROUTE = ENV.PUBLIC_URL;

const ROUTES = {
  AUTH: `${BASE_ROUTE}/auth`,
  HOME: `${BASE_ROUTE}`,
  ASSISTANCE: `${BASE_ROUTE}/assistenza`,
  TOS: `${BASE_ROUTE}/terms-of-service`,
  PRIVACY_POLICY: `${BASE_ROUTE}/privacy-policy`,
  PRODUCTS: `${BASE_ROUTE}/prodotti`,
  UPLOADS: `${BASE_ROUTE}/storico-caricamenti`,
};

export default ROUTES;
