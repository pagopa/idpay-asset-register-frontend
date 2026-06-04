import {
  batchIdSelector,
  batchNameSelector,
  productsReducer,
  setBatchId,
  setBatchName,
} from '../productsSlice';

describe('productsSlice', () => {
  it('sets batch name and id and reads selectors', () => {
    const withName = productsReducer(undefined, setBatchName('Batch A'));
    expect(withName.batchName).toBe('Batch A');

    const withId = productsReducer(withName, setBatchId('file-1'));
    expect(withId.batchId).toBe('file-1');

    expect(batchNameSelector({ products: withId } as any)).toBe('Batch A');
    expect(batchIdSelector({ products: withId } as any)).toBe('file-1');
  });
});
