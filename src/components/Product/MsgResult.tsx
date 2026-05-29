import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';

export type MsgResultProps = {
  severity?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'filled' | 'outlined';
  message: string;
  bottom?: number;
  children?: React.ReactNode;
};

const ALERT_Z_INDEX = 2147483647;

const MsgResult: React.FC<MsgResultProps> = ({
  severity = 'success',
  variant = 'outlined',
  message,
  bottom,
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
    <Slide direction="left" in={visible} mountOnEnter unmountOnExit>
      <Alert
        severity={severity}
        variant={variant}
        icon={severity === 'success' ? <CheckCircleOutline /> : undefined}
        sx={{
          position: 'fixed',
          bottom: bottom ?? 40,
          right: 20,
          backgroundColor: 'white',
          width: 'auto',
          maxWidth: '400px',
          minWidth: '300px',
          zIndex: ALERT_Z_INDEX,
          boxShadow: 3,
          borderRadius: 1,
          '& .MuiAlert-icon': {
            color: severity === 'success' ? '#6CC66A' : undefined,
          },
        }}
      >
        {message}
        {children}
      </Alert>
    </Slide>
  );

  return typeof window !== 'undefined' && document.body
    ? ReactDOM.createPortal(content, document.body)
    : content;
};

export default MsgResult;
export { MsgResult };
