import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/system';
import Paper from '@mui/material/Paper';
import { Table, TableHead, TableBody, TableRow, TableCell, Alert, Typography } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { grey } from '@mui/material/colors';
import { UploadsListDTO } from '../../api/generated/register/UploadsListDTO';
import { getProductFilesList } from '../../services/registerService';
import UploadsTable from '../components/HistoryUploadSection';

const OverviewHistoryUpload: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<UploadsListDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(8);
  const [msgInfoUpload, setMsgInfoUpload] = useState<boolean>(false);

  interface Props {
    description: string;
    dismissFn: () => void;
  }

  const InfoUpload = ({ description }: Props) => (
    <Box sx={{ mb: 2 }}>
      <Paper>
        <Alert severity="info">
          <Typography variant="body2">{description}</Typography>
        </Alert>
      </Paper>
    </Box>
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProductFilesList(page, rowsPerPage)
      .then((res: UploadsListDTO) => {
        setData({
          ...res,
          totalElements: res.totalElements ?? 0,
          content: res.content ?? [],
        });
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
        setError(t('errors.uploadsList.errorDescription'));
      });
  }, [page, rowsPerPage, t]);

  useEffect(() => {
    setMsgInfoUpload(
      !loading &&
        !error &&
        !!data?.content &&
        data.content.length > 0 &&
        data.content[0].uploadStatus === 'UPLOADED'
    );
  }, [loading, error, data]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      {!loading && !error && (
        <Box width="100%" px={2}>
          <TitleBox
            title="Storico Caricamenti"
            subTitle="Visualizza tutti i caricamenti effettuati"
            mbTitle={2}
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
            data-testid="title-overview"
            titleFontSize="42px"
          />

          <Box>
            {msgInfoUpload && (
              <InfoUpload
                description="Stiamo elaborando il file. Ti avviseremo via e-mail quando l&#39;elaborazione sarà completata
            e potrai consultare i dati direttamente in questa sezione."
                dismissFn={() => {}}
              />
            )}

            <UploadsTable
              loading={loading}
              error={error}
              data={data}
              page={page}
              rowsPerPage={rowsPerPage}
              totalElements={data?.totalElements ?? 0}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
          {/* Sezione Footer     */}
          <Paper
            sx={{
              width: '100%',
              mb: 2,
              pb: 3,
              backgroundColor: grey.A100,
            }}
          />
        </Box>
      )}
      {error && (
        <Box width="100%" px={2}>
          <TitleBox
            title="Storico Caricamenti"
            subTitle="Visualizza tutti i caricamenti effettuati"
            mbTitle={2}
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
            data-testid="title-overview"
            titleFontSize="42px"
          />

          <Box>
            <Table>
              <TableHead>
                <TableRow></TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    sx={{
                      backgroundColor: 'background.paper',
                      borderBottom: 0,
                      p: 2,
                      textAlign: 'center',
                    }}
                  >
                    {'Non ci sono file caricati.'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
          {/* Sezione Footer     */}
          <Paper
            sx={{
              width: '100%',
              mb: 2,
              pb: 3,
              backgroundColor: grey.A100,
            }}
          />
        </Box>
      )}
    </>
  );
};

export default OverviewHistoryUpload;
