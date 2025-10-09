import { Product, SubProduct, ProductStatus, ProductsMap, statusChangeMessage } from '../Product';

describe('Product Model', () => {
    describe('Type Definitions', () => {
        it('should accept valid ProductStatus values', () => {
            const active: ProductStatus = 'ACTIVE';
            const inactive: ProductStatus = 'INACTIVE';
            const pending: ProductStatus = 'PENDING';

            expect(active).toBe('ACTIVE');
            expect(inactive).toBe('INACTIVE');
            expect(pending).toBe('PENDING');
        });
    });

    describe('SubProduct', () => {
        it('should create a valid SubProduct object', () => {
            const subProduct: SubProduct = {
                id: 'sub-001',
                title: 'SubProduct Title',
                status: 'ACTIVE',
            };

            expect(subProduct.id).toBe('sub-001');
            expect(subProduct.title).toBe('SubProduct Title');
            expect(subProduct.status).toBe('ACTIVE');
        });

        it('should handle all ProductStatus values', () => {
            const activeSubProduct: SubProduct = {
                id: 'sub-active',
                title: 'Active SubProduct',
                status: 'ACTIVE',
            };

            const inactiveSubProduct: SubProduct = {
                id: 'sub-inactive',
                title: 'Inactive SubProduct',
                status: 'INACTIVE',
            };

            const pendingSubProduct: SubProduct = {
                id: 'sub-pending',
                title: 'Pending SubProduct',
                status: 'PENDING',
            };

            expect(activeSubProduct.status).toBe('ACTIVE');
            expect(inactiveSubProduct.status).toBe('INACTIVE');
            expect(pendingSubProduct.status).toBe('PENDING');
        });
    });

    describe('Product', () => {
        it('should create a valid Product object with required fields only', () => {
            const product: Product = {
                description: 'Test Product Description',
                id: 'prod-001',
                title: 'Test Product',
                urlBO: 'https://backoffice.example.com',
                roles: [],
                status: 'ACTIVE',
                imageUrl: 'https://example.com/image.png',
                subProducts: [],
            };

            expect(product.id).toBe('prod-001');
            expect(product.title).toBe('Test Product');
            expect(product.description).toBe('Test Product Description');
            expect(product.urlBO).toBe('https://backoffice.example.com');
            expect(product.status).toBe('ACTIVE');
            expect(product.imageUrl).toBe('https://example.com/image.png');
            expect(product.roles).toEqual([]);
            expect(product.subProducts).toEqual([]);
        });

        it('should create a Product object with all optional fields', () => {
            const activationDate = new Date('2024-01-01T10:00:00Z');
            const product: Product = {
                activationDateTime: activationDate,
                description: 'Complete Product Description',
                id: 'prod-002',
                logo: 'https://example.com/logo.svg',
                title: 'Complete Product',
                urlBO: 'https://backoffice.example.com',
                urlPublic: 'https://public.example.com',
                selfcareRole: 'ADMIN',
                roles: [
                    { partyRole: 'MANAGER', roleKey: 'manager-key' },
                    { partyRole: 'OPERATOR', roleKey: 'operator-key' },
                ],
                authorized: true,
                status: 'ACTIVE',
                imageUrl: 'https://example.com/complete-image.png',
                subProducts: [
                    { id: 'sub-001', title: 'SubProduct 1', status: 'ACTIVE' },
                    { id: 'sub-002', title: 'SubProduct 2', status: 'PENDING' },
                ],
            };

            expect(product.activationDateTime).toEqual(activationDate);
            expect(product.logo).toBe('https://example.com/logo.svg');
            expect(product.urlPublic).toBe('https://public.example.com');
            expect(product.selfcareRole).toBe('ADMIN');
            expect(product.authorized).toBe(true);
            expect(product.roles).toHaveLength(2);
            expect(product.subProducts).toHaveLength(2);
        });

        it('should handle multiple roles', () => {
            const product: Product = {
                description: 'Multi-Role Product',
                id: 'prod-003',
                title: 'Multi-Role Product',
                urlBO: 'https://bo.example.com',
                roles: [
                    { partyRole: 'DELEGATE', roleKey: 'delegate-key' },
                    { partyRole: 'MANAGER', roleKey: 'manager-key' },
                    { partyRole: 'OPERATOR', roleKey: 'operator-key' },
                    { partyRole: 'SUB_DELEGATE', roleKey: 'sub-delegate-key' },
                ],
                status: 'ACTIVE',
                imageUrl: 'https://example.com/image.png',
                subProducts: [],
            };

            expect(product.roles).toHaveLength(4);
            expect(product.roles[0].partyRole).toBe('DELEGATE');
            expect(product.roles[1].partyRole).toBe('MANAGER');
            expect(product.roles[2].partyRole).toBe('OPERATOR');
            expect(product.roles[3].partyRole).toBe('SUB_DELEGATE');
        });

        it('should handle multiple subProducts', () => {
            const product: Product = {
                description: 'Product with SubProducts',
                id: 'prod-004',
                title: 'Parent Product',
                urlBO: 'https://bo.example.com',
                roles: [],
                status: 'ACTIVE',
                imageUrl: 'https://example.com/image.png',
                subProducts: [
                    { id: 'sub-001', title: 'SubProduct 1', status: 'ACTIVE' },
                    { id: 'sub-002', title: 'SubProduct 2', status: 'INACTIVE' },
                    { id: 'sub-003', title: 'SubProduct 3', status: 'PENDING' },
                ],
            };

            expect(product.subProducts).toHaveLength(3);
            expect(product.subProducts[0].status).toBe('ACTIVE');
            expect(product.subProducts[1].status).toBe('INACTIVE');
            expect(product.subProducts[2].status).toBe('PENDING');
        });

        it('should handle all ProductStatus values', () => {
            const activeProduct: Product = {
                description: 'Active Product',
                id: 'prod-active',
                title: 'Active',
                urlBO: 'https://bo.example.com',
                roles: [],
                status: 'ACTIVE',
                imageUrl: 'https://example.com/image.png',
                subProducts: [],
            };

            const inactiveProduct: Product = {
                ...activeProduct,
                id: 'prod-inactive',
                status: 'INACTIVE',
            };

            const pendingProduct: Product = {
                ...activeProduct,
                id: 'prod-pending',
                status: 'PENDING',
            };

            expect(activeProduct.status).toBe('ACTIVE');
            expect(inactiveProduct.status).toBe('INACTIVE');
            expect(pendingProduct.status).toBe('PENDING');
        });

        it('should handle both SelfcareRole values', () => {
            const adminProduct: Product = {
                description: 'Admin Product',
                id: 'prod-admin',
                title: 'Admin Product',
                urlBO: 'https://bo.example.com',
                selfcareRole: 'ADMIN',
                roles: [],
                status: 'ACTIVE',
                imageUrl: 'https://example.com/image.png',
                subProducts: [],
            };

            const limitedProduct: Product = {
                ...adminProduct,
                id: 'prod-limited',
                selfcareRole: 'LIMITED',
            };

            expect(adminProduct.selfcareRole).toBe('ADMIN');
            expect(limitedProduct.selfcareRole).toBe('LIMITED');
        });

        it('should handle authorized flag', () => {
            const authorizedProduct: Product = {
                description: 'Authorized Product',
                id: 'prod-auth',
                title: 'Authorized',
                urlBO: 'https://bo.example.com',
                authorized: true,
                roles: [],
                status: 'ACTIVE',
                imageUrl: 'https://example.com/image.png',
                subProducts: [],
            };

            const unauthorizedProduct: Product = {
                ...authorizedProduct,
                id: 'prod-unauth',
                authorized: false,
            };

            expect(authorizedProduct.authorized).toBe(true);
            expect(unauthorizedProduct.authorized).toBe(false);
        });

        it('should handle Date objects in activationDateTime', () => {
            const date = new Date('2024-06-15T14:30:00Z');
            const product: Product = {
                activationDateTime: date,
                description: 'Date Test Product',
                id: 'prod-date',
                title: 'Date Product',
                urlBO: 'https://bo.example.com',
                roles: [],
                status: 'ACTIVE',
                imageUrl: 'https://example.com/image.png',
                subProducts: [],
            };

            expect(product.activationDateTime).toBeInstanceOf(Date);
            expect(product.activationDateTime?.toISOString()).toBe('2024-06-15T14:30:00.000Z');
        });
    });

    describe('ProductsMap', () => {
        it('should create a valid ProductsMap', () => {
            const productsMap: ProductsMap = {
                'prod-001': {
                    description: 'Product 1',
                    id: 'prod-001',
                    title: 'Product One',
                    urlBO: 'https://bo1.example.com',
                    roles: [],
                    status: 'ACTIVE',
                    imageUrl: 'https://example.com/img1.png',
                    subProducts: [],
                },
                'prod-002': {
                    description: 'Product 2',
                    id: 'prod-002',
                    title: 'Product Two',
                    urlBO: 'https://bo2.example.com',
                    roles: [],
                    status: 'INACTIVE',
                    imageUrl: 'https://example.com/img2.png',
                    subProducts: [],
                },
            };

            expect(Object.keys(productsMap)).toHaveLength(2);
            expect(productsMap['prod-001'].title).toBe('Product One');
            expect(productsMap['prod-002'].title).toBe('Product Two');
        });

        it('should allow accessing products by id', () => {
            const productsMap: ProductsMap = {
                'test-id': {
                    description: 'Test Product',
                    id: 'test-id',
                    title: 'Test',
                    urlBO: 'https://bo.example.com',
                    roles: [],
                    status: 'ACTIVE',
                    imageUrl: 'https://example.com/image.png',
                    subProducts: [],
                },
            };

            const product = productsMap['test-id'];
            expect(product).toBeDefined();
            expect(product.id).toBe('test-id');
        });

        it('should handle empty ProductsMap', () => {
            const emptyMap: ProductsMap = {};
            expect(Object.keys(emptyMap)).toHaveLength(0);
        });
    });

    describe('statusChangeMessage', () => {
        it('should create a valid statusChangeMessage with all fields', () => {
            const message: statusChangeMessage = {
                username: 'john.doe',
                role: 'ADMIN',
                motivation: 'Access required for project',
                formalMotivation: 'Formal business justification',
                updateDate: '2024-10-09T10:00:00Z',
            };

            expect(message.username).toBe('john.doe');
            expect(message.role).toBe('ADMIN');
            expect(message.motivation).toBe('Access required for project');
            expect(message.formalMotivation).toBe('Formal business justification');
            expect(message.updateDate).toBe('2024-10-09T10:00:00Z');
        });

        it('should create an empty statusChangeMessage', () => {
            const message: statusChangeMessage = {};

            expect(message.username).toBeUndefined();
            expect(message.role).toBeUndefined();
            expect(message.motivation).toBeUndefined();
            expect(message.formalMotivation).toBeUndefined();
            expect(message.updateDate).toBeUndefined();
        });

        it('should create a statusChangeMessage with partial fields', () => {
            const message1: statusChangeMessage = {
                username: 'jane.smith',
                updateDate: '2024-10-09T12:00:00Z',
            };

            const message2: statusChangeMessage = {
                role: 'MANAGER',
                motivation: 'Role change request',
            };

            expect(message1.username).toBe('jane.smith');
            expect(message1.role).toBeUndefined();
            expect(message2.role).toBe('MANAGER');
            expect(message2.username).toBeUndefined();
        });
    });

    describe('Type Safety', () => {
        it('should enforce required fields on Product type', () => {
            const validProduct: Product = {
                description: 'Required Fields Test',
                id: 'prod-required',
                title: 'Required Product',
                urlBO: 'https://bo.example.com',
                roles: [],
                status: 'ACTIVE',
                imageUrl: 'https://example.com/image.png',
                subProducts: [],
            };

            expect(validProduct).toBeDefined();
        });

        it('should allow optional fields to be undefined', () => {
            const product: Product = {
                description: 'Optional Fields Test',
                id: 'prod-optional',
                title: 'Optional Product',
                urlBO: 'https://bo.example.com',
                roles: [],
                status: 'ACTIVE',
                imageUrl: 'https://example.com/image.png',
                subProducts: [],
            };

            expect(product.activationDateTime).toBeUndefined();
            expect(product.logo).toBeUndefined();
            expect(product.urlPublic).toBeUndefined();
            expect(product.selfcareRole).toBeUndefined();
            expect(product.authorized).toBeUndefined();
        });

        it('should enforce required fields on SubProduct type', () => {
            const validSubProduct: SubProduct = {
                id: 'sub-valid',
                title: 'Valid SubProduct',
                status: 'ACTIVE',
            };

            expect(validSubProduct).toBeDefined();
        });
    });
});