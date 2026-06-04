import { partiesActions, partiesReducer, partiesSelectors } from '../partiesSlice';

describe('partiesSlice', () => {
  it('sets parties, selected party and selected products', () => {
    const party = { partyId: 'party-1', description: 'Party One' } as any;
    const product = { id: 'product-1' } as any;

    const withList = partiesReducer(undefined, partiesActions.setPartiesList([party]));
    const withSelected = partiesReducer(withList, partiesActions.setPartySelected(party));
    const withProducts = partiesReducer(
      withSelected,
      partiesActions.setPartySelectedProducts([product])
    );

    const state = { parties: withProducts } as any;
    expect(partiesSelectors.selectPartiesList(state)).toEqual([party]);
    expect(partiesSelectors.selectPartySelected(state)).toEqual(party);
    expect(partiesSelectors.selectPartySelectedProducts(state)).toEqual([product]);
  });

  it('clears selected party and products', () => {
    const state = partiesReducer(
      { selected: { partyId: 'party-1' } as any, selectedProducts: [{ id: 'p1' }] as any },
      partiesActions.setPartySelected(undefined)
    );
    const cleared = partiesReducer(state, partiesActions.setPartySelectedProducts(undefined));

    expect(cleared.selected).toBeUndefined();
    expect(cleared.selectedProducts).toBeUndefined();
  });
});
