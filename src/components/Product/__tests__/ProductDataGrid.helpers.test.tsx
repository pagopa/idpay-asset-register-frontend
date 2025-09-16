import {
  getSelectedStatuses,
  isAllStatus,
  isSomeStatus,
  getStatusChecks,
  handleModalSuccess,
} from '../ProductDataGrid.helpers';
import { ProductDTO } from '../../../api/generated/register/ProductDTO';
import { ProductStatusEnum } from '../../../api/generated/register/ProductStatus';

const PRODUCTS_STATES = {
  UPLOADED: ProductStatusEnum.UPLOADED,
  SUPERVISED: ProductStatusEnum.SUPERVISED,
  WAIT_APPROVED: ProductStatusEnum.WAIT_APPROVED,
  APPROVED: ProductStatusEnum.APPROVED,
  REJECTED: ProductStatusEnum.REJECTED,
};
const MIDDLE_STATES = {
  REJECT_APPROVATION: 'REJECT_APPROVATION' as any,
};

const tableData: ProductDTO[] = [
  { gtinCode: '1', status: ProductStatusEnum.UPLOADED },
  { gtinCode: '2', status: ProductStatusEnum.SUPERVISED },
  { gtinCode: '3', status: ProductStatusEnum.WAIT_APPROVED },
  { gtinCode: '4', status: ProductStatusEnum.APPROVED },
  { gtinCode: '5', status: ProductStatusEnum.REJECTED },
];

describe('getSelectedStatuses', () => {
  it('returns statuses for selected gtinCodes', () => {
    expect(getSelectedStatuses(['1', '2'], tableData)).toEqual([
      PRODUCTS_STATES.UPLOADED,
      PRODUCTS_STATES.SUPERVISED,
    ]);
  });
  it('filters out not found', () => {
    expect(getSelectedStatuses(['10'], tableData)).toEqual([]);
  });
});

describe('isAllStatus', () => {
  it('returns true if all match', () => {
    expect(
      isAllStatus([PRODUCTS_STATES.UPLOADED, PRODUCTS_STATES.UPLOADED], PRODUCTS_STATES.UPLOADED)
    ).toBe(true);
  });
  it('returns false if not all match', () => {
    expect(
      isAllStatus([PRODUCTS_STATES.UPLOADED, PRODUCTS_STATES.SUPERVISED], PRODUCTS_STATES.UPLOADED)
    ).toBe(false);
  });
  it('returns true for empty array', () => {
    expect(isAllStatus([], PRODUCTS_STATES.UPLOADED)).toBe(true);
  });
});

describe('isSomeStatus', () => {
  it('returns true if some match', () => {
    expect(
      isSomeStatus([PRODUCTS_STATES.UPLOADED, PRODUCTS_STATES.SUPERVISED], PRODUCTS_STATES.UPLOADED)
    ).toBe(true);
  });
  it('returns false if none match', () => {
    expect(isSomeStatus([PRODUCTS_STATES.SUPERVISED], PRODUCTS_STATES.UPLOADED)).toBe(false);
  });
  it('returns false for empty array', () => {
    expect(isSomeStatus([], PRODUCTS_STATES.UPLOADED)).toBe(false);
  });
});

describe('getStatusChecks', () => {
  it('returns correct checks', () => {
    const result = getStatusChecks(['1', '1'], tableData);
    expect(result.selectedStatuses).toEqual([PRODUCTS_STATES.UPLOADED, PRODUCTS_STATES.UPLOADED]);
    expect(result.allUploaded).toBe(true);
    expect(result.allSupervised).toBe(false);
    expect(result.allWaitApproved).toBe(false);
    expect(result.someUploaded).toBe(true);
    expect(result.length).toBe(2);
  });
});

describe('handleModalSuccess', () => {
  let setShowMsgRejected: jest.Mock,
    setShowMsgApproved: jest.Mock,
    setShowMsgWaitApproved: jest.Mock;
  beforeEach(() => {
    setShowMsgRejected = jest.fn();
    setShowMsgApproved = jest.fn();
    setShowMsgWaitApproved = jest.fn();
  });

  it('APPROVED + allUploaded', () => {
    handleModalSuccess({
      selected: ['1'],
      tableData,
      modalAction: PRODUCTS_STATES.APPROVED,
      isInvitaliaUser: false,
      setShowMsgRejected,
      setShowMsgApproved,
      setShowMsgWaitApproved,
    });
    expect(setShowMsgApproved).toHaveBeenCalledWith(true);
    expect(setShowMsgWaitApproved).toHaveBeenCalledWith(false);
    expect(setShowMsgRejected).toHaveBeenCalledWith(false);
  });

  it('WAIT_APPROVED + allUploaded', () => {
    handleModalSuccess({
      selected: ['1'],
      tableData,
      modalAction: PRODUCTS_STATES.WAIT_APPROVED,
      isInvitaliaUser: false,
      setShowMsgRejected,
      setShowMsgApproved,
      setShowMsgWaitApproved,
    });
    expect(setShowMsgWaitApproved).toHaveBeenCalledWith(true);
    expect(setShowMsgApproved).toHaveBeenCalledWith(false);
    expect(setShowMsgRejected).toHaveBeenCalledWith(false);
  });

  it('SUPERVISED + allUploaded', () => {
    handleModalSuccess({
      selected: ['1'],
      tableData,
      modalAction: PRODUCTS_STATES.SUPERVISED,
      isInvitaliaUser: false,
      setShowMsgRejected,
      setShowMsgApproved,
      setShowMsgWaitApproved,
    });
    expect(setShowMsgWaitApproved).toHaveBeenCalledWith(true);
    expect(setShowMsgApproved).toHaveBeenCalledWith(false);
    expect(setShowMsgRejected).toHaveBeenCalledWith(false);
  });

  it('WAIT_APPROVED + allSupervised + isInvitaliaUser', () => {
    handleModalSuccess({
      selected: ['2'],
      tableData,
      modalAction: PRODUCTS_STATES.WAIT_APPROVED,
      isInvitaliaUser: true,
      setShowMsgRejected,
      setShowMsgApproved,
      setShowMsgWaitApproved,
    });
    expect(setShowMsgWaitApproved).toHaveBeenCalledWith(true);
    expect(setShowMsgApproved).toHaveBeenCalledWith(false);
    expect(setShowMsgRejected).toHaveBeenCalledWith(false);
  });

  it('APPROVED + allSupervised + isInvitaliaUser', () => {
    handleModalSuccess({
      selected: ['2'],
      tableData,
      modalAction: PRODUCTS_STATES.APPROVED,
      isInvitaliaUser: true,
      setShowMsgRejected,
      setShowMsgApproved,
      setShowMsgWaitApproved,
    });
    expect(setShowMsgApproved).toHaveBeenCalledWith(true);
    expect(setShowMsgWaitApproved).toHaveBeenCalledWith(false);
    expect(setShowMsgRejected).toHaveBeenCalledWith(false);
  });

  it('REJECTED', () => {
    handleModalSuccess({
      selected: ['5'],
      tableData,
      modalAction: PRODUCTS_STATES.REJECTED,
      isInvitaliaUser: false,
      setShowMsgRejected,
      setShowMsgApproved,
      setShowMsgWaitApproved,
    });
    expect(setShowMsgRejected).toHaveBeenCalledWith(true);
    expect(setShowMsgApproved).toHaveBeenCalledWith(false);
    expect(setShowMsgWaitApproved).toHaveBeenCalledWith(false);
  });

  it('REJECT_APPROVATION', () => {
    handleModalSuccess({
      selected: ['5'],
      tableData,
      modalAction: MIDDLE_STATES.REJECT_APPROVATION,
      isInvitaliaUser: false,
      setShowMsgRejected,
      setShowMsgApproved,
      setShowMsgWaitApproved,
    });
    expect(setShowMsgRejected).toHaveBeenCalledWith(true);
    expect(setShowMsgApproved).toHaveBeenCalledWith(false);
    expect(setShowMsgWaitApproved).toHaveBeenCalledWith(false);
  });

  it('REJECTED + isInvitaliaUser + allUploaded', () => {
    handleModalSuccess({
      selected: ['1'],
      tableData,
      modalAction: PRODUCTS_STATES.REJECTED,
      isInvitaliaUser: true,
      setShowMsgRejected,
      setShowMsgApproved,
      setShowMsgWaitApproved,
    });
    // resetMsgs: all false
    expect(setShowMsgRejected).toHaveBeenCalledWith(false);
    expect(setShowMsgApproved).toHaveBeenCalledWith(false);
    expect(setShowMsgWaitApproved).toHaveBeenCalledWith(false);
  });

  it('REJECTED + isInvitaliaUser + allSupervised', () => {
    handleModalSuccess({
      selected: ['2'],
      tableData,
      modalAction: PRODUCTS_STATES.REJECTED,
      isInvitaliaUser: true,
      setShowMsgRejected,
      setShowMsgApproved,
      setShowMsgWaitApproved,
    });
    // resetMsgs: all false
    expect(setShowMsgRejected).toHaveBeenCalledWith(false);
    expect(setShowMsgApproved).toHaveBeenCalledWith(false);
    expect(setShowMsgWaitApproved).toHaveBeenCalledWith(false);
  });

  it('default case', () => {
    handleModalSuccess({
      selected: ['3'],
      tableData,
      modalAction: 'UNKNOWN',
      isInvitaliaUser: false,
      setShowMsgRejected,
      setShowMsgApproved,
      setShowMsgWaitApproved,
    });
    expect(setShowMsgApproved).toHaveBeenCalledWith(true);
    expect(setShowMsgWaitApproved).toHaveBeenCalledWith(false);
    expect(setShowMsgRejected).toHaveBeenCalledWith(false);
  });
});
