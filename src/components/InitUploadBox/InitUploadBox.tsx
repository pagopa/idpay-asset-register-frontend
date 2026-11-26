import { Box, Typography } from '@mui/material';
import { FileUploadOutlined } from '@mui/icons-material';

interface Props {
  text: string;
  link: string;
}

const InitUploadBox = ({ text, link }: Props) => (
  <Box sx={{ textAlign: 'center', gridColumn: 'span 12', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
    <FileUploadOutlined color="action" />
    <Typography variant="body2">
      {text}
    </Typography>
    <Box
      component="span"
      sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', borderRadius: 2, px: 2, py: 1, fontWeight: 600 }}
    >
      {link}
    </Box>
  </Box>
);

export default InitUploadBox;
