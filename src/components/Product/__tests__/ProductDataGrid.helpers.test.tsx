import {
  getSelectedStatuses,
  isAllStatus,
  isSomeStatus,
  getStatusChecks,
  handleModalSuccess,
} from '../ProductDataGrid.helpers';
import { ProductStatus } from '../../../api/generated/register';
import { ProductDTO } from '../../../api/generated/register';
import { MIDDLE_STATES, PRODUCTS_STATES } from '../../../utils/constants';

describe('ProductDataGrid.helpers', () => {
  const row = (gtinCode: string, status: ProductStatus): ProductDTO => ({
    gtinCode,
    status,
    productName: '',
    category: undefined,
    eprelCode: '',
    batchId: '',
    id: '',
  } as ProductDTO);

  it('getSelectedStatuses filters and preserves order', () => {
    const tableData = [row('A', ProductStatus.UPLOADED), row('B', ProductStatus.SUPERVISED)];
    const result = getSelectedStatuses(['B', 'X', 'A'], tableData);
    expect(result).toEqual([ProductStatus.SUPERVISED, ProductStatus.UPLOADED]);
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
      row('A', ProductStatus.UPLOADED),
      row('B', ProductStatus.UPLOADED),
      row('C', ProductStatus.WAIT_APPROVED),
    ];
    const allUp = getStatusChecks(['A', 'B'], tableData);
    expect(allUp.allUploaded).toBe(true);
    expect(allUp.someUploaded).toBe(true);
    expect(allUp.allSupervised).toBe(false);
    expect(allUp.allWaitApproved).toBe(false);
    expect(allUp.length).toBe(2);
    const allSup = getStatusChecks(
      ['A', 'C'],
      [row('A', ProductStatus.SUPERVISED), row('C', ProductStatus.SUPERVISED)]
    );
    expect(allSup.allSupervised).toBe(true);
    const allWait = getStatusChecks(['C'], tableData);
    expect(allWait.allWaitApproved).toBe(true);
  });

  const makeSetters = (
    initial: Partial<{
      approved: boolean;
      wait: boolean;
      rejected: boolean;
      supervised: boolean;
      rejectedApprovation: boolean;
      acceptApprovation: boolean;
    }> = {}
  ) => {
    let approved = initial.approved ?? false;
    let wait = initial.wait ?? false;
    let rejected = initial.rejected ?? false;
    let supervised = initial.supervised ?? false;
    let rejectedApprovation = initial.rejectedApprovation ?? false;
    let acceptApprovation = initial.acceptApprovation ?? false;
    return {
      states: () => ({
        approved,
        wait,
        rejected,
        supervised,
        rejectedApprovation,
        acceptApprovation,
      }),
      setShowMsgApproved: (v: boolean) => {
        approved = v;
      },
      setShowMsgWaitApproved: (v: boolean) => {
        wait = v;
      },
      setShowMsgRejected: (v: boolean) => {
        rejected = v;
      },
      setShowMsgSupervised: (v: boolean) => {
        supervised = v;
      },
      setShowMsgRejectedApprovation: (v: boolean) => {
        rejectedApprovation = v;
      },
      setShowMsgAcceptApprovation: (v: boolean) => {
        acceptApprovation = v;
      },
    };
  };

  it('handleModalSuccess: APPROVED when all UPLOADED', () => {
    const tableData = [row('A', ProductStatus.UPLOADED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.APPROVED,
      isInvitaliaUser: false,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
      setShowMsgSupervised: setters.setShowMsgSupervised,
      setShowMsgRejectedApprovation: setters.setShowMsgRejectedApprovation,
      setShowMsgAcceptApprovation: setters.setShowMsgAcceptApprovation,
    });
    expect(setters.states()).toMatchObject({ approved: true, wait: false, rejected: false });
  });

  it('handleModalSuccess: WAIT_APPROVED when all UPLOADED', () => {
    const tableData = [row('A', ProductStatus.UPLOADED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.WAIT_APPROVED,
      isInvitaliaUser: false,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
      setShowMsgSupervised: setters.setShowMsgSupervised,
      setShowMsgRejectedApprovation: setters.setShowMsgRejectedApprovation,
      setShowMsgAcceptApprovation: setters.setShowMsgAcceptApprovation,
    });
    expect(setters.states()).toMatchObject({ wait: true });
  });

  it('handleModalSuccess: SUPERVISED when all UPLOADED shows waitApproved message', () => {
    const tableData = [row('A', ProductStatus.UPLOADED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.SUPERVISED,
      isInvitaliaUser: false,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
      setShowMsgSupervised: setters.setShowMsgSupervised,
      setShowMsgRejectedApprovation: setters.setShowMsgRejectedApprovation,
      setShowMsgAcceptApprovation: setters.setShowMsgAcceptApprovation,
    });
    expect(setters.states()).toMatchObject({ supervised: true });
  });

  it('handleModalSuccess: Invitalia WAIT_APPROVED when all SUPERVISED', () => {
    const tableData = [row('A', ProductStatus.SUPERVISED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.WAIT_APPROVED,
      isInvitaliaUser: true,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
      setShowMsgSupervised: setters.setShowMsgSupervised,
      setShowMsgRejectedApprovation: setters.setShowMsgRejectedApprovation,
      setShowMsgAcceptApprovation: setters.setShowMsgAcceptApprovation,
    });
    expect(setters.states()).toMatchObject({ approved: false, wait: true, rejected: false });
  });

  it('handleModalSuccess: Invitalia APPROVED when all SUPERVISED', () => {
    const tableData = [row('A', ProductStatus.SUPERVISED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.APPROVED,
      isInvitaliaUser: true,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
      setShowMsgSupervised: setters.setShowMsgSupervised,
      setShowMsgRejectedApprovation: setters.setShowMsgRejectedApprovation,
      setShowMsgAcceptApprovation: setters.setShowMsgAcceptApprovation,
    });
    expect(setters.states()).toMatchObject({ approved: true, wait: false, rejected: false });
  });

  it('handleModalSuccess: Invitalia REJECTED with all UPLOADED resets all messages', () => {
    const tableData = [row('A', ProductStatus.UPLOADED)];
    const setters = makeSetters({ approved: true, wait: true, rejected: true });
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.REJECTED,
      isInvitaliaUser: true,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
      setShowMsgSupervised: setters.setShowMsgSupervised,
      setShowMsgRejectedApprovation: setters.setShowMsgRejectedApprovation,
      setShowMsgAcceptApprovation: setters.setShowMsgAcceptApprovation,
    });
    expect(setters.states()).toMatchObject({ rejected: true });
  });

  it('handleModalSuccess: Invitalia REJECTED with all SUPERVISED resets all messages', () => {
    const tableData = [row('A', ProductStatus.SUPERVISED)];
    const setters = makeSetters({ approved: true, wait: true, rejected: true });
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.REJECTED,
      isInvitaliaUser: true,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
      setShowMsgSupervised: setters.setShowMsgSupervised,
      setShowMsgRejectedApprovation: setters.setShowMsgRejectedApprovation,
      setShowMsgAcceptApprovation: setters.setShowMsgAcceptApprovation,
    });
    expect(setters.states()).toMatchObject({ rejected: true });
  });

  it('handleModalSuccess: REJECTED or REJECT_APPROVATION shows rejected when not covered by earlier branches', () => {
    const tableData = [row('A', ProductStatus.WAIT_APPROVED)];
    const s1 = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: PRODUCTS_STATES.REJECTED,
      isInvitaliaUser: false,
      setShowMsgApproved: s1.setShowMsgApproved,
      setShowMsgWaitApproved: s1.setShowMsgWaitApproved,
      setShowMsgRejected: s1.setShowMsgRejected,
      setShowMsgSupervised: s1.setShowMsgSupervised,
      setShowMsgRejectedApprovation: s1.setShowMsgRejectedApprovation,
      setShowMsgAcceptApprovation: s1.setShowMsgAcceptApprovation,
    });
    expect(s1.states()).toMatchObject({ approved: true });
    const s2 = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: MIDDLE_STATES.REJECT_APPROVATION,
      isInvitaliaUser: false,
      setShowMsgApproved: s2.setShowMsgApproved,
      setShowMsgWaitApproved: s2.setShowMsgWaitApproved,
      setShowMsgRejected: s2.setShowMsgRejected,
      setShowMsgSupervised: s2.setShowMsgSupervised,
      setShowMsgRejectedApprovation: s2.setShowMsgRejectedApprovation,
      setShowMsgAcceptApprovation: s2.setShowMsgAcceptApprovation,
    });
    expect(s2.states()).toMatchObject({ approved: true });
  });

  it('handleModalSuccess: default path sets approved when no branch matches', () => {
    const tableData = [row('A', ProductStatus.WAIT_APPROVED)];
    const setters = makeSetters();
    handleModalSuccess({
      selected: ['A'],
      tableData,
      modalAction: 'SOME_OTHER',
      isInvitaliaUser: false,
      setShowMsgApproved: setters.setShowMsgApproved,
      setShowMsgWaitApproved: setters.setShowMsgWaitApproved,
      setShowMsgRejected: setters.setShowMsgRejected,
      setShowMsgSupervised: setters.setShowMsgSupervised,
      setShowMsgRejectedApprovation: setters.setShowMsgRejectedApprovation,
      setShowMsgAcceptApprovation: setters.setShowMsgAcceptApprovation,
    });
    expect(setters.states()).toMatchObject({ approved: true });
  });
});
