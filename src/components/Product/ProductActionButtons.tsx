import { Button, Box, ListItem } from '@mui/material';

type ProductActionButtonsProps = {
  isInvitaliaUser: boolean;
  status: string | undefined;
  onRestore: () => void;
  onExclude: () => void;
};

const buttonStyle = {
  height: 48,
  fontWeight: 600,
  fontSize: 16,
  marginRight: 2,
};

export default function ProductActionButtons({
  isInvitaliaUser,
  status,
  onRestore,
  onExclude,
}: ProductActionButtonsProps) {
  if (!isInvitaliaUser || !status) {
    return null;
  }

  if (status !== 'REJECTED') {
    return (
      <ListItem>
        <Box mt={2} display="flex" flexDirection="row" justifyContent="flex-start">
          <Button
            color="primary"
            variant="contained"
            sx={{ ...buttonStyle, width: '138px' }}
            onClick={onRestore}
          >
            Ripristina
          </Button>
          <Button
            variant="outlined"
            color="error"
            sx={{ ...buttonStyle, width: '92px' }}
            onClick={onExclude}
          >
            Escludi
          </Button>
        </Box>
      </ListItem>
    );
  }

  return (
    <ListItem>
      <Box mt={2} display="flex" flexDirection="row" justifyContent="flex-start">
        <Button
          color="primary"
          variant="contained"
          sx={{ ...buttonStyle, width: '138px' }}
          onClick={onRestore}
        >
          Ripristina
        </Button>
      </Box>
    </ListItem>
  );
}
