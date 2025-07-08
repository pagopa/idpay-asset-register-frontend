import { Link, Typography } from '@mui/material';
import { emptyData } from '../../utils/constants';
import { ProductDTO } from '../../api/generated/register/ProductDTO';

interface EprelLinkProps {
  row: ProductDTO;
}

const EprelLink: React.FC<EprelLinkProps> = ({ row }) => {
  const { linkEprel, eprelCode } = row;

  if (eprelCode && typeof eprelCode === 'string' && eprelCode.trim() !== '') {
    return (
      <Link underline="hover" href={linkEprel} target="_blank" rel="noopener">
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0062C3' }}>
          {eprelCode}
        </Typography>
      </Link>
    );
  }

  return (
    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0062C3' }}>
      {emptyData}
    </Typography>
  );
};

export default EprelLink;
