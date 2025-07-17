import { TableHead, TableRow, TableCell, TableSortLabel, Box } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { grey } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { EnhancedTableProps, HeadCell } from './helpers';

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof ProductDTO) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  const { t } = useTranslation();

  const headCells: ReadonlyArray<HeadCell> = [
    {
      id: 'category',
      numeric: false,
      disablePadding: false,
      textAlign: 'center',
      label: `${t('pages.products.listHeader.category')}`,
    },
    {
      id: 'energyClass',
      numeric: false,
      disablePadding: false,
      textAlign: 'center',
      label: `${t('pages.products.listHeader.energeticClass')}`,
    },
    {
      id: 'eprelCode',
      numeric: false,
      disablePadding: false,
      textAlign: 'center',
      label: `${t('pages.products.listHeader.eprelCode')}`,
    },
    {
      id: 'gtinCode',
      numeric: false,
      disablePadding: false,
      textAlign: 'center',
      label: `${t('pages.products.listHeader.gtinCode')}`,
    },
    {
      id: 'batchName',
      numeric: false,
      disablePadding: false,
      textAlign: 'centlefter',
      label: `${t('pages.products.listHeader.batch')}`,
    },
  ];

  return (
    <TableHead sx={{ backgroundColor: grey?.A100 }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell?.id}
            align={headCell?.textAlign ? headCell?.textAlign : 'left'}
            padding="normal"
            // sortDirection={orderBy === headCell?.id ? order : false}
            sortDirection={false}
          >
            <TableSortLabel
              active={orderBy === headCell?.id}
              direction={orderBy === headCell?.id ? order : 'asc'}
              onClick={createSortHandler(headCell?.id)}
              hideSortIcon={true}
              // disabled={headCell.id === 'energyClass' || headCell.id === 'eprelCode'}
            >
              {headCell?.label}
              {orderBy === headCell?.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default EnhancedTableHead;
