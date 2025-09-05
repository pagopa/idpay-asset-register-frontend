import { ListItem, Box, Typography } from '@mui/material';
import { ReactNode, forwardRef } from 'react';

type ProductInfoRowProps = {
  label: string;
  value: ReactNode;
  labelVariant?: 'body1' | 'body2'| 'overline';
  valueVariant?: 'body1' | 'body2' | 'h6';
  sx?: object;
};

const ProductInfoRow = forwardRef<HTMLLIElement, ProductInfoRowProps>(
  ({ label, value, labelVariant = 'body1', valueVariant = 'body2', sx = {} }, ref) => (
    <ListItem disablePadding ref={ref}>
      <Box sx={{ my: 1, ...sx }}>
        <Typography variant={labelVariant} color="text.secondary">
          {label}
        </Typography>
        <Typography variant={valueVariant} fontWeight="fontWeightMedium">
          {value}
        </Typography>
      </Box>
    </ListItem>
  )
);

export default ProductInfoRow;
