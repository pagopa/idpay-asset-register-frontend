import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  CircularProgress,
  TablePagination,
  Typography,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import { grey } from '@mui/material/colors';
import CachedIcon from '@mui/icons-material/Cached';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { UploadsListDTO } from '../../api/generated/register/UploadsListDTO';
import { UploadDTO } from '../../api/generated/register/UploadDTO';
import { downloadErrorReport } from '../../services/registerService';
import { downloadCsv } from '../addProducts/helpers';
import { formatDateWithHours } from '../../helpers';
import { usePagination } from '../../hooks/usePagination';
import { setBatchId, setBatchName } from '../../redux/slices/productsSlice';
import ROUTES from '../../routes';
import { emptyData } from '../../utils/constants';
import EmptyListTable from './EmptyListTable';

const rowTableStyle = {
  height: '53px',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: grey[200],
  },
};

const rowBaseCell = {
  borderBottom: `1px solid ${grey[300]}`,
  padding: '0px',
};

const styleLeftRow = {
  ...rowBaseCell,
  textAlign: 'left',
  width: '10px',
};

const styleRightRow = {
  ...rowBaseCell,
  textAlign: 'right',
  width: '15%',
};

function renderUploadStatusIcon(status: string) {
  switch (status) {
    case 'IN_PROGRESS':
    case 'UPLOADED':
      return <CachedIcon color="disabled" />;
    case 'EPREL_ERROR':
      return <WarningIcon color="warning" />;
    case 'LOADED':
      return <CheckCircleIcon color="success" />;
    default:
      return <WarningIcon color="warning" />;
  }
}

type UploadsTableProps = {
  loading: boolean;
  error: string | null;
  data: UploadsListDTO | null;
  page: number;
  rowsPerPage: number;
  totalElements: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const UploadsTable: React.FC<UploadsTableProps> = ({
  loading,
  error,
  data,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const paginationInfo = usePagination(page, rowsPerPage, totalElements);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleDownloadReport = async (idReport: string) => {
    try {
      const res = await downloadErrorReport(idReport);
      downloadCsv(res.data, res.filename);
    } catch (error) {
      console.error('Errore nel download del report:', error);
    }
  };

  const handleLinkProducts = (batchName: string, productFileId: string) => {
    dispatch(setBatchName(batchName));
    dispatch(setBatchId(productFileId));
    navigate(ROUTES.PRODUCTS, { replace: true });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return data?.content && data.content.length > 0 ? (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        height: '70%',
        gap: '24px',
        borderRadius: '4px',
        pt: '24px',
        pr: '24px',
        pl: '24px',
        cursor: 'pointer',
      }}
      data-testid="uploads-table"
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              colSpan={3}
              sx={{ backgroundColor: 'background.paper', borderBottom: 0, p: 0 }}
            >
              <TitleBox
                title={t('pages.uploadHistory.uploadHistoryTitle')}
                mbTitle={2}
                mtTitle={2}
                mbSubTitle={5}
                variantTitle="h6"
                variantSubTitle="body1"
                data-testid="title-overview"
                titleFontSize="32px"
              />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.content.map((row: UploadDTO) => (
            <TableRow key={row.productFileId} sx={rowTableStyle} hover>
              <TableCell sx={styleLeftRow}>
                {renderUploadStatusIcon(row.uploadStatus ?? '')}
              </TableCell>
              <TableCell
                sx={{
                  ...rowBaseCell,
                  fontWeight: 600,
                  alignContent: 'center',
                }}
              >
                {row.batchName}
              </TableCell>
              <TableCell sx={rowBaseCell}>
                {row.dateUpload ? formatDateWithHours(row.dateUpload) : emptyData}
              </TableCell>
              <TableCell sx={rowBaseCell}>
                <b>
                  {row.findedProductsNumber ?? 0}{' '}
                  {t('pages.uploadHistory.uploadHistoryFoundProducts')}
                </b>
              </TableCell>
              <TableCell sx={rowBaseCell}>
                <span
                  style={{
                    color: '#0073E6',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                  }}
                  onClick={() => handleLinkProducts(row?.batchName || '', row?.productFileId || '')}
                >
                  {row.addedProductNumber ?? 0}{' '}
                  {t('pages.uploadHistory.uploadHistoryAddedProducts')}
                </span>
              </TableCell>
              <TableCell align="right" sx={styleRightRow}>
                {row.uploadStatus === 'PARTIAL' && (
                  <DownloadIcon
                    color="primary"
                    sx={{ verticalAlign: 'middle' }}
                    onClick={() => handleDownloadReport(row?.productFileId?.toString() || '')}
                    data-testid="download-icon"
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[rowsPerPage]}
        labelRowsPerPage={t('pages.uploadHistory.uploadHistoryRowsPerPage')}
        labelDisplayedRows={() =>
          `${paginationInfo.from} - ${paginationInfo.to} ${t(
            'pages.products.tablePaginationFrom'
          )} ${paginationInfo.total}`
        }
      />
    </TableContainer>
  ) : (
    <EmptyListTable message="pages.uploadHistory.uploadHistoryNoFilesUploaded" />
  );
};

export default UploadsTable;
