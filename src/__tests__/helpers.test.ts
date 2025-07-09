import {
  formattedCurrency,
  formatIban,
  formatDate,
  formatFileName,
  initUploadBoxStyle,
  initUploadHelperBoxStyle,
} from '../helpers';

describe('helpers.ts', () => {
  describe('formattedCurrency', () => {
    it('formatta un numero come valuta EUR senza centesimi', () => {
      expect(formattedCurrency(1234)).toBe('1.234,00 €');
    });

    it('formatta un numero come valuta EUR con centesimi', () => {
      expect(formattedCurrency(1234, '-', true)).toBe('12,34 €');
    });

    it('restituisce il simbolo se il numero è undefined', () => {
      expect(formattedCurrency(undefined)).toBe('-');
    });

    it('restituisce il simbolo se il numero è 0', () => {
      expect(formattedCurrency(0)).toBe('-');
    });
  });

  describe('formatIban', () => {
    it('formatta un IBAN valido', () => {
      expect(formatIban('IT60X0542811101000000123456')).toBe('IT 60 X 05428 11101 00000 123456');
    });

    it('restituisce stringa vuota se IBAN è undefined', () => {
      expect(formatIban(undefined)).toBe('');
    });

    it('gestisce IBAN troppo corto', () => {
      expect(formatIban('IT60')).toBe('IT 60  ');
    });
  });

  describe('formatDate', () => {
    it('formatta una data valida', () => {
      const date = new Date('2023-01-01T12:34:00Z');
      expect(formatDate(date)).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });

    it('restituisce stringa vuota se la data è undefined', () => {
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('formatFileName', () => {
    it('tronca e formatta nomi file lunghi', () => {
      expect(formatFileName('documento_molto_lungo.pdf')).toBe('documento_... .pdf');
    });

    it('restituisce il nome se <= 15 caratteri', () => {
      expect(formatFileName('file.txt')).toBe('file.txt');
    });

    it('restituisce stringa vuota se name è undefined', () => {
      expect(formatFileName(undefined)).toBe('');
    });

    it('gestisce nomi senza estensione', () => {
      expect(formatFileName('documento_molto_lungo')).toBe('documento_... .molto_lungo');
    });
  });

  describe('initUploadBoxStyle', () => {
    it('ha le proprietà richieste', () => {
      expect(initUploadBoxStyle).toHaveProperty('border');
      expect(initUploadBoxStyle).toHaveProperty('borderRadius');
      expect(initUploadBoxStyle).toHaveProperty('backgroundColor');
    });
  });

  describe('initUploadHelperBoxStyle', () => {
    it('ha le proprietà richieste', () => {
      expect(initUploadHelperBoxStyle).toHaveProperty('py');
      expect(initUploadHelperBoxStyle).toHaveProperty('px');
      expect(initUploadHelperBoxStyle).toHaveProperty('alignItems');
    });
  });
});
