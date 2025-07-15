import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {RootState} from "../store";

export interface InvitaliaState {
    institution: string;
}

const initialState: InvitaliaState = {
    institution: '',
};

export const invitaliaSlice = createSlice({
    name: 'invitalia',
    initialState,
    reducers: {
        setInstitution: (state, action: PayloadAction<string>) => ({
            ...state,
            institution: action.payload,
        }),
    },
});

export const { setInstitution } = invitaliaSlice.actions;
export const invitaliaReducer = invitaliaSlice.reducer;
export const institutionSelector = (state: RootState): string | undefined =>
    state.invitalia.institution;