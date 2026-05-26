export const testToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Nzk3MDU4NzYsImV4cCI6MTc3OTczNDY3NiwiYXVkIjoiaWRwYXkucmVnaXN0ZXIud2VsZmFyZS5wYWdvcGEuaXQiLCJpc3MiOiJodHRwczovL2FwaS1pby5kZXYuY3N0YXIucGFnb3BhLml0IiwidWlkIjoiMTk1ZGE3MGYtZDNmMC00YzU3LWI2MmUtZWY0NzEzNDhlOTIwIiwibmFtZSI6IkxvcmVuem8iLCJmYW1pbHlfbmFtZSI6IkxvbGxvIiwib3JnX2VtYWlsIjoidGVzdC5yZGIuZGV2QGdtYWlsLmNvbSIsIm9yZ19pZCI6IjcyYzJjNWY4LTFjNzEtNDYxNC1hNGIzLTk1ZTNhZWU3MWMzZCIsIm9yZ192YXQiOiJDSEUtMTIzLjQ1Ni43MTIiLCJvcmdfZmMiOiJDSEUtMTIzLjQ1Ni43MTIiLCJvcmdfbmFtZSI6IlByb2R1dHRvcmUgU3ZlblZhdGgiLCJvcmdfcGFydHlfcm9sZSI6Ik9QRVJBVE9SIiwib3JnX3JvbGUiOiJvcGVyYXRvcmUiLCJvcmdfYWRkcmVzcyI6IlZpYSBNdW5pY2lwaW8gTi4gOCwgODEwMzUgUm9jY2Ftb25maW5hIChDRSkiLCJvcmdfcGVjIjoicHJvdG9jb2xsby5yb2NjYW1vbmZpbmFAYXNtZXBlYy5pdCJ9.bgFruHhhHshCIqJaNG_a_1Bpn0WoXLIdtaFf1XNbdEqEkryAeZRmRf9jPWDIealg4GKzEm6zAFTP4tfMUgGllGBP2JIUAN5h2FWTVdIcZ8HMkzwxeyEbI9-wOJA5A8SOHQDz50BapN7pWIdJYF1mAtdM5wNwZJR5qoskB8N7Y1DOKixgMtL6pHJhzgdsIi6abF-cCdDDpRvOG0lSc_KV1ZAyfTvKFEWnekme8jxf0cEcsaNSWyD8ENLcXpMnm7mz0XA6UIaiwxp1CWhqdtnmM52wO5S7Aj5Cm1QV2ZWZBY1Hzzpod4CnzzacCjmp9KQRc32w5J1NpJeJcx13mhOdWQ';

const IS_DEVELOP = process.env.NODE_ENV === 'development';
export const DEBUG_CONSOLE = false;
export const MOCK_USER = IS_DEVELOP;
export const LOG_REDUX_ACTIONS = false;

export const LOADING_TASK_LOGIN_CHECK = 'LOGIN_CHECK';
export const LOADING_TASK_SEARCH_PARTIES = 'SEARCH_PARTIES';
export const LOADING_TASK_SEARCH_PARTY = 'SEARCH_PARTY';
export const LOADING_TASK_SEARCH_PRODUCTS = 'SEARCH_PRODUCTS';

export enum PRODUCTS_STATES {
  UPLOADED = 'UPLOADED',
  WAIT_APPROVED = 'WAIT_APPROVED',
  SUPERVISED = 'SUPERVISED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum MIDDLE_STATES {
  REJECT_APPROVATION = 'REJECT_APPROVATION',
  ACCEPT_APPROVATION = 'ACCEPT_APPROVATION',
}

export enum USERS_TYPES {
  OPERATORE = 'operatore',
  INVITALIA_L1 = 'invitalia',
  INVITALIA_L2 = 'invitalia_admin',
}
// Deprecation imminent, to be removed in favor of config.json
export enum USERS_NAMES {
  OPERATORE = 'Operatore',
  INVITALIA_L1 = 'L1',
  INVITALIA_L2 = 'L2',
}

export const EMPTY_DATA = '-';
// export const L1_MOTIVATION_OK = 'Da approvare';
// export const L2_MOTIVATION_OK = 'Approvato';
/* export const MAX_TABLE_HEIGHT = 700; */
// export const PAGINATION_ROWS_PRODUCTS = [10, 25, 50, 100];
export const PAGINATION_ROWS_UPLOADS = 20;

export const MAX_LENGTH_EMAIL: number = 40;
export const MAX_LENGTH_OVERVIEW_PROD: number = 75;
export const MAX_LENGTH_OVERVIEW_INVIT: number = 140;

/* export const MAX_LENGTH_DETAILL_PR: number = 40; */
/* export const MIN_LENGTH_TABLE_PR: number = 30; */
/* export const MAX_LENGTH_TABLE_PR: number = 45; */
/* export const RESOLUTION_UPSCALING = 1440; */

export const MIN_LENGTH_TEXTFIELD_POPUP = 2;
export const MAX_LENGTH_TEXTFIELD_POPUP = 200;

export const UPCOMING_INITIATIVE_DAY = '20/10/2025';
