import { Party, UserRole, PartyRole, UserStatus, PLACEHOLDER_PARTY_LOGO } from '../Party';

describe('Party Model', () => {
    describe('Type Definitions', () => {
        it('should accept valid SelfcareRole values', () => {
            const adminRole: 'ADMIN' = 'ADMIN';
            const limitedRole: 'LIMITED' = 'LIMITED';

            expect(adminRole).toBe('ADMIN');
            expect(limitedRole).toBe('LIMITED');
        });

        it('should accept valid PartyRole values', () => {
            const delegate: PartyRole = 'DELEGATE';
            const manager: PartyRole = 'MANAGER';
            const operator: PartyRole = 'OPERATOR';
            const subDelegate: PartyRole = 'SUB_DELEGATE';

            expect(delegate).toBe('DELEGATE');
            expect(manager).toBe('MANAGER');
            expect(operator).toBe('OPERATOR');
            expect(subDelegate).toBe('SUB_DELEGATE');
        });

        it('should accept valid UserStatus values', () => {
            const pending: UserStatus = 'PENDING';
            const active: UserStatus = 'ACTIVE';
            const suspended: UserStatus = 'SUSPENDED';

            expect(pending).toBe('PENDING');
            expect(active).toBe('ACTIVE');
            expect(suspended).toBe('SUSPENDED');
        });
    });

    describe('UserRole', () => {
        it('should create a valid UserRole object', () => {
            const userRole: UserRole = {
                partyRole: 'MANAGER',
                roleKey: 'admin-role',
            };

            expect(userRole.partyRole).toBe('MANAGER');
            expect(userRole.roleKey).toBe('admin-role');
        });

        it('should accept custom string as partyRole', () => {
            const userRole: UserRole = {
                partyRole: 'CUSTOM_ROLE',
                roleKey: 'custom-key',
            };

            expect(userRole.partyRole).toBe('CUSTOM_ROLE');
            expect(userRole.roleKey).toBe('custom-key');
        });
    });

    describe('Party', () => {
        it('should create a valid Party object with required fields', () => {
            const party: Party = {
                partyId: '123',
                externalId: 'ext-123',
                originId: 'origin-123',
                origin: 'IPA',
                description: 'Test Party',
                digitalAddress: 'test@example.com',
                status: 'ACTIVE',
                roles: [
                    {
                        partyRole: 'MANAGER',
                        roleKey: 'admin',
                    },
                ],
                fiscalCode: 'IT12345678901',
                registeredOffice: 'Via Test 123, Roma',
                typology: 'PA',
            };

            expect(party.partyId).toBe('123');
            expect(party.externalId).toBe('ext-123');
            expect(party.originId).toBe('origin-123');
            expect(party.origin).toBe('IPA');
            expect(party.description).toBe('Test Party');
            expect(party.digitalAddress).toBe('test@example.com');
            expect(party.status).toBe('ACTIVE');
            expect(party.roles).toHaveLength(1);
            expect(party.fiscalCode).toBe('IT12345678901');
            expect(party.registeredOffice).toBe('Via Test 123, Roma');
            expect(party.typology).toBe('PA');
        });

        it('should create a Party object with optional fields', () => {
            const party: Party = {
                partyId: '456',
                externalId: 'ext-456',
                originId: 'origin-456',
                origin: 'ANAC',
                description: 'Test Party with Optional Fields',
                digitalAddress: 'optional@example.com',
                status: 'PENDING',
                roles: [],
                category: 'L37',
                urlLogo: 'https://example.com/logo.png',
                fiscalCode: 'IT98765432109',
                registeredOffice: 'Via Optional 456, Milano',
                typology: 'GSP',
                institutionType: 'PA',
            };

            expect(party.category).toBe('L37');
            expect(party.urlLogo).toBe('https://example.com/logo.png');
            expect(party.institutionType).toBe('PA');
        });

        it('should handle multiple roles', () => {
            const party: Party = {
                partyId: '789',
                externalId: 'ext-789',
                originId: 'origin-789',
                origin: 'IPA',
                description: 'Multi-Role Party',
                digitalAddress: 'multi@example.com',
                status: 'ACTIVE',
                roles: [
                    { partyRole: 'MANAGER', roleKey: 'role1' },
                    { partyRole: 'OPERATOR', roleKey: 'role2' },
                    { partyRole: 'DELEGATE', roleKey: 'role3' },
                ],
                fiscalCode: 'IT11122233344',
                registeredOffice: 'Via Multi 789, Napoli',
                typology: 'GSP',
            };

            expect(party.roles).toHaveLength(3);
            expect(party.roles[0].partyRole).toBe('MANAGER');
            expect(party.roles[1].partyRole).toBe('OPERATOR');
            expect(party.roles[2].partyRole).toBe('DELEGATE');
        });

        it('should handle all UserStatus values', () => {
            const pendingParty: Party = {
                partyId: '1',
                externalId: 'ext-1',
                originId: 'origin-1',
                origin: 'IPA',
                description: 'Pending Party',
                digitalAddress: 'pending@example.com',
                status: 'PENDING',
                roles: [],
                fiscalCode: 'IT11111111111',
                registeredOffice: 'Via Pending 1',
                typology: 'PA',
            };

            const activeParty: Party = {
                ...pendingParty,
                partyId: '2',
                status: 'ACTIVE',
            };

            const suspendedParty: Party = {
                ...pendingParty,
                partyId: '3',
                status: 'SUSPENDED',
            };

            expect(pendingParty.status).toBe('PENDING');
            expect(activeParty.status).toBe('ACTIVE');
            expect(suspendedParty.status).toBe('SUSPENDED');
        });

        it('should handle empty roles array', () => {
            const party: Party = {
                partyId: '999',
                externalId: 'ext-999',
                originId: 'origin-999',
                origin: 'IPA',
                description: 'No Roles Party',
                digitalAddress: 'noroles@example.com',
                status: 'ACTIVE',
                roles: [],
                fiscalCode: 'IT99999999999',
                registeredOffice: 'Via NoRoles 999',
                typology: 'PA',
            };

            expect(party.roles).toEqual([]);
            expect(party.roles).toHaveLength(0);
        });
    });

    describe('PLACEHOLDER_PARTY_LOGO', () => {
        it('should have the correct placeholder logo URL', () => {
            expect(PLACEHOLDER_PARTY_LOGO).toBe(
                'https://selcdcheckoutsa.z6.web.core.windows.net/institutions/onboarded/logo.png'
            );
        });

        it('should be a valid URL', () => {
            expect(() => new URL(PLACEHOLDER_PARTY_LOGO)).not.toThrow();
        });
    });

    describe('Type Safety', () => {
        it('should enforce required fields on Party type', () => {
            const validParty: Party = {
                partyId: 'required-test',
                externalId: 'ext-required',
                originId: 'origin-required',
                origin: 'IPA',
                description: 'Required Fields Test',
                digitalAddress: 'required@example.com',
                status: 'ACTIVE',
                roles: [],
                fiscalCode: 'IT00000000000',
                registeredOffice: 'Via Required',
                typology: 'PA',
            };

            expect(validParty).toBeDefined();
        });

        it('should allow optional fields to be undefined', () => {
            const party: Party = {
                partyId: 'optional-test',
                externalId: 'ext-optional',
                originId: 'origin-optional',
                origin: 'IPA',
                description: 'Optional Fields Test',
                digitalAddress: 'optional@example.com',
                status: 'ACTIVE',
                roles: [],
                fiscalCode: 'IT00000000001',
                registeredOffice: 'Via Optional',
                typology: 'PA',
            };

            expect(party.category).toBeUndefined();
            expect(party.urlLogo).toBeUndefined();
            expect(party.institutionType).toBeUndefined();
        });
    });
});