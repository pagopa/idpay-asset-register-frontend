import { useState } from 'react';

const useTCAgreement = () => {
  const [firstAcceptance, ] = useState<boolean | undefined>(false);
/*  useEffect(() => {
    getPortalConsent()
      .then((res) => {
        if (Object.keys(res).length) {
          setAcceptedTOSVersion(res.versionId);
          setFirstAcceptance(res.firstAcceptance);
          setAcceptedTOS(false);
        } else {
          setAcceptedTOS(true);
        }
      })
      .catch((error) => {
        setAcceptedTOS(false);
        addError({
          id: 'GET_TERMS_AND_CONDITION_ACCEPTANCE',
          blocking: false,
          error,
          techDescription: 'An error occurred getting terms and conditions acceptance',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.tcDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });
  }, []); */

  const acceptTOS = () => {
    /* savePortalConsent(acceptedTOSVersion)
      .then((_res) => {
        setAcceptedTOS(true);
      })
      .catch((error) => {
        setAcceptedTOS(false);
        addError({
          id: 'SAVE_TERMS_AND_CONDITION_ACCEPTANCE',
          blocking: false,
          error,
          techDescription: 'An error occurred saving terms and conditions acceptance',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.tcSave'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      }); */
  };

  /* TODO CONFIGURE acceptedTOS:  return { isTOSAccepted: acceptedTOS, acceptTOS, firstAcceptance }; --- acceptedTOS: FORZATO A TRUE */
  return { isTOSAccepted: true, acceptTOS, firstAcceptance };
};

export default useTCAgreement;
