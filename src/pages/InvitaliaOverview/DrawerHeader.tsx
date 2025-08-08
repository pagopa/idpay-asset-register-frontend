import React from 'react';
import { List, ListItem, Box, Typography } from '@mui/material';

type DrawerHeaderProps = {
  label: string;
};

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ label }) => (
  <List>
    <ListItem disablePadding>
      <Box sx={{ my: 1 }}>
        <Typography variant={'h6'}>{label}</Typography>
      </Box>
    </ListItem>
  </List>
);

export default DrawerHeader;
