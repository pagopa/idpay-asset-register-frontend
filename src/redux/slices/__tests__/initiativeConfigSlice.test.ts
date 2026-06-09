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
        initiativeName: 'Bonus Decoder',
        role: 'invitalia',
        startDate: '2026-01-01',
      })
    );

    const state = store.getState().initiativeConfig;

    expect(state.loading).toBe(false);
    expect(state.error).toBe(false);
    expect(Object.keys(state.byKey).length).toBe(1);
  });

  it('should use cached config if key already exists', async () => {
    const store = createTestStore();

    mockedLoader.loadItInitiativeConfig.mockResolvedValue({ test: true } as any);

    const params = {
      initiativeName: 'Bonus Decoder',
      role: 'invitalia',
      startDate: '2026-01-01',
    };

    await (store.dispatch as any)(loadInitiativeConfigThunk(params));
    await (store.dispatch as any)(loadInitiativeConfigThunk(params));

    expect(mockedLoader.loadItInitiativeConfig).toHaveBeenCalledTimes(1);
  });

  it('should set error on rejected thunk', async () => {
    const store = createTestStore();

    mockedLoader.loadItInitiativeConfig.mockRejectedValue(new Error('fail'));

    await (store.dispatch as any)(
      loadInitiativeConfigThunk({
        initiativeName: 'Bonus Decoder',
        role: 'invitalia',
        startDate: '2026-01-01',
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
      undefined,
      true,
      undefined
    );
    expect(store.getState().initiativeConfig.byKey.__).toEqual(config);
  });

  it('should clear loaded initiative config', async () => {
    const store = createTestStore();
    mockedLoader.loadItInitiativeConfig.mockResolvedValue({ test: true } as any);

    await (store.dispatch as any)(
      loadInitiativeConfigThunk({ initiativeName: 'Bonus Decoder' })
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
      loadInitiativeConfigThunk({ initiativeName: 'Bonus Decoder' })
    );

    expect(selectActiveInitiativeConfig(store.getState() as any)).toEqual(config);
  });
});
