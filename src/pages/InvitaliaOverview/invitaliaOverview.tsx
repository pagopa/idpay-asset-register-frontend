import React, { useEffect, useState, useMemo } from 'react';
import { Box, InputAdornment, TextField } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { Search } from '@mui/icons-material';
import DetailDrawer from '../../components/DetailDrawer/DetailDrawer';
import { getInstitutionsList, getInstitutionById } from '../../services/registerService';
import { InstitutionsResponse } from '../../api/generated/register/InstitutionsResponse';
import { InstitutionResponse } from '../../api/generated/register/InstitutionResponse';
import { Order } from '../../components/Product/helpers';
import { Institution } from '../../model/Institution';
import { setInstitutionList } from '../../redux/slices/invitaliaSlice';
import { useAppDispatch } from '../../redux/hooks';
import {fetchUserFromLocalStorage} from "../../helpers";
import InstitutionsTable from './institutionsTable';
import { sortInstitutions } from './helpers';
import ManufacturerDetail from './ManufacturerDetail';

const InvitaliaOverview: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [institutions, setInstitutions] = useState<InstitutionsResponse>({
    institutions: [],
  });
  const [institutionData, setInstitutionData] = useState<InstitutionResponse>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Institution>('description');
  const user = useMemo(() => fetchUserFromLocalStorage(), []);

  useEffect(() => {
    void fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const institutionsData = await getInstitutionsList();
      setInstitutions(institutionsData);

      const institutionsDataFilteredByUser = ((institutionsData.institutions as Array<Institution>) ?? [])
          .filter((institution) => institution.institutionId !== user?.org_id);
      setInstitutions({institutions:institutionsDataFilteredByUser});

      const institutionList = institutionsData.institutions;
      dispatch(setInstitutionList(institutionList as Array<Institution>));
    } catch (error) {
      console.error('Errore nel recupero delle istituzioni:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstitutions = useMemo(() => {
    const list = (institutions.institutions as Array<Institution>) ?? [];
    if (!searchTerm) {
      return list;
    }
    return list.filter((institution) =>
      institution.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [institutions.institutions, searchTerm]);

  const sortedInstitutions = useMemo(
    () => sortInstitutions([...(filteredInstitutions as Array<Institution>)], order, orderBy),
    [filteredInstitutions, order, orderBy]
  );

  const paginatedInstitutions = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedInstitutions.slice(start, end);
  }, [sortedInstitutions, page, rowsPerPage]);

  const tableData: InstitutionsResponse = {
    institutions: paginatedInstitutions,
  };

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof Institution) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleToggleDrawer = (open: boolean) => {
    setDrawerOpened(open);
  };

  const handleDetailRequest = async (institution: Institution) => {
    try {
      const res = await getInstitutionById(institution.institutionId);
      setInstitutionData(res);
      setDrawerOpened(true);
    } catch (error) {
      console.error('Errore nel recupero del dettaglio della istituzione:', error);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [institutions]);

  return (
    <>
      <Box width="100%" px={2}>
        <TitleBox
          title={t('pages.invitaliaOverview.overviewTitle')}
          subTitle={t('pages.invitaliaOverview.overviewTitleDescription')}
          mbTitle={2}
          mtTitle={2}
          mbSubTitle={5}
          variantTitle="h4"
          variantSubTitle="body1"
          data-testid="title-overview"
          titleFontSize="42px"
        />

        <Box width="100%">
          <TextField
            label="Cerca per nome produttore"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box width="100%" sx={{ paddingTop: '36px' }}>
          <InstitutionsTable
            loading={loading}
            error={error}
            data={tableData}
            page={page}
            rowsPerPage={rowsPerPage}
            totalElements={sortedInstitutions.length}
            order={order}
            orderBy={orderBy}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onRequestSort={handleRequestSort}
            onDetailRequest={handleDetailRequest}
          />
        </Box>
      </Box>
      <DetailDrawer
        data-testid="detail-drawer"
        open={drawerOpened}
        toggleDrawer={handleToggleDrawer}
      >
        <ManufacturerDetail data={institutionData} />
      </DetailDrawer>
    </>
  );
};

export default InvitaliaOverview;
