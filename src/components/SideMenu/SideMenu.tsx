import { List, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import { useTranslation } from 'react-i18next';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';
import { useMemo } from 'react';
import ROUTES from '../../routes';
import { fetchUserFromLocalStorage } from '../../helpers';
import {USERS_TYPES} from '../../utils/constants';
import SidenavItem from './SidenavItem';

/** The side menu of the application */
export default function SideMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onExit = useUnloadEventOnExit();
  const location = useLocation();
  const user = useMemo(() => fetchUserFromLocalStorage(), []);
  const isInvitaliaUser = [ USERS_TYPES.INVITALIA_L1, USERS_TYPES.INVITALIA_L2 ].includes(user?.org_role as USERS_TYPES);

  return (
    <Box display="grid" mt={1}>
      <Box gridColumn="auto">
        <List data-testid="list-test">
          {isInvitaliaUser && (
            <>
              <SidenavItem
                title={t('pages.invitaliaProductsList.productsTitle')}
                handleClick={() =>
                  onExit(() => navigate(ROUTES.HOME, { replace: true }))
                }
                isSelected={location.pathname === ROUTES.HOME}
                icon={InventoryIcon}
                level={0}
                data-testid="initiativeList-click-test"
              />
            </>
          )}
          <SidenavItem
            title={t(
              isInvitaliaUser
                ? 'pages.invitaliaOverview.manufacturerMenuItem'
                : 'pages.overview.overviewTitle'
            )}
            handleClick={() => onExit(() => navigate(isInvitaliaUser ? ROUTES.PRODUCERS : ROUTES.HOME, { replace: true }))}
            isSelected={location.pathname === (isInvitaliaUser ? ROUTES.PRODUCERS : ROUTES.HOME)}
            icon={isInvitaliaUser ? BuildIcon : ListAltIcon}
            level={0}
            data-testid="go-to-home"
          />
          {!isInvitaliaUser && (
            <>
              <SidenavItem
                title={t('pages.uploadHistory.sideMenuTitle')}
                handleClick={() => onExit(() => navigate(ROUTES.UPLOADS, { replace: true }))}
                isSelected={location.pathname === ROUTES.UPLOADS}
                icon={HistoryIcon}
                level={0}
                data-testid="initiativeList-click-test"
              />
              <SidenavItem
                title={t('pages.products.sideMenuTitle')}
                handleClick={() => onExit(() => navigate(ROUTES.PRODUCTS, { replace: true }))}
                isSelected={location.pathname === ROUTES.PRODUCTS}
                icon={InventoryIcon}
                level={0}
                data-testid="initiativeList-click-test"
              />
            </>
          )}
        </List>
      </Box>
    </Box>
  );
}
