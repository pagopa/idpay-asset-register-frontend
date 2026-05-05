import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { InitiativeDTO } from '../../api/generated/register';
import type { RootState } from '../store';

type InitiativeDTOArray = Array<InitiativeDTO>;

export interface InitiativesState {
  list?: InitiativeDTOArray;
}

const initialState: InitiativesState = {};

/* eslint-disable functional/immutable-data */
export const initiativesSlice = createSlice({
  name: 'initiatives',
  initialState,
  reducers: {
    setInitiativesList: (state, action: PayloadAction<InitiativeDTOArray>) => {
      state.list = [...action.payload];
    },
    clearInitiativesList: (state) => {
      state.list = undefined;
    },
  },
});

export const { setInitiativesList, clearInitiativesList } = initiativesSlice.actions;
export const initiativesReducer = initiativesSlice.reducer;

export const initiativesListSelector = (state: RootState): InitiativeDTOArray | undefined =>
  state.initiatives?.list;

export type InitiativeExtended = InitiativeDTO & {
  spendingPeriod: string;
};

export const currentInitiativeSelector = createSelector(
  [initiativesListSelector, (_: RootState, initiativeId: string | undefined) => initiativeId],
  (initiatives, initiativeId): InitiativeExtended | undefined => {
    if (!initiatives || !initiativeId) {
      return undefined;
    }

    const initiative = initiatives.find((i) => i.initiativeId === initiativeId);

    if (!initiative) {
      return undefined;
    }

    const spendingPeriod =
      initiative.startDate && initiative.endDate
        ? `${new Date(initiative.startDate).toLocaleDateString('it-IT')} - ${new Date(
            initiative.endDate
          ).toLocaleDateString('it-IT')}`
        : '';

    return {
      ...initiative,
      spendingPeriod,
    };
  }
);
