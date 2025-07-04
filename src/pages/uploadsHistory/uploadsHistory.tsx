import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/system';
import Paper from '@mui/material/Paper';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { grey } from '@mui/material/colors';
import UploadsTable from '../components/OverviewHistoryUpload';
import { UploadsListDTO } from '../../api/generated/register/UploadsListDTO';
import { getProductFilesList } from '../../services/registerService';

const OverviewHistoryUpload: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<UploadsListDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
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
  );
};

export default OverviewHistoryUpload;
