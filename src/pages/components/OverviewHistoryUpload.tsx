import React from 'react';
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
import Link from '@mui/material/Link';
import { grey } from '@mui/material/colors';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { UploadsListDTO } from '../../api/generated/register/UploadsListDTO';
import { UploadDTO } from '../../api/generated/register/UploadDTO';

function renderUploadStatusIcon(status: string) {
  switch (status) {
    case 'IN_PROGRESS':
    case 'UPLOADED':
    case 'EPREL_ERROR':
      return <WarningIcon color="warning" />;
    case 'LOADED':
      return <CheckCircleIcon color="success" />;
    default:
      return <WarningIcon color="warning" />;
  }
}

const formatDate = (isoDate: string): string => {
  if (!isoDate) {
    return '-';
  }
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

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
  const { t } = useTranslation();

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

  return (
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
    >
      <Table>
        <TableHead>
          <TableCell
            colSpan={3}
            sx={{ backgroundColor: 'background.paper', borderBottom: 0, p: 0 }}
          >
            <TitleBox
              title="Stato Caricamento"
              mbTitle={2}
              mtTitle={2}
              mbSubTitle={5}
              variantTitle="h6"
              variantSubTitle="body1"
              data-testid="title-overview"
              titleFontSize="32px"
            />
          </TableCell>
        </TableHead>
        <TableBody>
          {data?.content && data.content.length > 0 ? (
            data.content.map((row: UploadDTO) => (
              <TableRow key={row.productFileId}>
                <TableCell
                  sx={{
                    borderBottom: `1px solid ${grey[300]}`,
                    width: '10px',
                    paddingRight: '0px',
                  }}
                >
                  {renderUploadStatusIcon(row.uploadStatus ?? '')}
                </TableCell>
                <TableCell sx={{ borderBottom: `1px solid ${grey[300]}` }}>
                  {row.batchName}
                </TableCell>
                <TableCell sx={{ borderBottom: `1px solid ${grey[300]}` }}>
                  {row.dateUpload ? formatDate(row.dateUpload) : '-'}
                </TableCell>
                <TableCell sx={{ borderBottom: `1px solid ${grey[300]}` }}>
                  <b>{row.findedProductsNumber} prodotti trovati</b>
                </TableCell>
                <TableCell sx={{ borderBottom: `1px solid ${grey[300]}` }}>
                  <Link href={``} underline="hover" color="primary" sx={{ fontWeight: 'bold' }}>
                    <u> {row.addedProductNumber} prodotti aggiunti</u>
                  </Link>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ borderBottom: `1px solid ${grey[300]}`, width: '15%' }}
                >
                  {(row.uploadStatus === 'IN_PROGRESS' ||
                    row.uploadStatus === 'UPLOADED' ||
                    row.uploadStatus === 'EPREL_ERROR') && (
                    <DownloadIcon color="primary" sx={{ verticalAlign: 'middle' }} />
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {t('Non ci sono file caricati')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[8]}
        labelRowsPerPage={t('Righe per pagina')}
      />
    </TableContainer>
  );
};

export default UploadsTable;
