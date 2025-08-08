import React from 'react';
import { ListItem, Box, Typography } from '@mui/material';

type DrawerSubHeaderProps = {
  label: string;
};

const DrawerSubHeader: React.FC<DrawerSubHeaderProps> = ({ label }) => (
  <ListItem disablePadding>
    <Box sx={{ my: 4 }}>
      <Typography variant={'overline'}>{label}</Typography>
    </Box>
  </ListItem>
);

export default DrawerSubHeader;
