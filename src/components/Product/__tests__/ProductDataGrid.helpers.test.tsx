import { getSelectedStatuses, isAllStatus, isSomeStatus, getStatusChecks, handleModalSuccess } from '../ProductDataGrid.helpers';
import {ProductStatusEnum} from "../../../api/generated/register/ProductStatus";
import {ProductDTO} from "../../../api/generated/register/ProductDTO";
import {MIDDLE_STATES, PRODUCTS_STATES} from "../../../utils/constants";

describe('ProductDataGrid.helpers', () => {
  const row = (gtinCode: string, status: ProductStatusEnum): ProductDTO => ({
    gtinCode,
    status,
    productName: '',
    category: undefined,
    eprelCode: '',
    producerId: '',
    batchId: '',
    id: '',
  });

  it('getSelectedStatuses filters and preserves order', () => {
    const tableData = [row('A', ProductStatusEnum.UPLOADED), row('B', ProductStatusEnum.SUPERVISED)];
    const result = getSelectedStatuses(['B', 'X', 'A'], tableData);
    expect(result).toEqual([ProductStatusEnum.SUPERVISED, ProductStatusEnum.UPLOADED]);
  });

  it('isAllStatus works for true and false', () => {
    expect(isAllStatus(['a', 'a'], 'a')).toBe(true);
    expect(isAllStatus(['a', 'b'], 'a')).toBe(false);
  });

  it('isSomeStatus works for true and false', () => {
    expect(isSomeStatus(['a', 'b'], 'a')).toBe(true);
    expect(isSomeStatus(['b', 'c'], 'a')).toBe(false);
  });

  it('getStatusChecks detects allUploaded, allSupervised, allWaitApproved, someUploaded and length', () => {
    const tableData = [
      row('A', ProductStatusEnum.UPLOADED),
      row('B', ProductStatusEnum.UPLOADED),
      row('C', ProductStatusEnum.WAIT_APPROVED),
    ];
    const allUp = getStatusChecks(['A', 'B'], tableData);
    expect(allUp.allUploaded).toBe(true);
    expect(allUp.someUploaded).toBe(true);
    expect(allUp.allSupervised).toBe(false);
    expect(allUp.allWaitApproved).toBe(false);
    expect(allUp.length).toBe(2);
    const allSup = getStatusChecks(['A', 'C'], [
      row('A', ProductStatusEnum.SUPERVISED),
      row('C', ProductStatusEnum.SUPERVISED),
    ]);
    expect(allSup.allSupervised).toBe(true);
    const allWait = getStatusChecks(['C'], tableData);
    expect(allWait.allWaitApproved).toBe(true);
  });

  const makeSetters = (initial = { approved: false, wait: false, rejected: false }) => {
    let approved = initial.approved;
    let wait = initial.wait;
    let rejected = initial.rejected;
    return {
      states: () => ({ approved, wait, rejected }),
      setShowMsgApproved: (v: boolean) => {
        approved = v;
      },
      setShowMsgWaitApproved: (v: boolean) => {
        wait = v;
      },
      setShowMsgRejected: (v: boolean) => {
        rejected = v;
      },
    };
  };

  it('handleModalSuccess: APPROVED when all UPLOADED', () => {
    const tableData = [row('A', ProductStatusEnum.UPLOADED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.APPROVED,
      isInvitaliaUser: false,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
    });
    expect(setters.states()).toEqual({ approved: true, wait: false, rejected: false });
  });

  it('handleModalSuccess: WAIT_APPROVED when all UPLOADED', () => {
    const tableData = [row('A', ProductStatusEnum.UPLOADED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.WAIT_APPROVED,
      isInvitaliaUser: false,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
    });
    expect(setters.states()).toEqual({ approved: false, wait: true, rejected: false });
  });

  it('handleModalSuccess: SUPERVISED when all UPLOADED shows waitApproved message', () => {
    const tableData = [row('A', ProductStatusEnum.UPLOADED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.SUPERVISED,
      isInvitaliaUser: false,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
    });
    expect(setters.states()).toEqual({ approved: false, wait: true, rejected: false });
  });

  it('handleModalSuccess: Invitalia WAIT_APPROVED when all SUPERVISED', () => {
    const tableData = [row('A', ProductStatusEnum.SUPERVISED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.WAIT_APPROVED,
      isInvitaliaUser: true,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
    });
    expect(setters.states()).toEqual({ approved: false, wait: true, rejected: false });
  });

  it('handleModalSuccess: Invitalia APPROVED when all SUPERVISED', () => {
    const tableData = [row('A', ProductStatusEnum.SUPERVISED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.APPROVED,
      isInvitaliaUser: true,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
    });
    expect(setters.states()).toEqual({ approved: true, wait: false, rejected: false });
  });

  it('handleModalSuccess: Invitalia REJECTED with all UPLOADED resets all messages', () => {
    const tableData = [row('A', ProductStatusEnum.UPLOADED)];
    const setters = makeSetters({ approved: true, wait: true, rejected: true });
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.REJECTED,
      isInvitaliaUser: true,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
    });
    expect(setters.states()).toEqual({ approved: false, wait: false, rejected: false });
  });

  it('handleModalSuccess: REJECTED or REJECT_APPROVATION shows rejected when not covered by earlier branches', () => {
    const tableData = [row('A', ProductStatusEnum.WAIT_APPROVED)];
    const s1 = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.REJECTED,
      isInvitaliaUser: false,
      setShowMsgApproved: s1.setShowMsgApproved,
      setShowMsgWaitApproved: s1.setShowMsgWaitApproved,
      setShowMsgRejected: s1.setShowMsgRejected,
    });
    expect(s1.states()).toEqual({ approved: false, wait: false, rejected: true });
    const s2 = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: MIDDLE_STATES.REJECT_APPROVATION,
      isInvitaliaUser: false,
      setShowMsgApproved: s2.setShowMsgApproved,
      setShowMsgWaitApproved: s2.setShowMsgWaitApproved,
      setShowMsgRejected: s2.setShowMsgRejected,
    });
    expect(s2.states()).toEqual({ approved: false, wait: false, rejected: true });
  });

  it('handleModalSuccess: default path sets approved when no branch matches', () => {
    const tableData = [row('A', ProductStatusEnum.WAIT_APPROVED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: 'SOME_OTHER',
      isInvitaliaUser: false,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
    });
    expect(setters.states()).toEqual({ approved: true, wait: false, rejected: false });
  });
});
