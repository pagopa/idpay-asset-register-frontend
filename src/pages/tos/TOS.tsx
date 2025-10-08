import { useState } from 'react';
import routes from '../../routes';
import { ENV } from '../../utils/env';
import { useOneTrustNotice } from '../../hooks/useOneTrustNotice';
import OneTrustContentWrapper from '../components/OneTrustContentWrapper';

declare const OneTrust: any;

const TOS = () => {
  const [contentLoaded, setContentLoaded] = useState(false);

  useOneTrustNotice(ENV.ONE_TRUST.TOS_JSON_URL, contentLoaded, setContentLoaded, routes.TOS);

  return <OneTrustContentWrapper idSelector={ENV.ONE_TRUST.TOS_ID} />;
};

export default TOS;
