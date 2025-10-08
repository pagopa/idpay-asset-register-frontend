//  import { mockedProductResources } from '../../api/__mocks__/PortalApiClient';
// import { PortalApi } from '../../api/PortalApiClient';
// import { fetchProducts } from '../productService';
// import { productResource2Product } from '../../model/Product';

// jest.mock('../../api/PortalApiClient');
import { fetchProducts } from '../../services/productService';

beforeEach(() => {
  // jest.spyOn(PortalApi, 'getProducts');
  // jest.spyOn(PortalApi, 'getProductRoles');
});

describe('fetchProducts Service', () => {
  it('should return an empty array', async () => {
    const result = await fetchProducts('examplePartyId');
    expect(result).toEqual([]);
  });
});


test('Test fetchProducts', async () => {
  // const products = await fetchProducts('1');
  // expect(products).toMatchObject(mockedProductResources.map(productResource2Product));
  // expect(PortalApi.getProducts).toBeCalledTimes(1);
});
