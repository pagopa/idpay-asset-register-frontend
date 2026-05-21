import { useEffect, useState } from 'react';
import { getInstitutionsList, getBatchFilterList } from '../../../services/registerService';
import { Institution } from '../../../model/Institution';
import { BatchFilterItems } from '../helpers';
import { DEBUG_CONSOLE } from '../../../utils/constants';

type Props = {
  initiativeId: string;
  organizationId: string;
  isInvitaliaUser: boolean;
  isInvitaliaAdmin: boolean;
  institutionId?: string;
  producerFilter: string;
  setProducerFilter: (v: string) => void;
  setStatusFilter: (v: string) => void;
  dispatch: any;
  setInstitutionList: (v: Array<Institution>) => any;
};

export const useProductDataGridInit = ({
  initiativeId,
  organizationId,
  isInvitaliaUser,
  isInvitaliaAdmin,
  institutionId,
  producerFilter,
  setProducerFilter,
  setStatusFilter,
  dispatch,
  setInstitutionList,
}: Props) => {
  const [batchFilterItems, setBatchFilterItems] = useState<Array<BatchFilterItems>>([]);
  const [adminDefaultApplied, setAdminDefaultApplied] = useState(false);

  const fetchInstitutions = async () => {
    try {
      const institutionsData = await getInstitutionsList();
      dispatch(
        setInstitutionList((institutionsData.data.institutions ?? []) as Array<Institution>)
      );
    } catch (error) {
      if (DEBUG_CONSOLE) {
        console.error('Error fetching institutions:', error);
      }
    }
  };

  useEffect(() => {
    if ((isInvitaliaUser || isInvitaliaAdmin) && institutionId) {
      setProducerFilter(institutionId);
    }
  }, [isInvitaliaUser, isInvitaliaAdmin, institutionId]);

  useEffect(() => {
    if (isInvitaliaAdmin && !adminDefaultApplied) {
      setStatusFilter('Da approvare');
      setAdminDefaultApplied(true);
    }

    if (isInvitaliaAdmin || isInvitaliaUser) {
      void fetchInstitutions();
    }

    const targetId = isInvitaliaUser ? producerFilter || institutionId || '' : organizationId;

    void getBatchFilterList(initiativeId, targetId)
      .then((res) => {
        setBatchFilterItems(res.data as unknown as Array<BatchFilterItems>);
      })
      .catch(() => {
        setBatchFilterItems([]);
      });
  }, [
    isInvitaliaUser,
    isInvitaliaAdmin,
    producerFilter,
    institutionId,
    organizationId,
    initiativeId,
  ]);

  return {
    batchFilterItems,
  };
};
