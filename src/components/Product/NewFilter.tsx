import React from 'react';
import { Box, Button } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { theme } from '@pagopa/mui-italia';
import useScopedTranslation from '../../hooks/useScopedTranslation';

type NewFilterProps = {
  onClick?: () => void;
};

const NewFilter: React.FC<NewFilterProps> = ({ onClick }) => {
  const { t } = useScopedTranslation();

  return (
    <Box
      sx={{
        gridColumn: 'span 12',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <Button
        onClick={onClick}
        variant="text"
        color="primary"
        sx={{
          minWidth: 'auto',
          fontWeight: theme.typography.fontWeightBold,
        }}
      >
        <TuneIcon fontSize="small" />
        {t('common.advancedFilters')}
      </Button>
    </Box>
  );
};

export default NewFilter;
