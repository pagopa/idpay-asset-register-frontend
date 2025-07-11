import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {RootState} from "../store";

export interface ProductsState {
  batchName: string;
  batchId: string;
}

const initialState: ProductsState = {
  batchName: '',
  batchId: '',
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setBatchName: (state, action: PayloadAction<string>) => ({
      ...state,
      batchName: action.payload,
    }),
    setBatchId: (state, action: PayloadAction<string>) => ({
      ...state,
      batchId: action.payload,
    }),
  },
});

export const { setBatchName, setBatchId } = productsSlice.actions;
export const productsReducer = productsSlice.reducer;
export const batchNameSelector = (state: RootState): string | undefined =>
    state.products.batchName;
export const batchIdSelector = (state: RootState): string | undefined =>
    state.products.batchId;