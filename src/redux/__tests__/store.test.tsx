import { describe, test, expect, jest } from '@jest/globals';
import type { AnyAction } from '@reduxjs/toolkit';

const mockConfigureStore = jest.fn();
const mockCombineReducers = jest.fn();
const mockCreateAsyncThunk = jest.fn(() => jest.fn());
const mockCreateSlice = jest.fn(() => ({
  reducer: (state: any) => state,
  actions: {},
}));
const mockPersistReducer = jest.fn();
const mockPersistStore = jest.fn();
const mockLoggerMiddleware = jest.fn((_) => (next: any) => (action: AnyAction) => next(action));
const mockBaseApiMiddleware = jest.fn((_) => (next: any) => (action: AnyAction) => next(action));

jest.mock('@reduxjs/toolkit', () => ({
  __esModule: true,
  configureStore: (...args: any[]) => mockConfigureStore.apply(null, args as any),
  combineReducers: (...args: any[]) => mockCombineReducers.apply(null, args as any),
  createAsyncThunk: mockCreateAsyncThunk,
  createSlice: mockCreateSlice,
}));

jest.mock('redux-persist', () => ({
  persistStore: (...args: any[]) => mockPersistStore(...args),
  persistReducer: (...args: any[]) => mockPersistReducer(...args),
}));

jest.mock('redux-logger', () => ({
  __esModule: true,
  default: mockLoggerMiddleware,
}));

const makeDummyReducer = (name: string) => {
  const initial = { __name: name };
  return (state = initial) => state;
};

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateReducer: makeDummyReducer('appState'),
}));
jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice', () => ({
  userReducer: makeDummyReducer('user'),
}));
jest.mock('../slices/partiesSlice', () => ({
  partiesReducer: makeDummyReducer('parties'),
}));
jest.mock('../slices/permissionsSlice', () => ({
  permissionsReducer: makeDummyReducer('permissions'),
}));
jest.mock('../slices/productsSlice', () => ({
  productsReducer: makeDummyReducer('products'),
}));
jest.mock('../slices/invitaliaSlice', () => ({
  invitaliaReducer: makeDummyReducer('invitalia'),
}));
jest.mock('../slices/initiativesSlice', () => ({
  __esModule: true,
  initiativesReducer: makeDummyReducer('initiatives'),
}));
jest.mock('../api/baseApi', () => ({
  baseApi: {
    reducerPath: 'baseApi',
    reducer: makeDummyReducer('baseApi'),
    middleware: mockBaseApiMiddleware,
  },
}));

const loadStoreModule = async (logReduxActions: boolean) => {
  jest.resetModules();

  jest.doMock('../../utils/constants', () => ({
    LOG_REDUX_ACTIONS: logReduxActions,
  }));

  mockConfigureStore.mockClear();
  mockCombineReducers.mockClear();
  mockPersistReducer.mockClear();
  mockPersistStore.mockClear();
  mockLoggerMiddleware.mockClear();
  mockBaseApiMiddleware.mockClear();

  const fakeRootReducer = (state: any = {}, action: AnyAction) => state;
  mockCombineReducers.mockReturnValue(fakeRootReducer);

  mockPersistReducer.mockImplementation((_config, reducer) => reducer);

  const fakeStore = {
    getState: () => ({ ok: true }),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  };
  mockConfigureStore.mockReturnValue(fakeStore);

  const fakePersistor = { flush: jest.fn(), purge: jest.fn() };
  mockPersistStore.mockReturnValue(fakePersistor);

  const mod = await import('../store');
  return { mod, fakeStore, fakePersistor, fakeRootReducer };
};

describe('store configuration', () => {
  test('usa i reducer corretti, applica persistReducer con la whitelist e disattiva il serializableCheck', async () => {
    const { mod, fakeStore, fakePersistor } = await loadStoreModule(false);

    expect(mockCombineReducers).toHaveBeenCalledTimes(1);
    const reducersArg = mockCombineReducers.mock.calls[0][0] as any;
    expect(Object.keys(reducersArg as any)).toEqual([
      'user',
      'appState',
      'parties',
      'permissions',
      'products',
      'invitalia',
      'initiatives',
      'baseApi',
    ]);

    expect(mockPersistReducer).toHaveBeenCalledTimes(1);
    const [persistConfigArg, rootReducerArg] = mockPersistReducer.mock.calls[0] as any;

    expect(persistConfigArg).toMatchObject({
      key: 'root',
      whitelist: ['invitalia'],
    });
    expect(persistConfigArg.storage).toBeTruthy();

    expect(mockConfigureStore).toHaveBeenCalledTimes(1);
    const configureArg = mockConfigureStore.mock.calls[0][0] as any;

    expect(configureArg.reducer).toBe(rootReducerArg);

    expect(typeof configureArg.middleware).toBe('function');

    const fakeGDM = jest.fn().mockImplementation((opts) => {
      expect(opts).toEqual({ serializableCheck: false });
      return ['defaultMiddleware'];
    });
    const builtMiddleware = configureArg.middleware(fakeGDM);
    expect(builtMiddleware).toEqual(['defaultMiddleware', mockBaseApiMiddleware]);

    expect(mod.store).toBe(fakeStore);
    expect(mod.persistor).toBe(fakePersistor);

    expect(mockPersistStore).toHaveBeenCalledWith(fakeStore);
  });

  test('include il logger quando LOG_REDUX_ACTIONS è true', async () => {
    const { mod } = await loadStoreModule(true);

    const configureArg = mockConfigureStore.mock.calls[0][0] as any;

    const fakeGDM = jest.fn().mockReturnValue(['defaultMiddleware']);
    const builtMiddleware = configureArg.middleware(fakeGDM);

    expect(builtMiddleware).toHaveLength(3);
    expect(builtMiddleware[1]).toBe(mockBaseApiMiddleware);
    expect(typeof builtMiddleware[2]).toBe('function');

    expect(mod.store).toBeDefined();
    expect(mod.persistor).toBeDefined();
  });
});
