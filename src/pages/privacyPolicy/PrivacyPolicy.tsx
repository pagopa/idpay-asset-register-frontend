import { useState } from 'react';
import { ENV } from '../../utils/env';
import { useOneTrustNotice } from '../../hooks/useOneTrustNotice';

import routes from '../../routes';
import OneTrustContentWrapper from '../components/OneTrustContentWrapper';

const PrivacyPolicy = () => {
  const [contentLoaded, setContentLoaded] = useState(false);

  useOneTrustNotice(
    ENV.ONE_TRUST.PRIVACY_POLICY_JSON_URL,
    contentLoaded,
    setContentLoaded,
    routes.PRIVACY_POLICY
  );

  return <OneTrustContentWrapper idSelector={ENV.ONE_TRUST.PRIVACY_POLICY_ID} />;
};

export default PrivacyPolicy;
