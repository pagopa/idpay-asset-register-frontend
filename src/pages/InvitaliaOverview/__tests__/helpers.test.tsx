import { paginateInstitutions, sortInstitutions } from '../helpers';
import { Institution } from '../../../model/Institution';
import { InstitutionsResponse } from '../../../api/generated/register/InstitutionsResponse';

const mockInstitutions: Institution[] = [
    {
        institutionId: '1',
        description: 'Istituzione A',
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2023-01-15T10:00:00Z',
    },
    {
        institutionId: '2',
        description: 'Istituzione B',
        createdAt: '2023-02-20T15:30:00Z',
        updatedAt: '2023-02-20T15:30:00Z',
    },
    {
        institutionId: '3',
        description: 'Istituzione C',
        createdAt: '2023-03-10T08:45:00Z',
        updatedAt: '2023-03-10T08:45:00Z',
    },
    {
        institutionId: '4',
        description: 'Istituzione D',
        createdAt: '15/01/2023',
        updatedAt: '15/01/2023',
    },
    {
        institutionId: '5',
        description: 'Istituzione E',
        createdAt: '20/02/2023',
        updatedAt: '20/02/2023',
    }
];

const mockInstitutionsResponse: InstitutionsResponse = {
    institutions: mockInstitutions
};

describe('paginateInstitutions', () => {
    it('should paginate institutions correctly', () => {
        const result: InstitutionsResponse= paginateInstitutions(mockInstitutionsResponse, 0, 2);

        const institutions = result.institutions as Institution[];
        expect(institutions).toHaveLength(2);
        expect(institutions![0].institutionId).toBe('1');
        expect(institutions![1].institutionId).toBe('2');
    });

    it('should return second page correctly', () => {
        const result = paginateInstitutions(mockInstitutionsResponse, 1, 2);

        const institutions = result.institutions as Institution[];
        expect(institutions).toHaveLength(2);
        expect(institutions![0].institutionId).toBe('3');
        expect(institutions![1].institutionId).toBe('4');
    });

    it('should handle last page with fewer items', () => {
        const result = paginateInstitutions(mockInstitutionsResponse, 2, 2);

        const institutions = result.institutions as Institution[];
        expect(institutions).toHaveLength(1);
        expect(institutions![0].institutionId).toBe('5');
    });

    it('should handle empty page', () => {
        const result = paginateInstitutions(mockInstitutionsResponse, 10, 2);

        expect(result.institutions).toHaveLength(0);
    });

    it('should handle null data', () => {
        const result = paginateInstitutions(null, 0, 2);

        expect(result.institutions).toHaveLength(0);
    });

    it('should handle undefined institutions', () => {
        const emptyResponse: InstitutionsResponse = { institutions: undefined as any };
        const result = paginateInstitutions(emptyResponse, 0, 2);

        expect(result.institutions).toHaveLength(0);
    });

    it('should handle page 0 with different rowsPerPage', () => {
        const result = paginateInstitutions(mockInstitutionsResponse, 0, 3);

        const institutions = result.institutions as Institution[];
        expect(institutions).toHaveLength(3);
        expect(institutions![0].institutionId).toBe('1');
        expect(institutions![2].institutionId).toBe('3');
    });
});

describe('sortInstitutions', () => {
    describe('string sorting', () => {
        it('should sort by name in ascending order', () => {
            const result = sortInstitutions(mockInstitutions, 'asc', 'description');

            expect(result[0].description).toBe('Istituzione A');
            expect(result[1].description).toBe('Istituzione B');
            expect(result[2].description).toBe('Istituzione C');
            expect(result[3].description).toBe('Istituzione D');
            expect(result[4].description).toBe('Istituzione E');
        });

        it('should sort by name in descending order', () => {
            const result = sortInstitutions(mockInstitutions, 'desc', 'description');

            expect(result[0].description).toBe('Istituzione E');
            expect(result[1].description).toBe('Istituzione D');
            expect(result[2].description).toBe('Istituzione C');
            expect(result[3].description).toBe('Istituzione B');
            expect(result[4].description).toBe('Istituzione A');
        });
    });

    describe('date sorting with ISO format', () => {
        it('should sort by createdAt in ascending order (ISO format)', () => {
            const result = sortInstitutions(mockInstitutions, 'asc', 'createdAt');

            expect(result[0].institutionId).toBe('4');
            expect(result[1].institutionId).toBe('1');
            expect(result[2].institutionId).toBe('5');
            expect(result[3].institutionId).toBe('2');
            expect(result[4].institutionId).toBe('3');
        });

        it('should sort by createdAt in descending order (ISO format)', () => {
            const result = sortInstitutions(mockInstitutions, 'desc', 'createdAt');

            expect(result[0].institutionId).toBe('3');
            expect(result[4].institutionId).toBe('4');
        });
    });

    describe('date sorting with DD/MM/YYYY format', () => {
        const institutionsWithDDMMYYYY: Institution[] = [
            {
                institutionId: '1',
                description: 'Test 1',
                createdAt: '15/01/2023',
                updatedAt: '15/01/2023',
            },
            {
                institutionId: '2',
                description: 'Test 2',
                createdAt: '20/02/2023',
                updatedAt: '20/02/2023',
            },
            {
                institutionId: '3',
                description: 'Test 3',
                createdAt: '10/03/2023',
                updatedAt: '10/03/2023',
            }
        ];

        it('should sort DD/MM/YYYY dates in ascending order', () => {
            const result = sortInstitutions(institutionsWithDDMMYYYY, 'asc', 'createdAt');

            expect(result[0].institutionId).toBe('1'); // 15/01/2023
            expect(result[1].institutionId).toBe('2'); // 20/02/2023
            expect(result[2].institutionId).toBe('3'); // 10/03/2023
        });

        it('should sort DD/MM/YYYY dates in descending order', () => {
            const result = sortInstitutions(institutionsWithDDMMYYYY, 'desc', 'createdAt');

            expect(result[0].institutionId).toBe('3'); // 10/03/2023
            expect(result[1].institutionId).toBe('2'); // 20/02/2023
            expect(result[2].institutionId).toBe('1'); // 15/01/2023
        });
    });

    describe('handling null and undefined values', () => {
        const institutionsWithNulls: Institution[] = [
            {
                institutionId: '1',
                description: 'Test 1',
                createdAt: '2023-01-15T10:00:00Z',
                updatedAt: '2023-01-15T10:00:00Z',
            },
            {
                institutionId: '2',
                description: null as any,
                createdAt: '2023-02-20T15:30:00Z',
                updatedAt: '2023-02-20T15:30:00Z',
            },
            {
                institutionId: '3',
                description: 'Test 3',
                createdAt: null as any,
                updatedAt: '2023-03-10T08:45:00Z',
            }
        ];

        it('should handle null values in sorting (nulls go to end)', () => {
            const result = sortInstitutions(institutionsWithNulls, 'asc', 'description');

            expect(result[0].description).toBe('Test 1');
            expect(result[1].description).toBe('Test 3');
            expect(result[2].description).toBe(null);
        });

        it('should handle null dates (nulls go to end)', () => {
            const result = sortInstitutions(institutionsWithNulls, 'asc', 'createdAt');

            expect(result[0].institutionId).toBe('1');
            expect(result[1].institutionId).toBe('2');
            expect(result[2].institutionId).toBe('3'); // null createdAt goes to end
        });
    });

    describe('handling invalid date formats', () => {
        const institutionsWithInvalidDates: Institution[] = [
            {
                institutionId: '1',
                description: 'Test 1',
                createdAt: '2023-01-15T10:00:00Z',
                updatedAt: '2023-01-15T10:00:00Z',
            },
            {
                institutionId: '2',
                description: 'Test 2',
                createdAt: 'invalid-date',
                updatedAt: 'invalid-date',
            },
            {
                institutionId: '3',
                description: 'Test 3',
                createdAt: '32/13/2023', // invalid DD/MM/YYYY
                updatedAt: '32/13/2023',
            },
            {
                institutionId: '4',
                description: 'Test 4',
                createdAt: '15/1/23', // incomplete format
                updatedAt: '15/1/23',
            }
        ];

        it('should handle invalid date formats (treated as 0)', () => {
            const result = sortInstitutions(institutionsWithInvalidDates, 'asc', 'createdAt');

            expect(result[0].institutionId).toBe('4');
            expect(result[1].institutionId).toBe('2');
            expect(result[2].institutionId).toBe('3');
            expect(result[3].institutionId).toBe('1');
        });
    });

    describe('edge cases', () => {
        it('should handle empty array', () => {
            const result = sortInstitutions([], 'asc', 'description');

            expect(result).toEqual([]);
        });

        it('should handle single item array', () => {
            const singleItem = [mockInstitutions[0]];
            const result = sortInstitutions(singleItem, 'asc', 'description');

            expect(result).toHaveLength(1);
            expect(result[0].institutionId).toBe('1');
        });

        it('should not mutate original array', () => {
            const originalArray = [...mockInstitutions];
            sortInstitutions(mockInstitutions, 'desc', 'description');

            expect(mockInstitutions).toEqual(originalArray);
        });

        it('should handle numeric-like strings', () => {
            const numericInstitutions: Institution[] = [
                {
                    institutionId: '1',
                    description: '100',
                    createdAt: '2023-01-15T10:00:00Z',
                    updatedAt: '2023-01-15T10:00:00Z',
                },
                {
                    institutionId: '2',
                    description: '20',
                    createdAt: '2023-02-20T15:30:00Z',
                    updatedAt: '2023-02-20T15:30:00Z',
                },
                {
                    institutionId: '3',
                    description: '3',
                    createdAt: '2023-03-10T08:45:00Z',
                    updatedAt: '2023-03-10T08:45:00Z',
                }
            ];

            const result = sortInstitutions(numericInstitutions, 'asc', 'description');

            // Should sort as strings, not numbers
            expect(result[0].description).toBe('100');
            expect(result[1].description).toBe('20');
            expect(result[2].description).toBe('3');
        });
    });

    describe('date parsing edge cases', () => {
        it('should handle empty string dates', () => {
            const institutionsWithEmptyDates: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Test 1',
                    createdAt: '',
                    updatedAt: '',
                },
                {
                    institutionId: '2',
                    description: 'Test 2',
                    createdAt: '2023-01-15T10:00:00Z',
                    updatedAt: '2023-01-15T10:00:00Z',
                }
            ];

            const result = sortInstitutions(institutionsWithEmptyDates, 'asc', 'createdAt');

            expect(result[0].institutionId).toBe('1'); // empty string -> 0
            expect(result[1].institutionId).toBe('2'); // valid date
        });

        it('should handle boundary dates in DD/MM/YYYY format', () => {
            const institutionsWithBoundaryDates: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Test 1',
                    createdAt: '01/01/2023',
                    updatedAt: '01/01/2023',
                },
                {
                    institutionId: '2',
                    description: 'Test 2',
                    createdAt: '31/12/2023',
                    updatedAt: '31/12/2023',
                }
            ];

            const result = sortInstitutions(institutionsWithBoundaryDates, 'asc', 'createdAt');

            expect(result[0].institutionId).toBe('1'); // 01/01/2023
            expect(result[1].institutionId).toBe('2'); // 31/12/2023
        });

        it('NaN case', () => {
            const institutionsWithBoundaryDates: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Test 1',
                    createdAt: '',
                    updatedAt: '',
                }
            ];

            const result = sortInstitutions(institutionsWithBoundaryDates, 'asc', 'createdAt');

            expect(result[0].institutionId).toBe("1");
        });

        it('should return 0 for invalid date format', () => {
            const institutions: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Invalid date',
                    createdAt: '32/13/2023',
                    updatedAt: '32/13/2023',
                },
                {
                    institutionId: '2',
                    description: 'Valid date',
                    createdAt: '01/01/2023',
                    updatedAt: '01/01/2023',
                }
            ];

            const result = sortInstitutions(institutions, 'asc', 'createdAt');
            expect(result[0].institutionId).toBe('1');
        });

        it('should handle null and undefined values', () => {
            const institutions: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Null date',
                    createdAt: null as any,
                    updatedAt: null as any,
                },
                {
                    institutionId: '2',
                    description: 'Undefined date',
                    createdAt: undefined as any,
                    updatedAt: undefined as any,
                },
                {
                    institutionId: '3',
                    description: 'Valid date',
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                }
            ];

            const result = sortInstitutions(institutions, 'asc', 'createdAt');
            expect(result[0].institutionId).toBe('3');
            expect(result[1].institutionId).toBe('1');
            expect(result[2].institutionId).toBe('2');
        });

        it('should sort by numeric field correctly', () => {
            const institutions: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Test 1',
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                    score: 10
                } as any,
                {
                    institutionId: '2',
                    description: 'Test 2',
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                    score: 5
                } as any
            ];

            const result = sortInstitutions(institutions, 'asc', 'score' as keyof Institution);
            expect(result[0].institutionId).toBe('2');
        });

        it('should return 0 if day, month, or year is NaN', () => {
            const institutions: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Invalid date parts',
                    createdAt: 'aa/bb/cccc', // tutti NaN
                    updatedAt: 'aa/bb/cccc',
                },
                {
                    institutionId: '2',
                    description: 'Valid date',
                    createdAt: '01/01/2023',
                    updatedAt: '01/01/2023',
                }
            ];

            const result = sortInstitutions(institutions, 'asc', 'createdAt');
            expect(result[0].institutionId).toBe('1');
        });

        it('should return 0 if day is out of range', () => {
            const institutions: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Invalid day',
                    createdAt: '32/01/2023',
                    updatedAt: '32/01/2023',
                },
                {
                    institutionId: '2',
                    description: 'Valid date',
                    createdAt: '01/01/2023',
                    updatedAt: '01/01/2023',
                }
            ];

            const result = sortInstitutions(institutions, 'asc', 'createdAt');
            expect(result[0].institutionId).toBe('1');
        });

        it('should return 0 if parsed date is invalid after construction', () => {
            const institutions: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Invalid constructed date',
                    createdAt: '31/02/2023',
                    updatedAt: '31/02/2023',
                },
                {
                    institutionId: '2',
                    description: 'Valid date',
                    createdAt: '01/03/2023',
                    updatedAt: '01/03/2023',
                }
            ];

            const result = sortInstitutions(institutions, 'asc', 'createdAt');
            expect(result[0].institutionId).toBe('2');
        });

        it('should return 1 when a > b in numeric comparison', () => {
            const institutions: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Higher score',
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                    score: 20
                } as any,
                {
                    institutionId: '2',
                    description: 'Lower score',
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                    score: 10
                } as any
            ];

            const result = sortInstitutions(institutions, 'asc', 'score' as keyof Institution);
            expect(result[0].institutionId).toBe('2');
            expect(result[1].institutionId).toBe('1');
        });

        it('should return 0 for invalid ISO date string', () => {
            const institutions: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Invalid ISO date',
                    createdAt: '2023-13-40T99:99:99Z',
                    updatedAt: '2023-13-40T99:99:99Z',
                },
                {
                    institutionId: '2',
                    description: 'Valid ISO date',
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                }
            ];

            const result = sortInstitutions(institutions, 'asc', 'createdAt');
            expect(result[0].institutionId).toBe('1');
        });

        it('should return 1 when a > b in fallback comparison', () => {
            const institutions: Institution[] = [
                {
                    institutionId: '1',
                    description: 'Zebra',
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                },
                {
                    institutionId: '2',
                    description: 'Apple',
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                }
            ];

            const result = sortInstitutions(institutions, 'asc', 'description');
            expect(result[0].institutionId).toBe('2');
            expect(result[1].institutionId).toBe('1');
        });

    });
});