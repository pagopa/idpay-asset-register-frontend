import { ENV } from './utils/env';

export const BASE_ROUTE = ENV.PUBLIC_URL;

const ROUTES = {
  AUTH: `${BASE_ROUTE}/auth`,
  HOME: `${BASE_ROUTE}`,
  ADD_PRODUCTS: `${BASE_ROUTE}/aggiungi-prodotti`,
  ASSISTANCE: `${BASE_ROUTE}/assistenza`,
  TOS: `${BASE_ROUTE}/terms-of-service`,
  PRIVACY_POLICY: `${BASE_ROUTE}/privacy-policy`,
  PRODUCTS: `${BASE_ROUTE}/prodotti`,
  UPLOADS: `${BASE_ROUTE}/storico-caricamenti`,
  INVITALIA_PRODUCTS_LIST: `${BASE_ROUTE}/lista-prodotti`
};

export default ROUTES;
