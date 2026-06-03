import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Report';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { ButtonNaked } from '@pagopa/mui-italia';
import useScopedTranslation from '../../hooks/useScopedTranslation';

type FieldErrors = {
  email?: string;
  confirmEmail?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (email: string) => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MODAL_BLUE = '#0B3EE3';
const MODAL_RED = '#D13333';

const modalStyles = {
  paper: {
    width: 700,
    maxWidth: 'calc(100% - 32px)',
    borderRadius: '16px',
    p: 3.5,
    boxShadow: `
      0px 9px 46px 8px #002B551A,
      0px 24px 38px 3px #002B550D,
      0px 11px 15px -7px #002B551A
    `,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    color: 'text.primary',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  title: {
    p: 0,
    pr: 5,
    mb: 1.5,
  },
  titleText: {
    fontFamily: 'Titillium Web',
    fontSize: 28,
    lineHeight: '36px',
    color: "#0E0F13",
    fontWeight: 700,
  },
  content: {
    p: 0,
  },
  description: {
    mb: 3.5,
    color: '#5C6F82',
    fontFamily: 'Titillium Web',
    fontSize: 18,
    lineHeight: '28px',
  },
  fields: {
    display: 'grid',
    rowGap: 2.5,
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      minHeight: 56,
      borderRadius: '8px',
      backgroundColor: '#FFFFFF',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
      borderColor: MODAL_BLUE,
    },
    '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: MODAL_RED,
    },
    '& .MuiInputBase-input': {
      fontFamily: 'Titillium Web',
      fontSize: 18,
      lineHeight: '24px',
      fontWeight: 700,
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'Titillium Web',
      fontWeight: 600,
      backgroundColor: '#FFFFFF',
      px: 0.5,
      transform: 'translate(50px, 16px) scale(1)',
    },
    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: MODAL_BLUE,
    },
    '& .MuiInputLabel-root.Mui-error': {
      color: MODAL_RED,
    },
    '& .MuiFormHelperText-root': {
      ml: 2,
      mt: 0.75,
      fontFamily: 'Titillium Web',
      fontSize: 16,
      lineHeight: '22px',
    },
    '& .MuiFormHelperText-root.Mui-error': {
      color: MODAL_RED,
    },
  },
  inputIcon: {
    color: '#A9B7C8',
    fontSize: 26,
  },
  errorIcon: {
    color: MODAL_RED,
    fontSize: 24,
  },
  actions: {
    p: 0,
    pt: 4,
    gap: 2,
  },
  cancelButton: {
    color: MODAL_BLUE,
    fontWeight: 700,
    fontSize: 18,
    '&:hover': {
      color: MODAL_BLUE,
    },
  },
  saveButton: {
    backgroundColor: MODAL_BLUE,
    minWidth: 104,
    height: 56,
    px: 3,
    borderRadius: '8px',
    fontFamily: 'Titillium Web',
    fontSize: 18,
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: MODAL_BLUE,
    },
  },
};

const getEmailError = (value: string, t: (key: string) => string) => {
  if (!value) {
    return t('pages.overview.operativeEmailModal.requiredError');
  }

  if (!EMAIL_REGEX.test(value)) {
    return t('pages.overview.operativeEmailModal.invalidEmailError');
  }

  return undefined;
};

const OperativeEmailModal: React.FC<Props> = ({ open, onClose, onSave }) => {
  const { t } = useScopedTranslation();
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [confirmEmailFocused, setConfirmEmailFocused] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setEmail('');
      setConfirmEmail('');
      setEmailFocused(false);
      setConfirmEmailFocused(false);
      setFieldErrors({});
    }
  }, [open]);

  const validate = () => {
    const trimmedEmail = email.trim();
    const trimmedConfirmEmail = confirmEmail.trim();
    const emailError = getEmailError(trimmedEmail, t);
    const confirmEmailError =
      getEmailError(trimmedConfirmEmail, t) ||
      (trimmedEmail !== trimmedConfirmEmail
        ? t('pages.overview.operativeEmailModal.emailMismatchError')
        : undefined);
    const errors: FieldErrors = {
      ...(emailError ? { email: emailError } : {}),
      ...(confirmEmailError ? { confirmEmail: confirmEmailError } : {}),
    };

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    onSave(email.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: modalStyles.paper,
      }}
    >
      <IconButton
        aria-label={t('common.closeBtn')}
        onClick={onClose}
        sx={modalStyles.closeButton}
      >
        <CloseIcon fontSize="large" />
      </IconButton>
      <DialogTitle sx={modalStyles.title}>
        <Typography component="span" sx={modalStyles.titleText}>
          {t('pages.overview.operativeEmailModal.title')}
        </Typography>
      </DialogTitle>
      <DialogContent sx={modalStyles.content}>
        <Typography variant="body1" sx={modalStyles.description}>
          {t('pages.overview.operativeEmailModal.description')}
        </Typography>

        <Box sx={modalStyles.fields}>
          <Box>
            <TextField
              id="operative-email"
              required
              fullWidth
              label={t('pages.overview.operativeEmailModal.emailLabel')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
              inputProps={{ 'aria-label': t('pages.overview.operativeEmailModal.emailAriaLabel') }}
              InputLabelProps={{
                shrink: emailFocused || Boolean(email),
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={modalStyles.inputIcon} />
                  </InputAdornment>
                ),
                endAdornment: fieldErrors.email ? (
                  <InputAdornment position="end">
                    <ErrorIcon sx={modalStyles.errorIcon} />
                  </InputAdornment>
                ) : undefined,
              }}
              sx={modalStyles.textField}
            />
          </Box>
          <Box>
            <TextField
              id="operative-email-confirm"
              required
              fullWidth
              label={t('pages.overview.operativeEmailModal.confirmEmailLabel')}
              value={confirmEmail}
              onChange={(event) => setConfirmEmail(event.target.value)}
              onFocus={() => setConfirmEmailFocused(true)}
              onBlur={() => setConfirmEmailFocused(false)}
              error={Boolean(fieldErrors.confirmEmail)}
              helperText={fieldErrors.confirmEmail}
              inputProps={{
                'aria-label': t('pages.overview.operativeEmailModal.confirmEmailAriaLabel'),
              }}
              InputLabelProps={{
                shrink: confirmEmailFocused || Boolean(confirmEmail),
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={modalStyles.inputIcon} />
                  </InputAdornment>
                ),
                endAdornment: fieldErrors.confirmEmail ? (
                  <InputAdornment position="end">
                    <ErrorIcon sx={modalStyles.errorIcon} />
                  </InputAdornment>
                ) : undefined,
              }}
              sx={modalStyles.textField}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={modalStyles.actions}>
        <ButtonNaked
          component="button"
          onClick={onClose}
          size="medium"
          sx={modalStyles.cancelButton}
          weight="default"
        >
          {t('pages.overview.operativeEmailModal.cancelButton')}
        </ButtonNaked>
        <Button variant="contained" onClick={handleSave} sx={modalStyles.saveButton}>
          {t('pages.overview.operativeEmailModal.saveButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OperativeEmailModal;
