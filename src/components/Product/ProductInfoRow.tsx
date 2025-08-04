import { ListItem, Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

type ProductInfoRowProps = {
  label: string;
  value: ReactNode;
  labelVariant?: 'body1' | 'body2';
  valueVariant?: 'body2' | 'h6';
  sx?: object;
};

export default function ProductInfoRow({
  label,
  value,
  labelVariant = 'body1',
  valueVariant = 'body2',
  sx = {},
}: ProductInfoRowProps) {
  return (
    <ListItem disablePadding>
      <Box sx={{ my: 1 , ...sx}}>
        <Typography variant={labelVariant} color="text.secondary">
          {label}
        </Typography>
        <Typography variant={valueVariant} fontWeight="fontWeightMedium">
          {value}
        </Typography>
      </Box>
    </ListItem>
  );
}
