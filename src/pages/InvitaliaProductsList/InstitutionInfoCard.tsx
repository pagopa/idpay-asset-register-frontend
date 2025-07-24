import { Box, Paper, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { truncateString } from '../../helpers';
import { InstitutionResponse } from '../../api/generated/register/InstitutionResponse';
import { getInstitutionById } from '../../services/registerService';
import { institutionSelector } from '../../redux/slices/invitaliaSlice';
import { emptyData, maxLengthOverviewInvit } from '../../utils/constants';

const InstitutionInfoCard: React.FC = () => {
  const { t } = useTranslation();
  const institution = useSelector(institutionSelector);
  const [institutionInfo, setInstitutionInfo] = useState<InstitutionResponse | null>(null);

  const fetchInstitution = async () => {
    try {
      const data = await getInstitutionById(institution?.institutionId || '');
      setInstitutionInfo(data);
    } catch (error) {
      console.error("Errore nel recupero dei dati dell'istituzione:", error);
    }
  };

  useEffect(() => {
    void fetchInstitution();
  }, []);

  const leftColumn = [
    { label: 'ragioneSociale', value: institutionInfo?.description, truncate: true },
    { label: 'codiceFiscale', value: institutionInfo?.fiscalCode, truncate: true },
    { label: 'piva', value: institutionInfo?.vatNumber, truncate: true },
  ];

  const rightColumn = [
    {
      label: 'sedeLegale',
      value:
        `${institutionInfo?.address ?? ''}, ${institutionInfo?.zipCode ?? ''} ${institutionInfo?.city ?? ''} (${institutionInfo?.county ?? ''})`,
      truncate: true,
    },
    { label: 'pec', value: institutionInfo?.digitalAddress, truncate: true },
  ];

  const renderInfoRow = ({
    label,
    value,
    truncate,
  }: {
    label: string;
    value: string | undefined | null;
    truncate: boolean;
  }) => (
    <Box
      key={label}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minWidth: 0,
      }}
    >
      <Typography variant="body2" fontWeight={500} noWrap sx={{ width: 167 }}>
        {t(`pages.invitaliaProductsList.${label}`)}
      </Typography>
      {truncate && value ? (
        <Tooltip title={value}>
          <Typography variant="body2" sx={{ cursor: 'pointer', fontWeight: '600' }} noWrap>
            {truncateString(value, maxLengthOverviewInvit)}
          </Typography>
        </Tooltip>
      ) : (
        <Typography variant="body2" sx={{ fontWeight: '600' }} noWrap>
          {value || emptyData}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ gridColumn: 'span 12' }}>
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
        <Typography
          fontWeight={700}
          fontSize="14px"
          lineHeight="100%"
          letterSpacing="1px"
          sx={{ gridColumn: 'span 12', paddingBottom: '16px' }}
        >
          {t('pages.invitaliaProductsList.infoCardTitle').toUpperCase()}
        </Typography>

        <Box
          sx={{
            gridColumn: 'span 12',
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            columnGap: 2,
            rowGap: 2,
          }}
        >
          <Box sx={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {leftColumn.map(renderInfoRow)}
          </Box>

          <Box sx={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {rightColumn.map(renderInfoRow)}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default InstitutionInfoCard;
