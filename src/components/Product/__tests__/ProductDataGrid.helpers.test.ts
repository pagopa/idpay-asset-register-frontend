/// <reference types="jest" />
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
      tableConfig: { columns: [] } as any,
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('EMPTY');
  });

  test('blocks mixed status when preventMixedStatus true', () => {
    const result = validateBulkActionPreconditions({
      selected: ['1', '2'],
      tableData,
      roleKey: 'invitalia',
      tableConfig: {
        bulkRules: {
          preventMixedStatus: true,
        },
      } as any,
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('MIXED_STATUS');
  });

  test('allows mixed status when preventMixedStatus false', () => {
    const result = validateBulkActionPreconditions({
      selected: ['1', '2'],
      tableData,
      roleKey: 'invitalia',
      tableConfig: {
        bulkRules: {
          preventMixedStatus: false,
        },
      } as any,
    });

    expect(result.valid).toBe(true);
  });

  test('blocks when status not allowed for role', () => {
    const result = validateBulkActionPreconditions({
      selected: ['1'],
      tableData,
      roleKey: 'invitalia_admin',
      tableConfig: {
        bulkRules: {
          allowedStatusesByRole: {
            invitalia_admin: ['WAIT_APPROVED'],
          },
        },
      } as any,
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('NOT_ALLOWED_STATUS');
  });

  test('allows when status allowed for role', () => {
    const result = validateBulkActionPreconditions({
      selected: ['2'],
      tableData,
      roleKey: 'invitalia_admin',
      tableConfig: {
        bulkRules: {
          allowedStatusesByRole: {
            invitalia_admin: ['WAIT_APPROVED'],
          },
        },
      } as any,
    });

    expect(result.valid).toBe(true);
  });
});
