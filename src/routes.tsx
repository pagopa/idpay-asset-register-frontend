import { ENV } from './utils/env';

export const BASE_ROUTE = ENV.PUBLIC_URL;

const ROUTES = {
  AUTH: `${BASE_ROUTE}/auth`,
  HOME: `${BASE_ROUTE}`,

  /**
   * Initiative scoped base route
   * Strict URL-driven initiative
   */
  INITIATIVE_BASE: `${BASE_ROUTE}/initiative/:initiativeId`,

  ADD_PRODUCTS: `${BASE_ROUTE}/initiative/:initiativeId/aggiungi-prodotti`,
  ASSISTANCE: `${BASE_ROUTE}/initiative/:initiativeId/assistenza`,
  PRODUCTS: `${BASE_ROUTE}/initiative/:initiativeId/prodotti`,
  UPLOADS: `${BASE_ROUTE}/initiative/:initiativeId/storico-caricamenti`,
  INVITALIA_PRODUCTS_LIST: `${BASE_ROUTE}/initiative/:initiativeId/lista-prodotti`,
  PRODUCERS: `${BASE_ROUTE}/initiative/:initiativeId/produttori`,
  UPCOMING: `${BASE_ROUTE}/initiative/:initiativeId/iniziativa-in-arrivo`,

  TOS: `${BASE_ROUTE}/terms-of-service`,
  PRIVACY_POLICY: `${BASE_ROUTE}/privacy-policy`,
};

export default ROUTES;
