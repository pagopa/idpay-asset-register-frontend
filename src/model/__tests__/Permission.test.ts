import { permission2PermissionModel } from '../Permission';

const mockedPermission = {
  name: '',
  description: '',
  mode: '',
};

test('Test permission2PermissionModel', () => {
  const permission = permission2PermissionModel(mockedPermission);
  expect(permission).toStrictEqual({
    name: '',
    description: '',
    mode: '',
  });
});
