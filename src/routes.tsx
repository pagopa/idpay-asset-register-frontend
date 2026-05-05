import { ENV } from './utils/env';

export const BASE_ROUTE = ENV.PUBLIC_URL;

const ROUTES = {
  AUTH: `${BASE_ROUTE}/auth`,
  HOME: `${BASE_ROUTE}`,
  OVERVIEW: `${BASE_ROUTE}/:initiativeId/panoramica`,
  ADD_PRODUCTS: `${BASE_ROUTE}/:initiativeId/aggiungi-prodotti`,
  ASSISTANCE: `${BASE_ROUTE}/:initiativeId/assistenza`,
  PRODUCTS: `${BASE_ROUTE}/:initiativeId/prodotti`,
  UPLOADS: `${BASE_ROUTE}/:initiativeId/storico-caricamenti`,
  INVITALIA_PRODUCTS_LIST: `${BASE_ROUTE}/:initiativeId/lista-prodotti`,
  PRODUCERS: `${BASE_ROUTE}/:initiativeId/produttori`,
  UPCOMING: `${BASE_ROUTE}/:initiativeId/iniziativa-in-arrivo`,

  TOS: `${BASE_ROUTE}/terms-of-service`,
  PRIVACY_POLICY: `${BASE_ROUTE}/privacy-policy`,
};

export default ROUTES;
