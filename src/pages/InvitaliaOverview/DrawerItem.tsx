import { ListItem, Box, Typography } from '@mui/material';
import {CopyToClipboardButton} from "@pagopa/mui-italia";

type DrawerItemProps = {
  itemHeader: string;
  itemValue: string;
  copyable?: boolean;
};

const DrawerItem: React.FC<DrawerItemProps> = ({ itemHeader, itemValue, copyable = false }) => {
  const handleCopyButtonClick = async () => {
    try {
      await navigator.clipboard.writeText(itemValue);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <ListItem disablePadding>
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
        <Typography variant={'body1'}>{itemHeader}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 350,
              pr: 2,
            }}
          >
            <Typography noWrap fontWeight={'600'}>
              {itemValue}
            </Typography>
          </Box>
          {copyable && (
            <Box>
                <CopyToClipboardButton onCopy={handleCopyButtonClick} value={itemValue} size="small"/>
            </Box>
          )}
        </Box>
      </Box>
    </ListItem>
  );
};

export default DrawerItem;
