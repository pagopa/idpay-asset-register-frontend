import { jwt2JWTUser } from '../JwtUser';

const mockedJwtUser = {
  uid: '9abcbe25-99f4-40f9-a03b-afed9cd9bb8a',
  name: 'Mario',
  family_name: 'Rossi',
  email: 'test@token.it',
  org_id: '2f63a151-da4e-4e1e-acf9-adecc0c4d727',
  org_name: 'Comune di Jesolo',
  org_vat: '11122233344',
  org_party_role: 'OPERATOR',
  org_role: 'ope_base',
};

test('test jwt2JWTUser', () => {
  const jwt = jwt2JWTUser(mockedJwtUser);
  expect(jwt).toStrictEqual({
    uid: '9abcbe25-99f4-40f9-a03b-afed9cd9bb8a',
    name: 'Mario',
    family_name: 'Rossi',
    email: 'test@token.it',
    org_id: '2f63a151-da4e-4e1e-acf9-adecc0c4d727',
    org_name: 'Comune di Jesolo',
    org_vat: '11122233344',
    org_party_role: 'OPERATOR',
    org_role: 'ope_base',
  });
});
