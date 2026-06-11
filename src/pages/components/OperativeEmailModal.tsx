import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
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
import { useInitiativeConfig } from '../../hooks/useInitiativeConfig';
import useScopedTranslation from '../../hooks/useScopedTranslation';

type FieldErrors = {
  email?: string;
  confirmEmail?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (email: string) => void;
  initialEmail?: string;
  isLoading?: boolean;
};

const MODAL_PRIMARY_COLOR = 'primary.main';
const MODAL_ERROR_COLOR_PLACEHOLDER = 'error.main';

const modalStyles = {
  paper: {
    width: "40%",
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
    top: 26,
    color: 'text.primary',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  title: {
    p: 0,
  },
  titleText: {
    fontFamily: 'Titillium Web',
    fontSize: 24,
    color: "text.primary",
    fontWeight: 700,
  },
  content: {
    p: 0,
    overflow: 'visible',
  },
  description: {
    mb: 2.5,
    color: 'text.description',
    fontFamily: 'Titillium Web',
    fontSize: 16,
  },
  fields: {
    display: 'grid',
    rowGap: 1.4,
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      height: 48,
      borderRadius: '8px',
      backgroundColor: 'white',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
      borderColor: MODAL_PRIMARY_COLOR,
    },
    '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: MODAL_ERROR_COLOR_PLACEHOLDER,
    },
    '& .MuiInputBase-input': {
      fontFamily: 'Titillium Web',
      fontSize: 14,
      lineHeight: '24px',
      fontWeight: 600,
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'Titillium Web',
      fontWeight: 600,
      backgroundColor: 'white',
      px: 0.5,
      transform: 'translate(50px, 11px) scale(1)',
    },
    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: MODAL_PRIMARY_COLOR,
    },
    '& .MuiInputLabel-root.Mui-error': {
      color: MODAL_ERROR_COLOR_PLACEHOLDER,
    },
    '& .MuiFormHelperText-root': {
      ml: 2,
      fontFamily: 'Titillium Web',
      fontSize: 12,
      lineHeight: '22px',
    },
    '& .MuiFormHelperText-root.Mui-error': {
      color: MODAL_ERROR_COLOR_PLACEHOLDER,
    },
  },
  inputIcon: {
    color: '#A9B7C8',
    fontSize: 22,
  },
  errorIcon: {
    color: MODAL_ERROR_COLOR_PLACEHOLDER,
    fontSize: 22,
  },
  actions: {
    p: 0,
    pt: 4,
    gap: 2,
  },
  cancelButton: {
    color: MODAL_PRIMARY_COLOR,
    fontWeight: 700,
    fontSize: 15,
    '&:hover': {
      color: MODAL_PRIMARY_COLOR,
    },
  },
  saveButton: {
    backgroundColor: MODAL_PRIMARY_COLOR,
    height: 44,
    borderRadius: '8px',
    fontFamily: 'Titillium Web',
    fontSize: 15,
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: MODAL_PRIMARY_COLOR,
    },
  },
};

const isValidEmail = (value: string, pattern?: string) =>
  Boolean(pattern && RegExp(pattern).test(value));

const getEmailError = (value: string, pattern: string | undefined, t: (key: string) => string) => {
  if (!value) {
    return t('pages.overview.operativeEmailModal.requiredError');
  }

  if (!isValidEmail(value, pattern)) {
    return t('pages.overview.operativeEmailModal.invalidEmailError');
  }

  return undefined;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const OperativeEmailModal: React.FC<Props> = ({
  open,
  onClose,
  onSave,
  initialEmail,
  isLoading = false,
}) => {
  const { t } = useScopedTranslation();
  const { config } = useInitiativeConfig();
  const operativeEmailPattern = config?.validation?.operativeEmail?.regEx;
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [confirmEmailFocused, setConfirmEmailFocused] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setEmail(initialEmail ?? '');
      setConfirmEmail('');
      setEmailFocused(false);
      setConfirmEmailFocused(false);
      setFieldErrors({});
    }
  }, [initialEmail, open]);

  const validate = () => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedConfirmEmail = normalizeEmail(confirmEmail);
    const emailError = getEmailError(normalizedEmail, operativeEmailPattern, t);
    const confirmEmailError =
      getEmailError(normalizedConfirmEmail, operativeEmailPattern, t) ||
      (normalizedEmail !== normalizedConfirmEmail
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

    onSave(normalizeEmail(email));
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
        disabled={isLoading}
        sx={modalStyles.closeButton}
      >
        <CloseIcon sx={{width: 25, height: 25}} />
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
              disabled={isLoading}
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
              disabled={isLoading}
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
          disabled={isLoading}
          size="medium"
          sx={modalStyles.cancelButton}
          weight="default"
        >
          {t('pages.overview.operativeEmailModal.cancelButton')}
        </ButtonNaked>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading}
          sx={modalStyles.saveButton}
        >
          {isLoading ? (
            <CircularProgress color="inherit" size={22} />
          ) : (
            t('pages.overview.operativeEmailModal.saveButton')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OperativeEmailModal;
