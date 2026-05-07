import React, { useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { Box } from '@mui/system';
import Paper from '@mui/material/Paper';
import { Table, TableHead, TableBody, TableRow, TableCell, Alert, Typography } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { grey } from '@mui/material/colors';
import CachedIcon from '@mui/icons-material/Cached';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { UploadsListDTO } from '../../api/generated/register';
import { getProductFilesList } from '../../services/registerService';
import UploadsTable from '../components/HistoryUploadSection';

const OverviewHistoryUpload: React.FC = () => {
  const { t } = useScopedTranslation();
  const [data, setData] = useState<UploadsListDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(8);

  interface Props {
    description: string;
    dismissFn: () => void;
  }

  const InfoUpload = ({ description }: Props) => (
    <Box sx={{ mb: 2 }}>
      <Paper sx={{ backgroundColor: '#fff' }}>
        <Alert severity="info" icon={<CachedIcon color="info" />} sx={{ backgroundColor: '#fff' }}>
          <Typography variant="body2">{description}</Typography>
        </Alert>
      </Paper>
    </Box>
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProductFilesList(page, rowsPerPage)
      .then((res: AxiosResponse<UploadsListDTO>) => {
        setData({
          ...res.data,
          totalElements: res.data.totalElements,
          content: res.data.content ?? [],
        });
      })
      .catch(() => {
        setData(null);
        setError(t('errors.uploadsList.errorDescription'));
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      {!error ? (
        <Box width="100%" px={2} data-testid="title-overview">
          <TitleBox
            title={t('pages.uploadHistory.sideMenuTitle')}
            subTitle={t('pages.uploadHistory.uploadHistorySubTitle')}
            mbTitle={2}
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
            titleFontSize="42px"
          />

          <Box>
            {!loading && data?.content?.[0]?.uploadStatus === 'UPLOADED' && (
              <InfoUpload
                description={t('pages.uploadHistory.uploadHistoryAlertMessage')}
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
      ) : (
        <Box width="100%" px={2} data-testid="title-overview">
          <TitleBox
            title={t('pages.uploadHistory.sideMenuTitle')}
            subTitle={t('pages.uploadHistory.uploadHistorySubTitle')}
            mbTitle={2}
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
            titleFontSize="42px"
          />

          <Box data-testid="uploads-table">
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
                    {t('pages.uploadHistory.uploadHistoryNoFilesUploaded')}
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
