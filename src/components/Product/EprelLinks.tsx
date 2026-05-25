import { Link, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { EMPTY_DATA } from '../../utils/constants';
import { ProductDTO } from '../../api/generated/register';

interface EprelLinkProps {
  row: ProductDTO;
}

const EprelLinks: React.FC<EprelLinkProps> = ({ row }) => {
  const { linkEprel, eprelCode } = row;
  const theme = useTheme();

  return eprelCode?.trim() !== '' && typeof eprelCode === 'string' ? (
    <Link
      underline="hover"
      href={linkEprel ?? ''}
      target="_blank"
      rel="noopener"
      sx={{ fontWeight: 'fontWeightBold', color: theme.palette.primary.main }}
    >
      {eprelCode}
    </Link>
  ) : (
    <Typography variant="body2">{EMPTY_DATA}</Typography>
  );
};

export default EprelLinks;
