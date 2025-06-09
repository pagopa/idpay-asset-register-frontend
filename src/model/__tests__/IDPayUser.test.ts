import { IdPayUser, IDPayUser } from '../IDPayUser';

const mockedIdPayUser: IDPayUser = {
  uid: '9abcbe25-99f4-40f9-a03b-afed9cd9bb8a',
  name: 'Mario',
  surname: 'Rossi',
  email: 'test@token.it',
  taxCode: '2f63a151-da4e-4e1e-acf9-adecc0c4d727',
  org_party_role: 'ADMIN',
  org_role: 'admin',
};

test('Test initiativeGeneral2GeneralInfo', () => {
  const IdpayUser = IdPayUser(mockedIdPayUser);
  expect(IdpayUser).toStrictEqual({
    uid: '9abcbe25-99f4-40f9-a03b-afed9cd9bb8a',
    name: 'Mario',
    surname: 'Rossi',
    email: 'test@token.it',
    taxCode: '2f63a151-da4e-4e1e-acf9-adecc0c4d727',
    org_party_role: 'ADMIN',
    org_rule: 'admin',
  });
});
