import { extractBatchFilterItems } from '../helpers';

describe('extractBatchFilterItems', () => {
    it('should return empty array if input is null', () => {
        expect(extractBatchFilterItems(null)).toEqual([]);
    });

    it('should return empty array if input is not an object', () => {
        expect(extractBatchFilterItems('string')).toEqual([]);
        expect(extractBatchFilterItems(123)).toEqual([]);
        expect(extractBatchFilterItems(true)).toEqual([]);
    });

    it('should return value if input has value property as array', () => {
        const input = {
            value: [{ productFileId: '123', batchName: 'Batch A' }],
        };
        expect(extractBatchFilterItems(input)).toEqual(input.value);
    });

    it('should recursively find value property in nested object', () => {
        const input = {
            level1: {
                level2: {
                    value: [{ productFileId: '456', batchName: 'Batch B' }],
                },
            },
        };
        expect(extractBatchFilterItems(input)).toEqual(input.level1.level2.value);
    });

    it('should return empty array if no value property is found', () => {
        const input = {
            a: { b: { c: 'no value here' } },
        };
        expect(extractBatchFilterItems(input)).toEqual([]);
    });

    it('should return first non-empty result found in recursion', () => {
        const input = {
            a: {
                value: [],
            },
            b: {
                value: [{ productFileId: '789', batchName: 'Batch C' }],
            },
        };
        expect(extractBatchFilterItems(input)).toEqual(input.b.value);
    });
});
