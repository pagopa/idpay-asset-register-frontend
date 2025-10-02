import {Data, DataProp, EnhancedTableProps, HeadCell, Order, ProductsDrawerProps, Value} from "../helpers";

describe('Data interface', () => {
    test('should create valid Data object with all required properties', () => {
        const data: Data = {
            category: 'Electronics',
            energyClass: 'A++',
            eprelCode: 'EPR123456',
            gtinCode: 'GTIN789012',
            batchName: 'Batch001',
            id: 1
        };

        expect(data.category).toBe('Electronics');
        expect(data.energyClass).toBe('A++');
        expect(data.eprelCode).toBe('EPR123456');
        expect(data.gtinCode).toBe('GTIN789012');
        expect(data.batchName).toBe('Batch001');
        expect(data.id).toBe(1);
        expect(typeof data.id).toBe('number');
    });

    test('should handle different data types correctly', () => {
        const data: Data = {
            category: '',
            energyClass: 'B',
            eprelCode: '',
            gtinCode: '0',
            batchName: 'test-batch',
            id: 0
        };

        expect(typeof data.category).toBe('string');
        expect(typeof data.energyClass).toBe('string');
        expect(typeof data.eprelCode).toBe('string');
        expect(typeof data.gtinCode).toBe('string');
        expect(typeof data.batchName).toBe('string');
        expect(typeof data.id).toBe('number');
    });
});

describe('Order type', () => {
    test('should accept asc value', () => {
        const order: Order = 'asc';
        expect(order).toBe('asc');
    });

    test('should accept desc value', () => {
        const order: Order = 'desc';
        expect(order).toBe('desc');
    });

    test('should work in array context', () => {
        const orders: Order[] = ['asc', 'desc'];
        expect(orders).toContain('asc');
        expect(orders).toContain('desc');
        expect(orders.length).toBe(2);
    });
});

describe('Value type', () => {
    test('should accept string values', () => {
        const value: Value = 'test value';
        expect(value).toBe('test value');
        expect(typeof value).toBe('string');
    });

    test('should accept empty string', () => {
        const value: Value = '';
        expect(value).toBe('');
    });

    test('should work in array context', () => {
        const values: Value[] = ['value1', 'value2', ''];
        expect(values).toHaveLength(3);
        expect(values[0]).toBe('value1');
    });
});

describe('HeadCell interface', () => {
    test('should create valid HeadCell with all properties', () => {
        const headCell: HeadCell = {
            disablePadding: true,
            id: 'category',
            label: 'Category',
            numeric: false
        };

        expect(headCell.disablePadding).toBe(true);
        expect(headCell.id).toBe('category');
        expect(headCell.label).toBe('Category');
        expect(headCell.numeric).toBe(false);
    });

    test('should handle all possible Data keys as id', () => {
        const headCells: HeadCell[] = [
            {
                disablePadding: false,
                id: 'category',
                label: 'Category',
                numeric: false
            },
            {
                disablePadding: true,
                id: 'energyClass',
                label: 'Energy Class',
                numeric: false
            },
            {
                disablePadding: false,
                id: 'eprelCode',
                label: 'EPREL Code',
                numeric: false
            },
            {
                disablePadding: true,
                id: 'gtinCode',
                label: 'GTIN Code',
                numeric: false
            },
            {
                disablePadding: false,
                id: 'batchName',
                label: 'Batch Name',
                numeric: false
            },
            {
                disablePadding: true,
                id: 'id',
                label: 'ID',
                numeric: true
            }
        ];

        expect(headCells).toHaveLength(6);
        expect(headCells[5].numeric).toBe(true);
        expect(headCells[0].numeric).toBe(false);
    });

    test('should handle boolean values correctly', () => {
        const headCell: HeadCell = {
            disablePadding: false,
            id: 'id',
            label: 'Identifier',
            numeric: true
        };

        expect(typeof headCell.disablePadding).toBe('boolean');
        expect(typeof headCell.numeric).toBe('boolean');
    });
});

describe('EnhancedTableProps interface', () => {
    test('should create valid EnhancedTableProps', () => {
        const mockOnRequestSort = jest.fn();
        const props: EnhancedTableProps = {
            order: 'asc',
            orderBy: 'category',
            onRequestSort: mockOnRequestSort
        };

        expect(props.order).toBe('asc');
        expect(props.orderBy).toBe('category');
        expect(typeof props.onRequestSort).toBe('function');
    });

    test('should handle desc order', () => {
        const mockOnRequestSort = jest.fn();
        const props: EnhancedTableProps = {
            order: 'desc',
            orderBy: 'id',
            onRequestSort: mockOnRequestSort
        };

        expect(props.order).toBe('desc');
        expect(props.orderBy).toBe('id');
    });

    test('should call onRequestSort function', () => {
        const mockOnRequestSort = jest.fn();
        const props: EnhancedTableProps = {
            order: 'asc',
            orderBy: 'energyClass',
            onRequestSort: mockOnRequestSort
        };

        const mockEvent = {} as React.MouseEvent<unknown>;
        props.onRequestSort(mockEvent, 'category');

        expect(mockOnRequestSort).toHaveBeenCalledWith(mockEvent, 'category');
        expect(mockOnRequestSort).toHaveBeenCalledTimes(1);
    });

    test('should handle all possible orderBy values', () => {
        const mockOnRequestSort = jest.fn();
        const orderByValues: (keyof Data)[] = ['category', 'energyClass', 'eprelCode', 'gtinCode', 'batchName', 'id'];

        orderByValues.forEach(orderBy => {
            const props: EnhancedTableProps = {
                order: 'asc',
                orderBy,
                onRequestSort: mockOnRequestSort
            };
            expect(props.orderBy).toBe(orderBy);
        });
    });
});

describe('DataProp interface', () => {
    test('should create DataProp with all optional properties', () => {
        const dataProp: DataProp = {
            category: 'Test Category',
            energyClass: 'A+',
            eprelCode: 'TEST123',
            gtinCode: 'GTIN456',
            batchName: 'TestBatch',
            codice_prodotto: 'PROD789',
            marca: 'TestBrand',
            modello: 'TestModel',
            origine: 'TestOrigin'
        };

        expect(dataProp.category).toBe('Test Category');
        expect(dataProp.energyClass).toBe('A+');
        expect(dataProp.eprelCode).toBe('TEST123');
        expect(dataProp.gtinCode).toBe('GTIN456');
        expect(dataProp.batchName).toBe('TestBatch');
        expect(dataProp.codice_prodotto).toBe('PROD789');
        expect(dataProp.marca).toBe('TestBrand');
        expect(dataProp.modello).toBe('TestModel');
        expect(dataProp.origine).toBe('TestOrigin');
    });

    test('should create DataProp with no properties (all optional)', () => {
        const dataProp: DataProp = {};

        expect(dataProp.category).toBeUndefined();
        expect(dataProp.energyClass).toBeUndefined();
        expect(dataProp.eprelCode).toBeUndefined();
        expect(dataProp.gtinCode).toBeUndefined();
        expect(dataProp.batchName).toBeUndefined();
        expect(dataProp.codice_prodotto).toBeUndefined();
        expect(dataProp.marca).toBeUndefined();
        expect(dataProp.modello).toBeUndefined();
        expect(dataProp.origine).toBeUndefined();
    });

    test('should create DataProp with some properties', () => {
        const dataProp: DataProp = {
            category: 'Electronics',
            marca: 'Samsung',
            origine: 'Korea'
        };

        expect(dataProp.category).toBe('Electronics');
        expect(dataProp.marca).toBe('Samsung');
        expect(dataProp.origine).toBe('Korea');
        expect(dataProp.energyClass).toBeUndefined();
        expect(dataProp.modello).toBeUndefined();
    });

    test('should handle empty strings', () => {
        const dataProp: DataProp = {
            category: '',
            energyClass: '',
            eprelCode: '',
            gtinCode: '',
            batchName: '',
            codice_prodotto: '',
            marca: '',
            modello: '',
            origine: ''
        };

        Object.values(dataProp).forEach(value => {
            expect(value).toBe('');
        });
    });
});

describe('ProductsDrawerProps interface', () => {
    test('should create valid ProductsDrawerProps', () => {
        const mockToggleDrawer = jest.fn();
        const testData: DataProp = {
            category: 'Test',
            marca: 'TestBrand'
        };

        const props: ProductsDrawerProps = {
            open: true,
            toggleDrawer: mockToggleDrawer,
            data: testData
        };

        expect(props.open).toBe(true);
        expect(typeof props.toggleDrawer).toBe('function');
        expect(props.data).toBe(testData);
        expect(props.data.category).toBe('Test');
    });

    test('should handle closed drawer', () => {
        const mockToggleDrawer = jest.fn();
        const testData: DataProp = {};

        const props: ProductsDrawerProps = {
            open: false,
            toggleDrawer: mockToggleDrawer,
            data: testData
        };

        expect(props.open).toBe(false);
        expect(props.data).toEqual({});
    });

    test('should call toggleDrawer function', () => {
        const mockToggleDrawer = jest.fn();
        const testData: DataProp = { category: 'Test' };

        const props: ProductsDrawerProps = {
            open: true,
            toggleDrawer: mockToggleDrawer,
            data: testData
        };

        props.toggleDrawer(false);
        expect(mockToggleDrawer).toHaveBeenCalledWith(false);

        props.toggleDrawer(true);
        expect(mockToggleDrawer).toHaveBeenCalledWith(true);

        expect(mockToggleDrawer).toHaveBeenCalledTimes(2);
    });

    test('should handle complex DataProp object', () => {
        const mockToggleDrawer = jest.fn();
        const complexData: DataProp = {
            category: 'Electronics',
            energyClass: 'A++',
            eprelCode: 'EPR2023001',
            gtinCode: 'GTIN8901234567890',
            batchName: 'BATCH_2023_Q1',
            codice_prodotto: 'PROD_ABC123',
            marca: 'Samsung Electronics',
            modello: 'Galaxy S23 Ultra',
            origine: 'South Korea'
        };

        const props: ProductsDrawerProps = {
            open: true,
            toggleDrawer: mockToggleDrawer,
            data: complexData
        };

        expect(props.data.category).toBe('Electronics');
        expect(props.data.energyClass).toBe('A++');
        expect(props.data.eprelCode).toBe('EPR2023001');
        expect(props.data.gtinCode).toBe('GTIN8901234567890');
        expect(props.data.batchName).toBe('BATCH_2023_Q1');
        expect(props.data.codice_prodotto).toBe('PROD_ABC123');
        expect(props.data.marca).toBe('Samsung Electronics');
        expect(props.data.modello).toBe('Galaxy S23 Ultra');
        expect(props.data.origine).toBe('South Korea');
    });
});

describe('Interface compatibility', () => {
    test('should verify Data and DataProp compatibility', () => {
        const data: Data = {
            category: 'Electronics',
            energyClass: 'A+',
            eprelCode: 'EPR123',
            gtinCode: 'GTIN456',
            batchName: 'Batch1',
            id: 1
        };

        const dataProp: DataProp = {
            category: data.category,
            energyClass: data.energyClass,
            eprelCode: data.eprelCode,
            gtinCode: data.gtinCode,
            batchName: data.batchName
        };

        expect(dataProp.category).toBe(data.category);
        expect(dataProp.energyClass).toBe(data.energyClass);
        expect(dataProp.eprelCode).toBe(data.eprelCode);
        expect(dataProp.gtinCode).toBe(data.gtinCode);
        expect(dataProp.batchName).toBe(data.batchName);
    });

    test('should verify HeadCell id type safety', () => {
        const dataKeys: (keyof Data)[] = ['category', 'energyClass', 'eprelCode', 'gtinCode', 'batchName', 'id'];

        dataKeys.forEach(key => {
            const headCell: HeadCell = {
                disablePadding: false,
                id: key,
                label: key.toString(),
                numeric: key === 'id'
            };

            expect(headCell.id).toBe(key);
            expect(typeof headCell.label).toBe('string');
        });
    });
});

describe('Type safety and edge cases', () => {
    test('should handle type unions correctly', () => {
        const orders: Order[] = ['asc', 'desc'];
        orders.forEach(order => {
            expect(['asc', 'desc']).toContain(order);
        });
    });

    test('should handle function types in interfaces', () => {
        const mockFn = jest.fn();
        const tableProps: EnhancedTableProps = {
            order: 'asc',
            orderBy: 'category',
            onRequestSort: mockFn
        };

        const drawerProps: ProductsDrawerProps = {
            open: true,
            toggleDrawer: jest.fn(),
            data: {}
        };

        expect(typeof tableProps.onRequestSort).toBe('function');
        expect(typeof drawerProps.toggleDrawer).toBe('function');
    });

    test('should verify optional vs required properties', () => {
        const data: Data = {
            category: 'test',
            energyClass: 'A',
            eprelCode: 'code',
            gtinCode: 'gtin',
            batchName: 'batch',
            id: 1
        };

        const dataProp1: DataProp = {};
        const dataProp2: DataProp = { category: 'test' };

        expect(data.id).toBeDefined();
        expect(dataProp1.category).toBeUndefined();
        expect(dataProp2.category).toBeDefined();
    });
});