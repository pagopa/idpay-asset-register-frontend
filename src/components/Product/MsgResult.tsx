import React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

type MsgResultProps = {
  severity?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'filled' | 'outlined';
  message: string;
  children?: React.ReactNode;
};

const MsgResult: React.FC<MsgResultProps> = ({
  severity = 'success',
  variant = 'outlined',
  message,
  children,
}) => (
  <Box sx={{ width: '395px', overflowX: 'auto' }}>
    <Alert severity={severity} variant={variant}>
      {message}
      {children}
    </Alert>
  </Box>
);

export default MsgResult;
export { MsgResult };
