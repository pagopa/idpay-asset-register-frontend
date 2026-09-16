import { ListItem, Box, Typography, Tooltip } from '@mui/material';
import { ReactNode, forwardRef } from 'react';

type ProductInfoRowProps = {
  label: string;
  value: ReactNode;
  labelVariant?: 'body1' | 'body2' | 'overline';
  valueVariant?: 'body1' | 'body2' | 'h6';
  sx?: object;
  labelColor?: string;
  maxValueLines?: number;
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
      maxValueLines,
    },
    ref
  ) => (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <ListItem disablePadding ref={ref} sx={{ width: '100%', minWidth: 0 }}>
        <Box sx={{ my: 1, width: '100%', minWidth: 0, ...sx }}>
          <Typography variant={labelVariant} color={labelColor ?? 'text.secondary'}>
            {label}
          </Typography>
          <Tooltip
            title={maxValueLines ? value : ''}
            placement="bottom"
            arrow
            slotProps={{
              tooltip: {
                sx: { textAlign: 'center' },
              },
            }}
          >
            <Typography
              variant={valueVariant}
              fontWeight="fontWeightMedium"
              component="div"
              sx={{
                width: 'fit-content',
                maxWidth: '100%',
                minWidth: 0,
                ...(maxValueLines === 1
                  ? {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }
                  : maxValueLines
                  ? {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: maxValueLines,
                      whiteSpace: 'normal',
                      overflowWrap: 'anywhere',
                    }
                  : {
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-line',
                    }),
              }}
            >
              {value}
            </Typography>
          </Tooltip>
        </Box>
      </ListItem>
    </Box>
  )
);

export default ProductInfoRow;
