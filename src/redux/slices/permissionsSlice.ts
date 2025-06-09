import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Permission } from '../../model/Permission';
import type { RootState } from '../store';

export interface PermissionsState {
  role: string;
  permissions?: Array<Permission>;
}

const initialState: PermissionsState = {
  role: '',
  permissions: [],
};

/* TODO permissions update for asset register  */
export const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setUserRole: (state, action: PayloadAction<string>) => ({
      ...state,
      role: action.payload,
    }),
    setPermissionsList: (state, action: PayloadAction<Array<Permission>>) => ({
      ...state,
      permissions: [...action.payload],
    }),
  },
});

export const { setUserRole, setPermissionsList } = permissionsSlice.actions;
export const permissionsReducer = permissionsSlice.reducer;
export const permissionsSelector = (state: RootState): Array<Permission> | undefined =>
  state.permissions.permissions;
