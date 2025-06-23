import { Box, Typography, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { ButtonNaked } from '@pagopa/mui-italia';
import { formatFileName } from '../../helpers';

interface Props {
  fileName: string | undefined;
  fileDate: string | undefined;
  chipLabel: string;
  buttonLabel: string;
  buttonHandler: any;
}

const AcceptedFile = ({ fileName, fileDate, chipLabel, buttonLabel, buttonHandler }: Props) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      py: 2,
      my: 1,
    }}
  >
    <Box
      sx={{
        gridColumn: 'span 12',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        px: 2,
        py: 1,
        borderRadius: '10px',
        border: '1px solid #E3E7EB',
        alignItems: 'center',
      }}
    >
      <Box sx={{ textAlign: 'center', gridColumn: 'span 1', mt: 1 }}>
        <CheckCircleIcon color="success" />
      </Box>
      <Box sx={{ gridColumn: 'span 4' }}>
        <Typography variant="body2" fontWeight={600}>
          {formatFileName(fileName)}
        </Typography>
      </Box>
      <Box sx={{ gridColumn: 'span 4', textAlign: 'left' }}>
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{fileDate}</Typography>
      </Box>
      <Box sx={{ gridColumn: 'span 3', justifySelf: 'right', px: 2 }}>
        <Chip label={chipLabel} color="success" />
      </Box>
    </Box>
    <Box sx={{ gridColumn: 'span 12', py: 2 }}>
      <ButtonNaked
        size="small"
        component="button"
        onClick={buttonHandler}
        startIcon={<FileUploadIcon />}
        sx={{ color: 'primary.main' }}
        weight="default"
      >
        {buttonLabel}
      </ButtonNaked>
    </Box>
  </Box>
);

export default AcceptedFile;
