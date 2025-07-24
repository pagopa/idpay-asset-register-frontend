import React, { useEffect, useState } from 'react';
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
  Chip,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import TitleBox from '@pagopa/selfcare-common-frontend/lib/components/TitleBox';
import { useNavigate } from 'react-router-dom';
import { ButtonNaked } from '@pagopa/mui-italia';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { ArrowForward } from '@mui/icons-material';
import ROUTES from '../../routes';
import { getProductFilesList } from '../../services/registerService';
import { emptyData } from '../../utils/constants';
import {UploadDTO} from "../../api/generated/register/UploadDTO";
import {UploadsListDTO} from "../../api/generated/register/UploadsListDTO";

function renderUploadStatusChip(status: string) {
  switch (status) {
    case 'IN_PROCESS':
    case 'UPLOADED':
      return <Chip color="default" label="In corso" size="small" />;
    case 'PARTIAL':
      return <Chip color="warning" label="Parziale" size="small" />;
    case 'LOADED':
      return <Chip color="success" label="Caricato" size="small" />;
    default:
      return <Chip color="default" label={status} size="small" />;
  }
}

const formatDateTime = (date: Date): string => {
  const optionsDate: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const formattedDate = new Intl.DateTimeFormat('it-IT', optionsDate).format(date);
  const formattedTime = new Intl.DateTimeFormat('it-IT', optionsTime).format(date);

  return `${formattedDate}, ${formattedTime}`;
};

const formatDate = (isoDate: Date): string => {
  const day = String(isoDate.getDate()).padStart(2, '0');
  const month = String(isoDate.getMonth() + 1).padStart(2, '0');
  const year = isoDate.getFullYear();
  return `${day}/${month}/${year}`;
};

const UploadInfoBox: React.FC<{
  loading: boolean;
  error: string | null;
  data: UploadsListDTO | null;
  firstUploadDate?: Date;
  onExit: ReturnType<typeof useUnloadEventOnExit>;
  t: (key: string) => string;
  stopNavigation: boolean;
}> = ({ loading, error, data, firstUploadDate, onExit, t, stopNavigation }) => {
  const navigate = useNavigate();

  if (
    !loading &&
    !error &&
    data?.content &&
    data.content.length > 0 &&
    data.content[0].uploadStatus !== 'IN_PROCESS' &&
    data.content[0].uploadStatus !== 'UPLOADED'
  ) {
    return (
      <Box sx={{ gridColumn: 'span 12', mb: 3 }}>
        <Typography variant="body2">
          Ultimo caricamento <b>{firstUploadDate ? formatDateTime(firstUploadDate) : emptyData}</b>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileUploadIcon />}
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
          startIcon={<FileUploadIcon />}
          sx={{ alignSelf: 'flex-start', mt: 2 }}
          onClick={() => onExit(() => navigate(ROUTES.ADD_PRODUCTS, { replace: true }))}
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
  stopNavigation: boolean;
}> = ({ loading, error, data, stopNavigation }) => {
  const navigate = useNavigate();
  const onExit = useUnloadEventOnExit();
  const { t } = useTranslation();
  const [rowsPerPage] = useState<number>(4);

  return (
    <Box sx={{ gridColumn: 'span 12', mt: 2 }}>
      {loading && <CircularProgress />}
      {!loading && !error && data?.content && data.content.length > 0 && (
        <>
          <Divider />
          <TableContainer component={Paper} elevation={0} sx={{ paddingTop: 3 }}>
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
                        mb: 2,
                      }}
                    >
                      STATO CARICAMENTI
                    </Typography>
                    {!loading &&
                      data?.content?.[0]?.uploadStatus === 'UPLOADED' &&
                      !stopNavigation && (
                        <Box sx={{ mb: 2 }}>
                          <Paper>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                Stiamo effettuando i controlli. Quando saranno completati, ti
                                avviseremo via email e potrai consultare i dettagli nelle sezioni
                                dedicate.
                              </Typography>
                            </Alert>
                          </Paper>
                        </Box>
                      )}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content &&
                  data.content.slice(0, rowsPerPage).map((row: UploadDTO) => (
                    <TableRow key={row.productFileId}>
                      <TableCell sx={{ padding: 0 }}>{row.batchName}</TableCell>
                      <TableCell>{renderUploadStatusChip(row.uploadStatus ?? emptyData)}</TableCell>
                      <TableCell>
                        {row.dateUpload ? formatDate(row.dateUpload) : emptyData}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <ButtonNaked
            color="primary"
            endIcon={<ArrowForward />}
            size="medium"
            onClick={() => onExit(() => navigate(ROUTES.UPLOADS, { replace: true }))}
            sx={{ paddingTop: 2 }}
          >
            <b>Vedi i caricamenti</b>
          </ButtonNaked>
        </>
      )}

      {!loading && error && (
        <Box sx={{ gridColumn: 'span 12' }}>
          <Typography variant="body2">
            {t('pages.overview.overviewTitleBoxProdDescription')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ alignSelf: 'flex-start', mt: 2 }}
            disabled
          >
            {t('pages.overview.overviewTitleBoxProdBtn')}
          </Button>
        </Box>
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
  const [error, setError] = useState<string | null>(null);
  const [rowsPerPage] = useState<number>(4);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProductFilesList(0, rowsPerPage)
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

  const firstUploadDate =
    !loading && !error && data?.content && data.content.length > 0
      ? data.content[0].dateUpload
      : undefined;

  useEffect(() => {
    setStopNavigation(
      !loading && !error && data?.content && data.content.length > 0
        ? data.content[0].uploadStatus === 'UPLOADED'
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
          <UploadsTable loading={loading} error={error} data={data} stopNavigation={false} />
        </Box>
      </Paper>
    </Box>
  );
};

export default OverviewProductionSection;
