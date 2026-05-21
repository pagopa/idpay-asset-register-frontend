import { validateBulkActionPreconditions } from '../ProductDataGrid.helpers';
import { PRODUCTS_STATES } from '../../../utils/constants';

describe('ProductDataGrid.helpers - validateBulkActionPreconditions', () => {
  const buildRow = (status: string, gtin: string) => ({
    gtinCode: gtin,
    status,
  });

  it('returns valid when statuses are homogeneous', () => {
    const result = validateBulkActionPreconditions({
      selected: ['1', '2'],
      tableData: [
        buildRow(PRODUCTS_STATES.UPLOADED, '1'),
        buildRow(PRODUCTS_STATES.UPLOADED, '2'),
      ] as any,
      isInvitaliaAdmin: false,
    });

    expect(result.valid).toBe(true);
  });

  it('returns invalid for mixed statuses', () => {
    const result = validateBulkActionPreconditions({
      selected: ['1', '2'],
      tableData: [
        buildRow(PRODUCTS_STATES.UPLOADED, '1'),
        buildRow(PRODUCTS_STATES.SUPERVISED, '2'),
      ] as any,
      isInvitaliaAdmin: false,
    });

    expect(result.valid).toBe(false);
  });

  it('returns invalid for self approval when admin', () => {
    const result = validateBulkActionPreconditions({
      selected: ['1'],
      tableData: [buildRow(PRODUCTS_STATES.UPLOADED, '1')] as any,
      isInvitaliaAdmin: true,
    });

    expect(result.valid).toBe(false);
  });
});
