import { buildAddress } from '../functions';

describe('buildAddress', () => {
  it('returns empty string when data is undefined', () => {
    expect(buildAddress()).toBe('');
  });

  it('returns empty string when data is null', () => {
    expect(buildAddress(null)).toBe('');
  });

  it('returns empty string when all fields are missing', () => {
    expect(buildAddress({})).toBe('');
  });

  it('returns empty string when all fields are nullish/empty', () => {
    expect(
      buildAddress({ address: '', zipCode: null, city: undefined, county: '' })
    ).toBe('');
  });

  it('builds the full address with every field', () => {
    expect(
      buildAddress({
        address: 'Via Municipio N. 8',
        zipCode: '81035',
        city: 'Roccamonfina',
        county: 'CE',
      })
    ).toBe('Via Municipio N. 8, 81035 Roccamonfina (CE)');
  });

  it('returns only the address when other fields are missing', () => {
    expect(buildAddress({ address: 'Via Roma 1' })).toBe('Via Roma 1');
  });

  it('omits the address segment when missing but keeps the rest', () => {
    expect(
      buildAddress({ zipCode: '00100', city: 'Roma', county: 'RM' })
    ).toBe(', 00100 Roma (RM)');
  });

  it('omits the zipCode segment when missing', () => {
    expect(
      buildAddress({ address: 'Via Roma 1', city: 'Roma', county: 'RM' })
    ).toBe('Via Roma 1 Roma (RM)');
  });

  it('omits the city segment when missing', () => {
    expect(
      buildAddress({ address: 'Via Roma 1', zipCode: '00100', county: 'RM' })
    ).toBe('Via Roma 1, 00100 (RM)');
  });

  it('omits the county segment when missing', () => {
    expect(
      buildAddress({ address: 'Via Roma 1', zipCode: '00100', city: 'Roma' })
    ).toBe('Via Roma 1, 00100 Roma');
  });

  it('handles null values mixed with valid ones', () => {
    expect(
      buildAddress({
        address: 'Via Roma 1',
        zipCode: null,
        city: 'Roma',
        county: null,
      })
    ).toBe('Via Roma 1 Roma');
  });

  it('trims leading/trailing whitespace in the final result', () => {
    expect(buildAddress({ city: 'Roma' })).toBe('Roma');
  });
});

