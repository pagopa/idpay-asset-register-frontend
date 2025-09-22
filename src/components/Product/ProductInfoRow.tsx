import { ListItem, Box, Typography } from '@mui/material';
import { ReactNode, forwardRef } from 'react';

type ProductInfoRowProps = {
  label: string;
  value: ReactNode;
  labelVariant?: 'body1' | 'body2' | 'overline';
  valueVariant?: 'body1' | 'body2' | 'h6';
  sx?: object;
  labelColor?: string;
};

const ProductInfoRow = forwardRef<HTMLLIElement, ProductInfoRowProps>(
  ({ label, value, labelVariant = 'body1', valueVariant = 'body2', sx = {}, labelColor }, ref) => (
    <Box sx={{ width: '100%' }}>
      <ListItem disablePadding ref={ref} sx={{ width: '100%' }}>
        <Box sx={{ my: 1, ...sx }}>
          <Typography variant={labelVariant} color={labelColor ?? 'text.secondary'}>
            {label}
          </Typography>
          <Typography
            variant={valueVariant}
            fontWeight="fontWeightMedium"
            component="div"
            sx={{ width: '100%' }}
          >
            {value}
          </Typography>
        </Box>
      </ListItem>
    </Box>
  )
);

export default ProductInfoRow;
