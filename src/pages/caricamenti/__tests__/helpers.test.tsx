import { descendingComparator, getComparator, stableSort } from '../helpers';

describe('Test suite for helpers.ts of InitiativesList', () => {
  const orderByInitiativeName = 'initiativeName';
  const orderByOrganizationName = 'organizationName';

  const mockedCompA = {
    initiativeName: 'qwerty',
    organizationName: 'org1234',
  };

  const mockedCompB = {
    initiativeName: 'asdfgh',
    organizationName: 'org5678',
  };

  const mockedCompC = {
    initiativeName: 'zxcvb',
    organizationName: 'org9012',
  };

  const arr: any = ['1', '2'];
  const comp: any = {
    a: 1,
    b: 0,
  };

  test('descendingComparator', () => {
    expect(descendingComparator(mockedCompA, mockedCompA, orderByInitiativeName)).toBe(0);
    expect(descendingComparator(mockedCompA, mockedCompC, orderByInitiativeName)).toBe(1);
    expect(descendingComparator(mockedCompA, mockedCompB, orderByInitiativeName)).toBe(-1);
    expect(descendingComparator(mockedCompA, mockedCompA, orderByOrganizationName)).toBe(0);
    expect(descendingComparator(mockedCompA, mockedCompB, orderByOrganizationName)).toBe(1);
    expect(descendingComparator(mockedCompA, mockedCompC, orderByOrganizationName)).toBe(1);
  });

  test('stableSort', () => {
    expect(stableSort(arr, getComparator(comp.a, comp.b))).toEqual(['1', '2']);
  });
});
