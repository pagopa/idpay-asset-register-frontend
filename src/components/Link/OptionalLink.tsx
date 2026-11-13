import { Tooltip, Typography } from '@mui/material';
import { EMPTY_DATA } from '../../utils/constants';
import { Link } from './Link';

type OptionalLinkProps = {
  value?: string;
  tooltip?: boolean;
  testId?: string;
  name?: string;
};

const renderText = ({ text, tooltip, bold }: { text?: string; tooltip?: boolean; bold?: boolean }) => {
  const sx = {
    ...(tooltip
      ? {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }
      : { wordWrap: 'break-word', maxWidth: '100%' }),
    ...(bold || !text ? { fontWeight: 'fontWeightMedium' } : {}),
  };

  return (
    <Tooltip title={tooltip && (text || EMPTY_DATA)}>
      <Typography variant="body2" sx={sx}>
        {text || EMPTY_DATA}
      </Typography>
    </Tooltip>
  );
};

export const OptionalLink = ({ value, tooltip, testId, name }: OptionalLinkProps) => {
  const text = value?.trim();
  const urlRegex = /^(?:https?:\/\/[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})?|(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:\/.*)?$/;
  const protocolRegex = /^https?:\/\//i;
  const isUrl = urlRegex.test(text ?? '');
  const href = isUrl ? (protocolRegex.test(text ?? '') ? text ?? '' : `https://${text}`) : '';

  return isUrl ? (
    <Link name={name} tooltip={tooltip} label={text} href={href} testId={testId} />
  ) : (
    renderText({ text, tooltip, bold: true })
  );
};