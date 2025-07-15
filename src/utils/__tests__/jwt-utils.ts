import { parseJwt } from '../jwt-utils';

describe('parseJwt', () => {
    it('should correctly parse a valid JWT token', () => {
        const payload = { sub: '1234567890', name: 'John Doe', admin: true };
        const base64Payload = btoa(JSON.stringify(payload));
        const token = `header.${base64Payload}.signature`;

        const result = parseJwt(token);

        expect(result).toEqual(payload);
    });

    it('should return null for malformed token (no dots)', () => {
        const result = parseJwt('invalidtoken');
        expect(result).toBeNull();
    });

    it('should return null for invalid base64 payload', () => {
        const token = 'header.invalid-base64.signature';
        const result = parseJwt(token);
        expect(result).toBeNull();
    });

    it('should return null for invalid JSON in payload', () => {
        const invalidJson = btoa('not a json');
        const token = `header.${invalidJson}.signature`;
        const result = parseJwt(token);
        expect(result).toBeNull();
    });
});
