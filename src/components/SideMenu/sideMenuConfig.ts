import BuildIcon from '@mui/icons-material/Build';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import type { SvgIconComponent } from '@mui/icons-material';
import ROUTES from '../../routes';

export type SideMenuConfigItem = {
  titleKey: string;
  route: string;
  icon: SvgIconComponent;
  dataTestId: string;
};

export const initiativeMenuConfig: Array<SideMenuConfigItem> = [
  {
    titleKey: 'pages.overview.overviewTitle',
    route: ROUTES.OVERVIEW,
    icon: ListAltIcon,
    dataTestId: 'go-to-overview',
  },
  {
    titleKey: 'pages.uploadHistory.sideMenuTitle',
    route: ROUTES.UPLOADS,
    icon: HistoryIcon,
    dataTestId: 'initiative-uploads',
  },
  {
    titleKey: 'pages.products.sideMenuTitle',
    route: ROUTES.PRODUCTS,
    icon: InventoryIcon,
    dataTestId: 'initiative-products-list',
  },
];

export const invitaliaInitiativeMenuConfig: Array<SideMenuConfigItem> = [
  {
    titleKey: 'pages.invitaliaProductsList.productsTitle',
    route: ROUTES.INVITALIA_PRODUCTS_LIST,
    icon: InventoryIcon,
    dataTestId: 'initiative-products',
  },
  {
    titleKey: 'pages.invitaliaOverview.manufacturerMenuItem',
    route: ROUTES.PRODUCERS,
    icon: BuildIcon,
    dataTestId: 'go-to-overview',
  },
];
