import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { loadItInitiativeConfig, InitiativeTablesConfig } from '../../locale/multiInitiativeConfig';

type LoadParams = {
  initiativeName?: string;
  role?: string;
  startDate?: string;
};

type InitiativeConfigState = {
  byKey: Record<string, InitiativeTablesConfig>;
  loading: boolean;
  error: boolean;
  activeKey: string | null;
};

const initialState: InitiativeConfigState = {
  byKey: {},
  loading: false,
  error: false,
  activeKey: null,
};

const buildKey = ({ initiativeName, role, startDate }: LoadParams) =>
  `${initiativeName ?? ''}_${startDate ?? ''}_${role ?? ''}`;

export const loadInitiativeConfigThunk = createAsyncThunk<
  { key: string; config: InitiativeTablesConfig },
  LoadParams,
  { state: RootState }
>('initiativeConfig/load', async (params, { getState }) => {
  const key = buildKey(params);
  const state = getState().initiativeConfig;

  // Cache hit → return existing config
  if (state.byKey[key]) {
    return { key, config: state.byKey[key] };
  }

  const config = await loadItInitiativeConfig(
    params.initiativeName,
    params.role,
    true,
    params.startDate
  );

  return { key, config };
});

const initiativeConfigSlice = createSlice({
  name: 'initiativeConfig',
  initialState,
  reducers: {
    clearInitiativeConfig() {
      return {
        ...initialState,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadInitiativeConfigThunk.pending, (state) => ({
        ...state,
        loading: true,
        error: false,
      }))
      .addCase(
        loadInitiativeConfigThunk.fulfilled,
        (state, action: PayloadAction<{ key: string; config: InitiativeTablesConfig }>) => {
          const { key, config } = action.payload;
          return {
            ...state,
            byKey: {
              ...state.byKey,
              [key]: config,
            },
            activeKey: key,
            loading: false,
          };
        }
      )
      .addCase(loadInitiativeConfigThunk.rejected, (state) => ({
        ...state,
        loading: false,
        error: true,
      }));
  },
});

export const { clearInitiativeConfig } = initiativeConfigSlice.actions;

export const selectActiveInitiativeConfig = (state: RootState) => {
  const key = state.initiativeConfig.activeKey;
  return key ? state.initiativeConfig.byKey[key] : null;
};

export const initiativeConfigReducer = initiativeConfigSlice.reducer;
