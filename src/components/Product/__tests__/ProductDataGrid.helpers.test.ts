import { describe, test, expect } from '@jest/globals';
import { validateBulkActionPreconditions } from '../ProductDataGrid.helpers';
import { ProductDTO } from '../../../api/generated/register';

const createRow = (status: any, gtinCode: string): ProductDTO =>
  ({
    status,
    gtinCode,
  } as ProductDTO);

describe('validateBulkActionPreconditions - config driven', () => {
  const tableData: ProductDTO[] = [
    createRow('UPLOADED', '1'),
    createRow('WAIT_APPROVED', '2'),
    createRow('SUPERVISED', '3'),
  ];

  test('returns EMPTY when nothing selected', () => {
    const result = validateBulkActionPreconditions({
      selected: [],
      tableData,
      roleKey: 'invitalia',
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('EMPTY');
  });

  test('blocks mixed status when preventMixedStatus true', () => {
    const result = validateBulkActionPreconditions({
      selected: ['1', '2'],
      tableData,
      roleKey: 'invitalia',
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('MIXED_STATUS');
  });

  test('blocks mixed status when preventMixedStatus false because current logic always rejects mixed statuses', () => {
    const result = validateBulkActionPreconditions({
      selected: ['1', '2'],
      tableData,
      roleKey: 'invitalia',
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('MIXED_STATUS');
  });

  test('allows when status not allowed for role because role config is currently ignored', () => {
    const result = validateBulkActionPreconditions({
      selected: ['1'],
      tableData,
      roleKey: 'invitalia_admin',
    });

    expect(result.valid).toBe(true);
  });

  test('allows when status allowed for role', () => {
    const result = validateBulkActionPreconditions({
      selected: ['2'],
      tableData,
      roleKey: 'invitalia_admin',
    });

    expect(result.valid).toBe(true);
  });
});
