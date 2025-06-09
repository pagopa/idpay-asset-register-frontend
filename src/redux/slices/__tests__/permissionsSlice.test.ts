import { Permission } from '../../../model/Permission';
import { createStore } from '../../store';
import {
  permissionsReducer,
  permissionsSelector,
  PermissionsState,
  setPermissionsList,
  setUserRole,
} from '../permissionsSlice';

describe('initiative Summary slice ', () => {
  const store = createStore();
  const mockedInitialState: PermissionsState = {
    role: '',
    permissions: [],
  };
  const mockedPermissionArray: Permission[] = [];
  test('initiative Summary slice actions', () => {
    expect(permissionsReducer(mockedInitialState, setUserRole(''))).toBeDefined();
    expect(
      permissionsReducer(mockedInitialState, setPermissionsList(mockedPermissionArray))
    ).toBeDefined();
  });
  test('initiative Summary slice slectors', () => {
    expect(permissionsSelector(store.getState())).not.toBeNull();
  });
});
