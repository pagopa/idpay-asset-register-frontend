import { Link as MUILink, Tooltip, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { EMPTY_DATA } from '../../utils/constants';

type LinkProps = {
  label?: string;
  href: string;
  tooltip?: boolean;
  name?: string;
  testId?: string;
};

export const Link = ({ label, href, tooltip, name, testId }: LinkProps) => (
  <Tooltip title={tooltip && (label || EMPTY_DATA)}>
    {label ? (
      <MUILink
        className={`name:${name}-link`}
        sx={{
          color: theme.palette.primary.main,
          fontWeight: theme.typography.fontWeightMedium,
        }}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={testId}
      >
        {label}
      </MUILink>
    ) : (
      <Typography
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {EMPTY_DATA}
      </Typography>
    )}
  </Tooltip>
);