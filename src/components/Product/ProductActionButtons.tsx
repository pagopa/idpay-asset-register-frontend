import { Button, Box, ListItem } from '@mui/material';
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
  width: "100%",
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
        <Box mt={2} display="flex" flexDirection="column" sx={{ width: "100%" }}>
          <Button
            color="primary"
            variant="contained"
            sx={{ ...buttonStyle}}
            onClick={onSupervision}
            disabled={!onSupervision}
          >
            Richiedi approvazione
          </Button>
          <Button
            color="error"
            sx={{ ...buttonStyle }}
            onClick={onExclude}
          >
            Escludi
          </Button>
        </Box>
      </ListItem>
    );
  } else {
    return null;
  }
}
