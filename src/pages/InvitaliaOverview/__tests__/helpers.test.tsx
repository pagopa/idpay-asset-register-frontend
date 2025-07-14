import { paginateInstitutions, sortInstitutions } from '../helpers';
import { Institution } from '../../../model/Institution';
import { InstitutionsResponse } from '../../../api/generated/register/InstitutionsResponse';

describe('paginateInstitutions', () => {
    const mockInstitutions: Institution[] = Array.from({ length: 10 }, (_, i) => ({
        institutionId: `id-${i}`,
        description: `Institution ${i}`,
        createdAt: new Date(2023, 0, i + 1),
        updatedAt: new Date(2023, 1, i + 1),
    }));

    const data: InstitutionsResponse = { institutions: mockInstitutions };

    it('should return the correct slice of institutions', () => {
        const result = paginateInstitutions(data, 1, 3);
        expect(result.institutions).toHaveLength(3);
        expect(result.institutions[0].institutionId).toBe('id-3');
    });

    it('should return empty array if data is null', () => {
        const result = paginateInstitutions(null, 0, 5);
        expect(result.institutions).toEqual([]);
    });
});

describe('sortInstitutions', () => {
    const institutions: Institution[] = [
        {
            institutionId: '1',
            description: 'Beta',
            createdAt: new Date(2023, 0, 1),
            updatedAt: new Date(2023, 1, 1),
        },
        {
            institutionId: '2',
            description: 'Alpha',
            createdAt: new Date(2023, 0, 2),
            updatedAt: new Date(2023, 1, 2),
        },
        {
            institutionId: '3',
            description: 'Gamma',
            createdAt: new Date(2023, 0, 3),
            updatedAt: new Date(2023, 1, 3),
        },
    ];

    it('should sort by description ascending', () => {
        const result = sortInstitutions(institutions, 'asc', 'description');
        expect(result.map(i => i.description)).toEqual(['Alpha', 'Beta', 'Gamma']);
    });

    it('should sort by createdAt descending', () => {
        const result = sortInstitutions(institutions, 'desc', 'createdAt');
        expect(result.map(i => i.institutionId)).toEqual(['3', '2', '1']);
    });

    it('should sort by updatedAt ascending', () => {
        const result = sortInstitutions(institutions, 'asc', 'updatedAt');
        expect(result.map(i => i.institutionId)).toEqual(['1', '2', '3']);
    });
});
