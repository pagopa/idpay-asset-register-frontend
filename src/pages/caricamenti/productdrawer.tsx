import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ProductsDrawerProps } from './helpers';

export default function ProductsDrawer(props: ProductsDrawerProps) {
  const DrawerList = (
    <Box sx={{ width: 500 }} role="presentation" onClick={() => props.toggleDrawer(false)}>
      <List>
        <ListItem disablePadding>
          <Box sx={{ fontSize: '150%', fontWeight: 'bold', mb: 1, ml: 2 }}>Dettaglio prodotto</Box>
        </ListItem>
        <ListItem>
          <Box sx={{ fontWeight: 'bold', mb: 1 }}>{props.data.branchName}</Box>
        </ListItem>
        <Divider sx={{ mb: 2 }} />

        <ListItem disablePadding>
          <Box sx={{ fontWeight: 'bold', ml: 2, mb: 2 }}>Scheda prodotto</Box>
        </ListItem>

        <ListItem disablePadding>
          <Box sx={{ color: 'gray', ml: 2, mb: -1 }}>Codice EPREL</Box>
        </ListItem>
        <ListItem>
          <Box sx={{ mb: 2 }}>{props.data.eprelCode || 'Codice EPREL esempio'}</Box>
        </ListItem>

        <ListItem disablePadding>
          <Box sx={{ color: 'gray', ml: 2, mb: -1 }}>Codice GTIN/EAN</Box>
        </ListItem>
        <ListItem>
          <Box sx={{ mb: 2 }}>{props.data.gtinCode || 'Codice GTIN/EAN esempio'}</Box>
        </ListItem>

        <ListItem disablePadding>
          <Box sx={{ color: 'gray', ml: 2, mb: -1 }}>Codice prodotto</Box>
        </ListItem>
        <ListItem>
          <Box sx={{ mb: 2 }}>{props.data.codice_prodotto || 'Codice prodotto esempio'}</Box>
        </ListItem>

        <ListItem disablePadding>
          <Box sx={{ color: 'gray', ml: 2, mb: -1 }}>Categoria</Box>
        </ListItem>
        <ListItem>
          <Box sx={{ mb: 2 }}>{props.data.category || 'Categoria esempio'}</Box>
        </ListItem>

        <ListItem disablePadding>
          <Box sx={{ color: 'gray', ml: 2, mb: -1 }}>Marca</Box>
        </ListItem>
        <ListItem>
          <Box sx={{ mb: 2 }}>{props.data.marca || 'Marca esempio'}</Box>
        </ListItem>

        <ListItem disablePadding>
          <Box sx={{ color: 'gray', ml: 2, mb: -1 }}>Modello</Box>
        </ListItem>
        <ListItem>
          <Box sx={{ mb: 2 }}>{props.data.modello || 'Modello esempio'}</Box>
        </ListItem>

        <ListItem disablePadding>
          <Box sx={{ color: 'gray', ml: 2, mb: -1 }}>Paese di produzione</Box>
        </ListItem>
        <ListItem>
          <Box sx={{ mb: 2 }}>{props.data.origine || 'Paese di produzione esempio'}</Box>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer anchor="right" open={props.open} onClose={() => props.toggleDrawer(false)}>
      <Box sx={{ display: 'flex', flexDirection: 'row-reverse', padding: 3 }}>
        <IconButton onClick={() => props.toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      {DrawerList}
    </Drawer>
  );
}
