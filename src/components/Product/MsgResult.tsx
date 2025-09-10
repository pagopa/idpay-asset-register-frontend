import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

type MsgResultProps = {
  severity?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'filled' | 'outlined';
  message: string;
  bottom?: number;
  children?: React.ReactNode;
};

const MsgResult: React.FC<MsgResultProps> = ({
  severity = 'success',
  variant = 'outlined',
  message,
  bottom = 32,
  children,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  const content = (
    <Box
      sx={{
        position: 'fixed',
        right: 12,
        bottom,
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 9999,
      }}
    >
      <Box sx={{ width: '395px', overflowX: 'auto' }}>
        <Alert severity={severity} variant={variant}>
          {message}
          {children}
        </Alert>
      </Box>
    </Box>
  );

  return typeof window !== 'undefined' && document.body
    ? ReactDOM.createPortal(content, document.body)
    : content;
};

export default MsgResult;
export { MsgResult };
