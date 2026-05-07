import { ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import { createElement } from 'react';

type Props = {
  handleClick: () => void;
  title: string;
  isSelected?: boolean;
  // keep this as `any` to avoid type incompatibilities when different @mui versions are present
  // (e.g. due to dependencies like @pagopa/selfcare-common-frontend bringing its own @mui).
  icon: any;
  level: number;
  disabled?: boolean;
};

export default function SidenavItem({
  handleClick,
  title,
  isSelected,
  icon,
  level,
  disabled = false,
}: Props) {
  return (
    <ListItemButton selected={isSelected} disabled={disabled} onClick={handleClick}>
      <ListItemIcon sx={{ ml: level }}>{icon ? createElement(icon as any) : null}</ListItemIcon>
      <ListItemText
        primary={title}
        sx={{
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          textAlign: 'left',
          display: 'block',
        }}
      />
    </ListItemButton>
  );
}
