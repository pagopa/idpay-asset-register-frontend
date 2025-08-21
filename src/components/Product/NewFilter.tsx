import React from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TuneIcon from '@mui/icons-material/Tune';

type NewFilterProps = {
    onClick?: () => void;
};

const NewFilter: React.FC<NewFilterProps> = ({ onClick }) => {
    const { t } = useTranslation();

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
                    fontWeight: 'bold',
                }}
            >
                <TuneIcon fontSize="small"/>
                {t('commons.advancedFilters')}
            </Button>
        </Box>
    );
};

export default NewFilter;
