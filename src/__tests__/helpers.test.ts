import { formattedCurrency, formatDate, formatIban } from '../helpers';

const date = new Date('2022-10-01T00:00:00.000Z');

// test('test copyTextToClipboard with a string as param', () => {
//   const writeText = jest.spyOn(navigator.clipboard, 'writeText');
//   copyTextToClipboard('test');
//   expect(navigator.clipboard.readText()).toEqual('test');
// });

test('test formattedCurrency with undefined as param', () => {
  expect(formattedCurrency(undefined)).toEqual('-');
});

test('test formattedCurrency with a number as param', () => {
  const result = formattedCurrency(20.3);
  expect(result).toContain('20,30');
});

test('test formatDate with undefined as param', () => {
  expect(formatDate(undefined)).toEqual('');
});

test('test formatDate with a Date object as param', () => {
  expect(formatDate(date)).toContain('01/10/2022');
});

test('test formatIban with a string of IBAN as param', () => {
  expect(formatIban('IT03M0300203280794663157929')).toEqual('IT 03 M 03002 03280 794663157929');
});

test('test formatIban with undefined as param', () => {
  expect(formatIban(undefined)).toEqual('');
});
