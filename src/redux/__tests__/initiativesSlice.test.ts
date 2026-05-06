import {
  clearInitiativesList,
  currentInitiativeSelector,
  initiativesListSelector,
  initiativesReducer,
  setInitiativesList,
} from '../slices/initiativesSlice';

describe('initiativesSlice', () => {
  const initiatives = [
    {
      initiativeId: 'initiative-1',
      initiativeName: 'Initiative 1',
      startDate: '2025-10-01T00:00:00.000Z',
      endDate: '2025-10-31T00:00:00.000Z',
    },
    {
      initiativeId: 'initiative-2',
      initiativeName: 'Initiative 2',
    },
  ];

  it('sets and clears the initiatives list', () => {
    const state = initiativesReducer(undefined, setInitiativesList(initiatives));

    expect(state.list).toEqual(initiatives);
    expect(state.list).not.toBe(initiatives);
    expect(initiativesReducer(state, clearInitiativesList())).toEqual({ list: undefined });
  });

  it('selects initiatives and enriches the current initiative with the spending period', () => {
    const state = { initiatives: { list: initiatives } } as any;

    expect(initiativesListSelector(state)).toEqual(initiatives);
    expect(currentInitiativeSelector(state, 'initiative-1')).toEqual({
      ...initiatives[0],
      spendingPeriod: '01/10/2025 - 31/10/2025',
    });
  });

  it('returns undefined when the current initiative cannot be resolved', () => {
    const state = { initiatives: { list: initiatives } } as any;

    expect(currentInitiativeSelector(state, undefined)).toBeUndefined();
    expect(currentInitiativeSelector(state, 'missing')).toBeUndefined();
    expect(currentInitiativeSelector({ initiatives: {} } as any, 'initiative-1')).toBeUndefined();
  });
});
