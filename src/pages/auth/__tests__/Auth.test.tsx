import React from 'react';
import { render } from '@testing-library/react';
import Auth from '../Auth';
import { ENV } from '../../../utils/env';
import { User } from '@pagopa/selfcare-common-frontend/model/User';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import ROUTES from '../../../routes';
import { testToken } from '../../../utils/constants';

const token = testToken;

const oldWindowLocation = global.window.location;
const mockedLocation = { assign: jest.fn(), hash: '#token=' + token, origin: 'MOCKEDORIGIN' };

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});
afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

test('test login success', () => {
  render(<Auth />);

  // expect(storageTokenOps.read()).toBe(token);

  // const user: User = storageUserOps.read();
  // expect(user).not.toBeNull();
  // expect(user.uid).toBe('b8986bf2-1f93-4827-ab16-b21eb8aeae2b');
  // expect(user.taxCode).toBe('');
  // expect(user.name).toBe('Test');
  // expect(user.surname).toBe('IDPay');
  // expect(user.email).toBe('test@test.com');

  // expect(global.window.location.assign).toBeCalledWith(ROUTES.HOME);
});

test('test login success no token', () => {
  mockedLocation.hash = '';

  render(<Auth />);

  expect(global.window.location.assign).toBeCalledWith(ENV.URL_FE.LOGIN);
});
