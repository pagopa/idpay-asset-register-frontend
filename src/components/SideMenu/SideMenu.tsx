/* eslint-disable no-prototype-builtins */
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  ListItemText,
} from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ROUTES from '../../routes';
import { fetchUserFromLocalStorage } from '../../helpers';
import { useGetInitiativesQuery } from '../../redux/api/initiativesApi';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import SidenavItem from './SidenavItem';
import { getInitiativeMenuConfig } from './sideMenuConfig';

export const buildRoute = (route: string, initiativeId: string) =>
  route.replace(':initiativeId', initiativeId);

/** The side menu of the application */
export default function SideMenu() {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const onExit = useUnloadEventOnExit();
  const user = useMemo(() => fetchUserFromLocalStorage(), []);

  const selectedConfig = useMemo(() => getInitiativeMenuConfig(user?.org_role), [user?.org_role]);

  const { data: initiatives = [] } = useGetInitiativesQuery();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [pathname, setPathname] = useState(location.pathname);

  useEffect(() => {
    setPathname(location.pathname);
  }, [location.pathname]);

  const routeMatch =
    matchPath(ROUTES.OVERVIEW, location.pathname) ??
    matchPath(ROUTES.ADD_PRODUCTS, location.pathname) ??
    matchPath(ROUTES.ASSISTANCE, location.pathname) ??
    matchPath(ROUTES.PRODUCTS, location.pathname) ??
    matchPath(ROUTES.UPLOADS, location.pathname) ??
    matchPath(ROUTES.INVITALIA_PRODUCTS_LIST, location.pathname) ??
    matchPath(ROUTES.PRODUCERS, location.pathname) ??
    matchPath(ROUTES.UPCOMING, location.pathname);

  const initiativeIdFromRoute =
    routeMatch && typeof routeMatch.params?.initiativeId === 'string'
      ? routeMatch.params.initiativeId
      : undefined;

  useEffect(() => {
    if (initiativeIdFromRoute) {
      setExpanded(`panel-${initiativeIdFromRoute}`);
    }
  }, [initiativeIdFromRoute]);

  useEffect(() => {
    const firstInitiativeId = initiatives[0]?.initiativeId;

    if (!initiativeIdFromRoute && !expanded && firstInitiativeId && initiatives.length === 1) {
      setExpanded(`panel-${firstInitiativeId}`);
    }
  }, [expanded, initiativeIdFromRoute, initiatives]);

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
            title="Iniziative"
            handleClick={() => onExit(() => navigate(ROUTES.HOME, { replace: true }))}
            isSelected={pathname === ROUTES.HOME}
            icon={ListAltIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />

          {initiatives.map((initiative) => {
            const { initiativeId, initiativeName } = initiative;

            if (!initiativeId || !initiativeName) {
              return null;
            }

            const [firstInitiativePage] = selectedConfig;

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
                  onClick={(e) => {
                    e.stopPropagation();

                    onExit(() => {
                      if (firstInitiativePage?.route) {
                        handleNavigate(firstInitiativePage.route, initiativeId);
                      }
                      setExpanded(`panel-${initiativeId}`);
                    });
                  }}
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
                    {selectedConfig.map((item) => {
                      const itemRouteResolved = buildRoute(item.route, initiativeId);

                      const isSelected =
                        pathname === itemRouteResolved ||
                        (item.route === ROUTES.PRODUCERS &&
                          pathname === buildRoute(ROUTES.PRODUCERS, initiativeId));

                      return (
                        <SidenavItem
                          key={`${item.dataTestId}-${initiativeId}`}
                          title={t(item.titleKey)}
                          handleClick={() => handleNavigate(item.route, initiativeId)}
                          isSelected={isSelected}
                          icon={item.icon}
                          level={2}
                          data-testid={`${item.dataTestId}-${initiativeId}`}
                        />
                      );
                    })}
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
