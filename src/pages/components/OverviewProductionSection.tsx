import React, { useEffect, useState, Dispatch } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import TitleBox from '@pagopa/selfcare-common-frontend/lib/components/TitleBox';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@mui/material';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ROUTES from '../../routes';
import { UploadsListDTO } from '../../api/generated/register/UploadsListDTO';
import { UploadDTO } from '../../api/generated/register/UploadDTO';
import { RegisterApi } from '../../api/registerApiClient';
// import mockDataUploads from '../../mocks/StoricoProdEprel_01072025.json';

const getHistoryUploads = (
  dispatch: Dispatch<any>,
  addError: (error: { title: string; description: string; error: unknown }) => void,
  t: (key: string) => string
) => {
  const params = {
    page: 1,
    size: 4,
    totalElements: 4,
    totalPages: 1,
  };

  RegisterApi.getProductFiles(params)
    .then((res: UploadsListDTO) => {
      dispatch({ type: 'SET_UPLOADS_LIST', payload: res });
    })
    .catch((error: unknown) => {
      addError({
        title: t('errors.uploadsList.errorTitle'),
        description: t('errors.uploadsList.errorDescription'),
        error,
      });
    });
};

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

const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const UploadInfoBox: React.FC<{
  loading: boolean;
  error: string | null;
  data: UploadsListDTO | null;
  firstUploadDate?: string;
  onExit: ReturnType<typeof useUnloadEventOnExit>;
  t: (key: string) => string;
  stopNavigation: boolean;
}> = ({ loading, error, data, firstUploadDate, onExit, t, stopNavigation }) => {
  const navigate = useNavigate();
  if (!loading && !error && data?.content && data.content.length > 0 && !stopNavigation) {
    return (
      <Box sx={{ gridColumn: 'span 12' }}>
        <Alert severity="warning" variant="standard">
          Stiamo effettuando i controlli. Quando saranno completati, ti avviseremo via email e
          potrai consultare i dettagli nelle sezioni dedicate.
        </Alert>
      </Box>
    );
  }
  if (!loading && !error && data?.content && data.content.length > 0 && stopNavigation) {
    return (
      <Box sx={{ gridColumn: 'span 12' }}>
        <Typography variant="body2">
          Data ultima di caricamento: {firstUploadDate ? formatDateTime(firstUploadDate) : '-'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ alignSelf: 'flex-start', mt: 2 }}
          onClick={() => onExit(() => navigate(ROUTES.ADD_PRODUCTS, { replace: true }))}
        >
          {t('pages.overview.overviewTitleBoxProdBtn')}
        </Button>
      </Box>
    );
  }
  if (!loading && !error && data?.content && data.content.length === 0 && !stopNavigation) {
    return (
      <Box sx={{ gridColumn: 'span 12' }}>
        <Typography variant="body2">
          {t('pages.overview.overviewTitleBoxProdDescription')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ alignSelf: 'flex-start', mt: 2 }}
          onClick={() => onExit(() => (ROUTES.ADD_PRODUCTS, { replace: true }))}
        >
          {t('pages.overview.overviewTitleBoxProdBtn')}
        </Button>
      </Box>
    );
  }
  return null;
};

const UploadsTable: React.FC<{
  loading: boolean;
  error: string | null;
  data: UploadsListDTO | null;
}> = ({ loading, error, data }) => {
  const navigate = useNavigate();
  const onExit = useUnloadEventOnExit();

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
                    <Typography
                      variant="overline"
                      sx={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        fontWeight: 700,
                        letterSpacing: 1,
                      }}
                    >
                      STATO CARICAMENTI
                    </Typography>
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
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <ButtonNaked
            color="primary"
            endIcon={<ArrowForwardIosIcon />}
            size="medium"
            onClick={() => onExit(() => navigate(ROUTES.UPLOADS, { replace: true }))}
          >
            <b>Vedi i caricamenti</b>
          </ButtonNaked>
        </>
      )}
    </Box>
  );
};

const OverviewProductionSection: React.FC = () => {
  const { t } = useTranslation();
  const onExit = useUnloadEventOnExit();

  const [data, setData] = useState<UploadsListDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stopNavigation, setStopNavigation] = useState<boolean>(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Simulating data fetch with mock data
    // setData(mockDataUploads as UploadsListDTO);
    setData(getHistoryUploads);
    setLoading(false);
  }, []);

  const firstUploadDate =
    !loading && !error && data?.content && data.content.length > 0
      ? data.content[0].dateUpload
      : undefined;

  useEffect(() => {
    setStopNavigation(
      !loading && !error && data?.content && data.content.length > 0
        ? data.content[0].uploadStatus !== 'In corso'
        : false
    );
  }, [loading, error, data]);

  return (
    <Box sx={{ gridColumn: 'span 6' }}>
      <Paper
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          alignItems: 'baseline',
          background: 'background.paper',
          p: 3,
          columnGap: 3,
        }}
      >
        {/* TitleBox fisso */}
        <Box className="-titlebox" sx={{ gridColumn: 'span 12' }}>
          <TitleBox
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
          <UploadsTable loading={loading} error={error} data={data} />
        </Box>
      </Paper>
    </Box>
  );
};

export default OverviewProductionSection;
