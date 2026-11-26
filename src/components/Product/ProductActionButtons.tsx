import { Box, ListItem } from '@mui/material';
import { MIButton } from '@pagopa/mui-italia/components/MIButton';
import { PRODUCTS_STATES } from '../../utils/constants';

type ProductActionButtonsProps = {
  isInvitaliaUser: boolean;
  status: string | undefined;
  onExclude: () => void;
  onSupervision?: () => void;
};

const buttonStyle = {
  fontWeight: 600,
  fontSize: 16,
  marginBottom: 2,
  width: '100%',
};

export default function ProductActionButtons({
  isInvitaliaUser,
  status,
  onExclude,
  onSupervision,
}: ProductActionButtonsProps) {
  if (isInvitaliaUser && status === PRODUCTS_STATES.SUPERVISED) {
    return (
      <ListItem sx={{ pl: 0 }}>
        <Box mt={2} display="flex" flexDirection="column" sx={{ width: '100%' }}>
          <MIButton
            color="primary"
            variant="contained"
            sx={{ ...buttonStyle }}
            onClick={onSupervision}
            disabled={!onSupervision}
          >
            Richiedi approvazione
          </MIButton>
          <MIButton color="error" variant="text" sx={{ ...buttonStyle }} onClick={onExclude}>
            Escludi
          </MIButton>
        </Box>
      </ListItem>
    );
  } else {
    return null;
  }
}
