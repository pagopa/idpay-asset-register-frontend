import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  open:boolean;
  toggleDrawer: (isOpen: boolean) => void;
  children?: React.ReactNode;
};

export default function DetailDrawer({open, toggleDrawer,children }:Props) {


  return (
      <Drawer anchor="right" open={open} onClose={() => toggleDrawer(false)}>
        <Box sx={{ display: 'flex', flexDirection: 'row-reverse', padding: 1 }}>
          <IconButton onClick={() => toggleDrawer(false)} sx={{color:"text.secondary"}}>
            <CloseIcon />
          </IconButton>
        </Box>
        {children}
      </Drawer>
  );
}