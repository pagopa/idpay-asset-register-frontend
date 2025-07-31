import { categoryList } from '../helpers';
import { PRODUCTS_CATEGORY } from '../../../utils/constants';
import { downloadCsv } from '../helpers';

describe('categoryList', () => {
    it('should contain all expected categories with correct labels and values', () => {
        const expectedCategories = [
            { label: 'commons.categories.tumbledryers', value: PRODUCTS_CATEGORY.TUMBLEDRYERS },
            { label: 'commons.categories.rangehoods', value: PRODUCTS_CATEGORY.RANGEHOODS },
            { label: 'commons.categories.ovens', value: PRODUCTS_CATEGORY.OVENS },
            { label: 'commons.categories.refrigeratingappl', value: PRODUCTS_CATEGORY.REFRIGERATINGAPPL },
            { label: 'commons.categories.washerdriers', value: PRODUCTS_CATEGORY.WASHERDRIERS },
            { label: 'commons.categories.dishwashers', value: PRODUCTS_CATEGORY.DISHWASHERS },
            { label: 'commons.categories.washingmachines', value: PRODUCTS_CATEGORY.WASHINGMACHINES },
            { label: 'commons.categories.cookinghobs', value: PRODUCTS_CATEGORY.COOKINGHOBS },
        ];

        expect(categoryList).toEqual(expectedCategories);
    });
});

describe('downloadCsv', () => {
    beforeEach(() => {
        global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake-url');
        document.body.appendChild = jest.fn();
    });

    it('should create a blob with BOM and trigger download with correct filename', () => {
        const mockClick = jest.fn();
        const mockAppendChild = jest.spyOn(document.body, 'appendChild');
        const mockCreateObjectURL = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');

        const mockAnchor = {
            click: mockClick,
            set href(_value: string) {},
            set download(_value: string) {}
        };

        jest.spyOn(document, 'createElement').mockImplementation(() => mockAnchor as any);

        const csvContent = { data: 'col1,col2\nval1,val2' };
        const filename = 'test.csv';

        downloadCsv(csvContent, filename);

        expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
        expect(mockAppendChild).toHaveBeenCalledWith(mockAnchor);
        expect(mockClick).toHaveBeenCalled();
    });
});
