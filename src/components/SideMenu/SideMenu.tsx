import {
  List,
  Box
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import { useTranslation } from 'react-i18next';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ROUTES from '../../routes';
import SidenavItem from './SidenavItem';

/** The side menu of the application */
export default function SideMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onExit = useUnloadEventOnExit();
  const location = useLocation();

  return (
    <Box display="grid" mt={1}>
      <Box gridColumn="auto">
        <List data-testid="list-test">
          <SidenavItem
            title={t('pages.panoramica.title')}
            handleClick={() => onExit(() => navigate(ROUTES.HOME, { replace: true }))}
            isSelected={location.pathname === ROUTES.HOME}
            icon={ListAltIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />
        </List>
      </Box>
    </Box>
  );
}
