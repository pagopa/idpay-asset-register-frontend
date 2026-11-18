import { configureStore } from '@reduxjs/toolkit';
import {
  clearInitiativeConfig,
  initiativeConfigReducer,
  loadInitiativeConfigThunk,
  selectActiveInitiativeConfig,
} from '../initiativeConfigSlice';
import * as loader from '../../../locale/multiInitiativeConfig';

jest.mock('../../../locale/multiInitiativeConfig');

describe('initiativeConfigSlice', () => {
  const mockedLoader = loader as jest.Mocked<typeof loader>;

  const createTestStore = () =>
    configureStore({
      reducer: {
        initiativeConfig: initiativeConfigReducer,
      },
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load config and store it by key', async () => {
    const store = createTestStore();

    mockedLoader.loadItInitiativeConfig.mockResolvedValue({
      ui: { tables: { products: { enabled: true } } },
    } as any);

    await (store.dispatch as any)(
      loadInitiativeConfigThunk({
        initiativeId: 'decoder-id',
        role: 'invitalia',
      })
    );

    const state = store.getState().initiativeConfig;

    expect(state.loading).toBe(false);
    expect(state.error).toBe(false);
    expect(Object.keys(state.byKey).length).toBe(1);
    expect(mockedLoader.loadItInitiativeConfig).toHaveBeenCalledWith('decoder-id', 'invitalia');
  });

  it('should use cached config if key already exists', async () => {
    const store = createTestStore();

    mockedLoader.loadItInitiativeConfig.mockResolvedValue({ test: true } as any);

    const params = {
      initiativeId: 'decoder-id',
      role: 'invitalia',
    };

    await (store.dispatch as any)(loadInitiativeConfigThunk(params));
    await (store.dispatch as any)(loadInitiativeConfigThunk(params));

    expect(mockedLoader.loadItInitiativeConfig).toHaveBeenCalledTimes(1);
  });

  it('should cache configurations separately by initiative ID', async () => {
    const store = createTestStore();

    mockedLoader.loadItInitiativeConfig.mockResolvedValue({ test: true } as any);

    await (store.dispatch as any)(
      loadInitiativeConfigThunk({ initiativeId: 'initiative-a', role: 'invitalia' })
    );
    await (store.dispatch as any)(
      loadInitiativeConfigThunk({ initiativeId: 'initiative-b', role: 'invitalia' })
    );

    expect(mockedLoader.loadItInitiativeConfig).toHaveBeenCalledTimes(2);
    expect(Object.keys(store.getState().initiativeConfig.byKey)).toEqual([
      'initiative-a_invitalia',
      'initiative-b_invitalia',
    ]);
  });

  it('should set error on rejected thunk', async () => {
    const store = createTestStore();

    mockedLoader.loadItInitiativeConfig.mockRejectedValue(new Error('fail'));

    await (store.dispatch as any)(
      loadInitiativeConfigThunk({
        initiativeId: 'decoder-id',
        role: 'invitalia',
      })
    );

    const state = store.getState().initiativeConfig;
    expect(state.error).toBe(true);
  });

  it('should build a key when optional load parameters are missing', async () => {
    const store = createTestStore();
    const config = { test: true } as any;

    mockedLoader.loadItInitiativeConfig.mockResolvedValue(config);

    await (store.dispatch as any)(loadInitiativeConfigThunk({}));

    expect(mockedLoader.loadItInitiativeConfig).toHaveBeenCalledWith(
      undefined,
      undefined
    );
    expect(store.getState().initiativeConfig.byKey._).toEqual(config);
  });

  it('should clear loaded initiative config', async () => {
    const store = createTestStore();
    mockedLoader.loadItInitiativeConfig.mockResolvedValue({ test: true } as any);

    await (store.dispatch as any)(
      loadInitiativeConfigThunk({ initiativeId: 'decoder-id' })
    );
    store.dispatch(clearInitiativeConfig());

    expect(store.getState().initiativeConfig).toEqual({
      byKey: {},
      loading: false,
      error: false,
      activeKey: null,
    });
  });

  it('should select the active config or return null when none is active', async () => {
    const store = createTestStore();
    const config = { test: true } as any;

    expect(selectActiveInitiativeConfig(store.getState() as any)).toBeNull();

    mockedLoader.loadItInitiativeConfig.mockResolvedValue(config);
    await (store.dispatch as any)(
      loadInitiativeConfigThunk({ initiativeId: 'decoder-id' })
    );

    expect(selectActiveInitiativeConfig(store.getState() as any)).toEqual(config);
  });
});
