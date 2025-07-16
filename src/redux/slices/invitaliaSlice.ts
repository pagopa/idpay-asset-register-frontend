import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {RootState} from "../store";
import {Institution} from "../../model/Institution";

export interface InvitaliaState {
    institution: Institution;
}

const initialState: InvitaliaState = {
    institution: {
        'institutionId': '',
        'createdAt': '',
        'updatedAt': '',
        'description': ''
    },
};

export const invitaliaSlice = createSlice({
    name: 'invitalia',
    initialState,
    reducers: {
        setInstitution: (state, action: PayloadAction<Institution>) => ({
            ...state,
            institution: action.payload,
        }),
    },
});

export const { setInstitution } = invitaliaSlice.actions;
export const invitaliaReducer = invitaliaSlice.reducer;
export const institutionSelector = (state: RootState): Institution | undefined =>
    state.invitalia.institution;