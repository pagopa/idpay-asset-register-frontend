import React, { useEffect, useState } from 'react';
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
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
// import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
// import TitleBox from '@pagopa/selfcare-common-frontend/lib/components/TitleBox';
import { UploadsListDTO } from '../../api/generated/register/UploadsListDTO';
import { UploadDTO } from '../../api/generated/register/UploadDTO';
import { getProductFilesList } from '../../services/registerService';
// import mockDataUploads from '../../mocks/StoricoProdEprel_03072025.json';

function renderUploadStatusChip(status: string) {
  switch (status) {
    case 'IN_PROGRESS':
    case 'UPLOADED':
      return <Chip color="default" label="In carico" />;
    case 'EPREL_ERROR':
      return <Chip color="warning" label="Parziale" />;
    case 'LOADED':
      return <Chip color="success" label="Caricato" />;
    default:
      return <Chip color="default" label={status} />;
  }
}

// const formatDateTime = (isoDate: string): string => {
//   const date = new Date(isoDate);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   return `${day}/${month}/${year} ${hours}:${minutes}`;
// };

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// const UploadInfoBox: React.FC<{
//   loading: boolean;
//   error: string | null;
//   data: UploadsListDTO | null;
//   firstUploadDate?: string;
//   onExit: ReturnType<typeof useUnloadEventOnExit>;
//   t: (key: string) => string;
//   stopNavigation: boolean;
// }> = ({ loading, error, data, firstUploadDate, onExit, t, stopNavigation }) => {
//   const navigate = useNavigate();
//   if (!loading && !error && data?.content && data.content.length > 0 && !stopNavigation) {
//     return (
//       <Box sx={{ gridColumn: 'span 12' }}>
//         <Alert severity="warning" variant="standard">
//           Stiamo effettuando i controlli. Quando saranno completati, ti avviseremo via email e
//           potrai consultare i dettagli nelle sezioni dedicate.
//         </Alert>
//       </Box>
//     );
//   }
//   if (!loading && !error && data?.content && data.content.length > 0 && stopNavigation) {
//     return (
//       <Box sx={{ gridColumn: 'span 12' }}>
//         <Typography variant="body2">
//           Data ultima di caricamento: {firstUploadDate ? formatDateTime(firstUploadDate) : '-'}
//         </Typography>
//         <Button
//           variant="contained"
//           color="primary"
//           sx={{ alignSelf: 'flex-start', mt: 2 }}
//           onClick={() => onExit(() => navigate(ROUTES.ADD_PRODUCTS, { replace: true }))}
//         >
//           {t('pages.overview.overviewTitleBoxProdBtn')}
//         </Button>
//       </Box>
//     );
//   }
//   if (!loading && !error && data?.content && data.content.length === 0 && !stopNavigation) {
//     return (
//       <Box sx={{ gridColumn: 'span 12' }}>
//         <Typography variant="body2">
//           {t('pages.overview.overviewTitleBoxProdDescription')}
//         </Typography>
//         <Button
//           variant="contained"
//           color="primary"
//           sx={{ alignSelf: 'flex-start', mt: 2 }}
//           onClick={() => onExit(() => navigate(ROUTES.ADD_PRODUCTS, { replace: true }))}
//         >
//           {t('pages.overview.overviewTitleBoxProdBtn')}
//         </Button>
//       </Box>
//     );
//   }
//   return null;
// };

const UploadsTable: React.FC<{
  loading: boolean;
  error: string | null;
  data: UploadsListDTO | null;
}> = ({ loading, error, data }) => {
  if (loading) {
    return (
      <Box sx={{ gridColumn: 'span 12', mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ gridColumn: 'span 12', mt: 2 }}>
      {loading && <CircularProgress />}
      {!loading && !error && data?.content && data.content.length > 0 && (
        <>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    sx={{ backgroundColor: 'background.paper', borderBottom: 0, p: 0 }}
                  >
                    Stato Caricamento
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content &&
                  data.content.map((row: UploadDTO) => (
                    <TableRow key={row.productFileId}>
                      <TableCell>{row.batchName}</TableCell>
                      <TableCell>{renderUploadStatusChip(row.uploadStatus ?? '')}</TableCell>
                      <TableCell>{row.dateUpload ? formatDate(row.dateUpload) : '-'}</TableCell>
                      <TableCell>{row.findedProductsNumber}</TableCell>
                      <TableCell>{row.addedProductNumber}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

const OverviewHistoryUpload: React.FC = () => {
  const { t } = useTranslation();
  // const onExit = useUnloadEventOnExit();

  const [data, setData] = useState<UploadsListDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const [stopNavigation, setStopNavigation] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProductFilesList(0, 10)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
        setError(t('errors.uploadsList.errorDescription'));
      });
  }, [t]);

  return (
    <Box
      sx={{
        gridTemplateColumns: 'repeat(12, 1fr)',
        alignItems: 'baseline',
        background: 'background.paper',
        p: 3,
        columnGap: 3,
      }}
    >
      <Box className="-titlebox" sx={{ gridColumn: 'span 12' }}>
        {/*  <TitleBox
          title={t('pages.overview.overviewTitleBoxProdTitle')}
          mbTitle={2}
          variantTitle="h6"
          variantSubTitle="body1"
          data-testid="title-box-prod"
        />
          <UploadInfoBox
          loading={loading}
          error={error}
          data={data}
          firstUploadDate={firstUploadDate}
          onExit={onExit}
          t={t}
          stopNavigation={stopNavigation}
        />
        */}
        <UploadsTable loading={loading} error={error} data={data} />
      </Box>
    </Box>
  );
};

export default OverviewHistoryUpload;
