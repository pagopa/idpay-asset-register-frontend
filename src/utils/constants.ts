export const testToken =  '';

const IS_DEVELOP = process.env.NODE_ENV === 'development';
export const MOCK_USER = IS_DEVELOP;
export const LOG_REDUX_ACTIONS = IS_DEVELOP;

export const LOADING_TASK_LOGIN_CHECK = 'LOGIN_CHECK';
export const LOADING_TASK_SEARCH_PARTIES = 'SEARCH_PARTIES';
export const LOADING_TASK_SEARCH_PARTY = 'SEARCH_PARTY';
export const LOADING_TASK_SEARCH_PRODUCTS = 'SEARCH_PRODUCTS';

export enum PRODUCTS_CATEGORY {
  WASHINGMACHINES = 'WASHINGMACHINES',
  WASHERDRIERS = 'WASHERDRIERS',
  OVENS = 'OVENS',
  RANGEHOODS = 'RANGEHOODS',
  DISHWASHERS = 'DISHWASHERS',
  TUMBLEDRYERS = 'TUMBLEDRYERS',
  REFRIGERATINGAPPL = 'REFRIGERATINGAPPL',
  COOKINGHOBS = 'COOKINGHOBS',
}

export enum PRODUCTS_STATES {
  REJECTED = 'Esclusi',
  SUPERVISIONED = 'Contrassegnati',
  APPROVED = 'Approvati'
}




export const INVITALIA = 'invitalia';
export const PRODUTTORE = 'operatore';

export const EMPTY_DATA = '-';
export const MAX_TABLE_HEIGHT = 700;
export const PAGINATION_ROWS_PRODUCTS = 8;
export const PAGINATION_ROWS_UPLOADS = 20;

export const maxLengthEmail: number = 40;
export const maxLengthOverviewProd: number = 75;
export const maxLengthOverviewInvit: number = 140;


