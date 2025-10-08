import { fetchPartyDetails, fetchParties } from '../partyService';
import { Party } from '../../model/Party';

describe('partyService', () => {
  const mockParty: Party = {
    partyId: '123',
    description: 'Test Party',
    digitalAddress: 'test@example.com',
    fiscalCode: 'ABC123',
    originId: 'origin-1',
    origin: 'IPA',
    institutionType: 'PA',
    urlLogo: 'http://example.com/logo.png',
    externalId: '',
    status: 'PENDING',
    roles: [],
    registeredOffice: '',
    typology: ''
  };

  it('should return party from provided list', async () => {
    const result = await fetchPartyDetails('123', [mockParty]);
    expect(result).toEqual(mockParty);
  });

  it('should return null if party not found in provided list', async () => {
    const result = await fetchPartyDetails('not-found', [mockParty]);
    expect(result).toBeNull();
  });

  it('should return null if no list is provided (fallback)', async () => {
    const result = await fetchPartyDetails('any-id');
    expect(result).toBeNull();
  });

  it('fetchParties returns empty array', async () => {
    const result = await fetchParties();
    expect(result).toEqual([]);
  });
});
