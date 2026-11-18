import { ListItem, Box, Typography } from '@mui/material';
import { ReactNode, forwardRef } from 'react';
import TruncatedText from '../TruncatedText/TruncatedText';

type ProductInfoRowProps = {
  label: string;
  value: ReactNode;
  labelVariant?: 'body1' | 'body2' | 'overline';
  valueVariant?: 'body1' | 'body2' | 'h6';
  sx?: object;
  labelColor?: string;
  /** @deprecated kept for backward compatibility; values are always single-line now. */
  maxValueLines?: number;
  /** Disable single-line truncation for multi-line content (e.g. motivations). */
  disableTruncation?: boolean;
};

const ProductInfoRow = forwardRef<HTMLLIElement, ProductInfoRowProps>(
  (
    {
      label,
      value,
      labelVariant = 'body1',
      valueVariant = 'body2',
      sx = {},
      labelColor,
      disableTruncation = false,
    },
    ref
  ) => (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <ListItem disablePadding ref={ref} sx={{ width: '100%', minWidth: 0 }}>
        <Box sx={{ my: 1, width: '100%', minWidth: 0, ...sx }}>
          <Typography variant={labelVariant} color={labelColor ?? 'text.secondary'}>
            {label}
          </Typography>
          {disableTruncation ? (
            <Typography
              variant={valueVariant}
              fontWeight="fontWeightMedium"
              component="div"
              sx={{
                width: '100%',
                minWidth: 0,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-line',
              }}
            >
              {value}
            </Typography>
          ) : (
            <TruncatedText
              variant={valueVariant}
              fontWeight="fontWeightMedium"
              component="div"
            >
              {value}
            </TruncatedText>
          )}
        </Box>
      </ListItem>
    </Box>
  )
);

export default ProductInfoRow;
