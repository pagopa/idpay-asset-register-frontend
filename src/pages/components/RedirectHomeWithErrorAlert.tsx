import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import routes from '../../routes';
import MsgResult from '../../components/Product/MsgResult';

const RedirectHomeWithErrorAlert = () => {
  const { t } = useTranslation();
  const message = t('pages.addProducts.form.fileUpload.fileUploadError.errorDescription');

  const [shouldRedirect, setShouldRedirect] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const tmr = setTimeout(() => setShouldRedirect(true), 2000);
    return () => clearTimeout(tmr);
  }, [location.key]);

  if (shouldRedirect) {
    return <Navigate to={routes.HOME} replace />;
  }

  return <MsgResult severity="error" message={message} />;
};

export default RedirectHomeWithErrorAlert;
