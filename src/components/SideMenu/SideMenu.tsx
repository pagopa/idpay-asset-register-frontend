import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  ListItemText,
} from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import { useTranslation } from 'react-i18next';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';

import ROUTES from '../../routes';
import { fetchUserFromLocalStorage } from '../../helpers';
import { USERS_TYPES, MOCKED_INITIATIVES_LIST } from '../../utils/constants';
import SidenavItem from './SidenavItem';

const buildRoute = (route: string, initiativeId: string) =>
  route.replace(':initiativeId', initiativeId);

export default function SideMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const onExit = useUnloadEventOnExit();

  const user = useMemo(() => fetchUserFromLocalStorage(), []);

  const isInvitaliaUser = [USERS_TYPES.INVITALIA_L1, USERS_TYPES.INVITALIA_L2].includes(
    user?.org_role as USERS_TYPES
  );

  const [expanded, setExpanded] = useState<string | false>(false);

  const initiativeIdFromUrl = MOCKED_INITIATIVES_LIST.find((initiative) =>
    location.pathname.includes(initiative.initiativeId)
  )?.initiativeId;

  useEffect(() => {
    if (initiativeIdFromUrl) {
      setExpanded(`panel-${initiativeIdFromUrl}`);
    }
  }, [initiativeIdFromUrl]);

  const handleAccordionChange =
    (initiativeId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? `panel-${initiativeId}` : false);
    };

  const handleNavigate = (route: string, initiativeId: string) => {
    const targetRoute = buildRoute(route, initiativeId);

    if (location.pathname === targetRoute) {
      return;
    }

    onExit(() => navigate(targetRoute, { replace: true }));
  };

  return (
    <Box display="grid" mt={1}>
      <Box gridColumn="auto">
        <List data-testid="list-test">
          <SidenavItem
            title={t('pages.initiativesList.title')}
            handleClick={() => onExit(() => navigate(ROUTES.HOME, { replace: true }))}
            isSelected={location.pathname === ROUTES.HOME}
            icon={ListAltIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />

          {MOCKED_INITIATIVES_LIST.map((initiative) => {
            const { initiativeId, initiativeName } = initiative;

            const initiativeOverviewRoute = buildRoute(ROUTES.INITIATIVE_BASE, initiativeId);
            const producersRoute = buildRoute(ROUTES.PRODUCERS, initiativeId);
            const uploadsRoute = buildRoute(ROUTES.UPLOADS, initiativeId);
            const productsRoute = buildRoute(ROUTES.PRODUCTS, initiativeId);

            return (
              <Accordion
                key={initiativeId}
                expanded={expanded === `panel-${initiativeId}`}
                onChange={handleAccordionChange(initiativeId)}
                disableGutters
                elevation={0}
                sx={{
                  border: 'none',
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${initiativeId}-content`}
                  id={`panel-${initiativeId}-header`}
                >
                  <ListItemText
                    primary={initiativeName}
                    sx={{
                      wordBreak: 'break-word',
                    }}
                  />
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <List disablePadding>
                    {isInvitaliaUser && (
                      <SidenavItem
                        title={t('pages.invitaliaProductsList.productsTitle')}
                        handleClick={() => handleNavigate(ROUTES.INITIATIVE_BASE, initiativeId)}
                        isSelected={location.pathname === initiativeOverviewRoute}
                        icon={InventoryIcon}
                        level={2}
                        data-testid={`initiative-products-${initiativeId}`}
                      />
                    )}

                    <SidenavItem
                      title={t(
                        isInvitaliaUser
                          ? 'pages.invitaliaOverview.manufacturerMenuItem'
                          : 'pages.overview.overviewTitle'
                      )}
                      handleClick={() =>
                        handleNavigate(
                          isInvitaliaUser ? ROUTES.PRODUCERS : ROUTES.INITIATIVE_BASE,
                          initiativeId
                        )
                      }
                      isSelected={
                        location.pathname ===
                        (isInvitaliaUser ? producersRoute : initiativeOverviewRoute)
                      }
                      icon={isInvitaliaUser ? BuildIcon : ListAltIcon}
                      level={2}
                      data-testid={`go-to-overview-${initiativeId}`}
                    />

                    {!isInvitaliaUser && (
                      <>
                        <SidenavItem
                          title={t('pages.uploadHistory.sideMenuTitle')}
                          handleClick={() => handleNavigate(ROUTES.UPLOADS, initiativeId)}
                          isSelected={location.pathname === uploadsRoute}
                          icon={HistoryIcon}
                          level={2}
                          data-testid={`initiative-uploads-${initiativeId}`}
                        />

                        <SidenavItem
                          title={t('pages.products.sideMenuTitle')}
                          handleClick={() => handleNavigate(ROUTES.PRODUCTS, initiativeId)}
                          isSelected={location.pathname === productsRoute}
                          icon={InventoryIcon}
                          level={2}
                          data-testid={`initiative-products-list-${initiativeId}`}
                        />
                      </>
                    )}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
