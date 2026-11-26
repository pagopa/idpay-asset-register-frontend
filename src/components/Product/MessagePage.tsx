import { Box } from '@mui/material';
import { MIButton } from '@pagopa/mui-italia/components/MIButton';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import EmptyList from '../../pages/components/EmptyListTable';

interface MessagePageProps {
  message: string;
  goBack?: boolean;
  onGoBack?: () => void;
}

const MessagePage: React.FC<MessagePageProps> = ({ message, goBack, onGoBack }) => {
  const { t } = useScopedTranslation();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: 'white',
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'inline',
          gridColumn: 'span 12',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <EmptyList message={message} />
        {goBack && (
          <MIButton variant="text" onClick={onGoBack}>
            {t('pages.products.backToTable')}
          </MIButton>
        )}
      </Box>
    </Box>
  );
};

export default MessagePage;
