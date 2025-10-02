import { Link, Typography } from '@mui/material';
import { EMPTY_DATA } from '../../utils/constants';
import { ProductDTO } from '../../api/generated/register/ProductDTO';

interface EprelLinkProps {
  row: ProductDTO;
}

const EprelLinks: React.FC<EprelLinkProps> = ({ row }) => {
  const { linkEprel, eprelCode } = row;

  return eprelCode?.trim() !== '' && typeof eprelCode === 'string' ? (
    <Link underline="hover" href={linkEprel} target="_blank" rel="noopener">
      <Typography variant="body2" sx={{ fontWeight: 'fontWeightBold', color: '#0062C3' }}>
        {eprelCode}
      </Typography>
    </Link>
  ) : (
    <Typography variant="body2">{EMPTY_DATA}</Typography>
  );
};

export default EprelLinks;
