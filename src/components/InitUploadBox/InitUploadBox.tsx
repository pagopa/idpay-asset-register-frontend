import { Box, Typography } from '@mui/material';
import {CloudUpload} from "@mui/icons-material";

interface Props {
  text: string;
  link: string;
}

const InitUploadBox = ({ text, link }: Props) => (
  <Box sx={{ textAlign: 'center', gridColumn: 'span 12' }}>
    <CloudUpload sx={{ verticalAlign: 'bottom', color: '#0073E6', marginRight: 2 }} />
    <Typography variant="body2" sx={{ textAlign: 'center', display: 'inline-grid' }}>
      {text}&#160;
    </Typography>
    <Typography
      variant="body2"
      sx={{ textAlign: 'center', display: 'inline-grid', color: '#0073E6', cursor: 'pointer' }}
    >
      {link}
    </Typography>
  </Box>
);

export default InitUploadBox;
