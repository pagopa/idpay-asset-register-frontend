import { Modal, Backdrop, Fade, Box, Typography, Button } from '@mui/material';
import { MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

type Props = {
  title: string;
  subtitle: string;
  openExitModal: boolean;
  handleCloseExitModal: MouseEventHandler;
  backRoute: string;
};

const ExitModal = ({ title, subtitle, openExitModal, handleCloseExitModal, backRoute }: Props) => {
  const history = useHistory();
  const { t } = useTranslation();
  const closeWithoutSaving = (e: any) => {
    history.replace(backRoute);
    handleCloseExitModal(e);
  };

  return (
    <Modal
      aria-labelledby="exit-without-saving-modal-title"
      aria-describedby="exit-without-saving-modal-description"
      open={openExitModal}
      onClose={handleCloseExitModal}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      data-testid="exit-modal-test"
    >
      <Fade in={openExitModal} data-testid="fade-test">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            borderRadius: '4px',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body1" sx={{ my: 2 }}>
            {subtitle}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',

              gridTemplateRows: 'auto',
              gridTemplateAreas: `". . . cancelBtn cancelBtn exitBtn"`,
            }}
          >
            <Button
              variant="outlined"
              sx={{ gridArea: 'cancelBtn', justifySelf: 'end' }}
              onClick={handleCloseExitModal}
              data-testid="cancel-button-test"
            >
              {t('commons.cancelBtn')}
            </Button>
            <Button
              variant="contained"
              sx={{ gridArea: 'exitBtn', justifySelf: 'end' }}
              onClick={(e) => closeWithoutSaving(e)}
              data-testid="exit-button-test"
            >
              {t('commons.exitBtn')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ExitModal;
