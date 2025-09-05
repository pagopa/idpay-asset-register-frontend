export const testToken = '';
 
const IS_DEVELOP = process.env.NODE_ENV === 'development';
export const MOCK_USER = IS_DEVELOP;
export const LOG_REDUX_ACTIONS = IS_DEVELOP;

export const LOADING_TASK_LOGIN_CHECK = 'LOGIN_CHECK';
export const LOADING_TASK_SEARCH_PARTIES = 'SEARCH_PARTIES';
export const LOADING_TASK_SEARCH_PARTY = 'SEARCH_PARTY';
export const LOADING_TASK_SEARCH_PRODUCTS = 'SEARCH_PRODUCTS';

export enum PRODUCTS_CATEGORIES {
  TUMBLEDRYERS = 'TUMBLEDRYERS',
  RANGEHOODS = 'RANGEHOODS',
  OVENS = 'OVENS',
  REFRIGERATINGAPPL = 'REFRIGERATINGAPPL',
  WASHERDRIERS = 'WASHERDRIERS',
  DISHWASHERS = 'DISHWASHERS',
  WASHINGMACHINES = 'WASHINGMACHINES',
  COOKINGHOBS = 'COOKINGHOBS'
}

export enum PRODUCTS_STATES {
  UPLOADED= 'UPLOADED',
  WAIT_APPROVED = 'WAIT_APPROVED',
  SUPERVISED = 'SUPERVISED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum USERS_TYPES {
  OPERATORE = 'operatore',
  INVITALIA_L1 = 'invitalia',
  INVITALIA_L2 = 'invitalia_admin'
}

export enum USERS_NAMES {
  OPERATORE = 'operatore',
  INVITALIA_L1 = 'L1',
  INVITALIA_L2 = 'L2'
}

export const EMPTY_DATA = '-';
export const MAX_TABLE_HEIGHT = 700;
export const PAGINATION_ROWS_PRODUCTS = 10;
export const PAGINATION_ROWS_UPLOADS = 20;

export const maxLengthEmail: number = 40;
export const maxLengthOverviewProd: number = 75;
export const maxLengthOverviewInvit: number = 140;
export const MAX_LENGTH_DETAILL_PR: number = 40;
export const MAX_LENGTH_TABLE_PR: number = 15;
