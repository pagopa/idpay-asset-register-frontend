import { Dispatch, forwardRef, SetStateAction, useImperativeHandle } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import { useNavigate } from 'react-router-dom';
import { DEBUG_CONSOLE } from '../../utils/constants';
import {
  downloadErrorReport,
  uploadProductList,
  uploadProductListVerify,
} from '../../services/registerService';
import ROUTES from '../../routes';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useErrorHandling } from '../../hooks/useErrorHandling';
import { useFileState } from '../../hooks/useFileState';
import { UploadProductListParams } from '../../api/generated/register';
import { delay } from '../../helpers';
import { buildRoute } from '../../components/SideMenu/SideMenu';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import { useCategories } from '../../hooks/useCategories';
import { downloadCsv } from './helpers';
import FileUploadSection from './fileUploadSection';

type Props = {
  fileAccepted: boolean;
  setFileAccepted: Dispatch<SetStateAction<boolean>>;
};

export type FormAddProductsRef = {
  validateForm: () => Promise<boolean>;
};

const FormAddProducts = forwardRef<FormAddProductsRef, Props>(
  // eslint-disable-next-line sonarjs/cognitive-complexity
  ({ fileAccepted, setFileAccepted }, ref) => {
    const {categories} = useCategories();
    const { t } = useScopedTranslation();
    const navigate = useNavigate();
    const onExit = useUnloadEventOnExit();
    const initiativeId = useCurrentInitiativeId();

    const fileState = useFileState();
    const errorHandling = useErrorHandling(t);

    const validationSchema = Yup.object().shape({
      category: Yup.string().required(t('validation.categoryRequired')),
    });

    const formik = useFormik({
      initialValues: { category: '' },
      validateOnMount: true,
      validateOnChange: true,
      enableReinitialize: true,
      validationSchema,
      onSubmit: (values) => console.log(values),
    });

    const isCategoryValid = () => !formik.errors.category && formik.values.category !== '';

    const validateForm = async () => {
      await validateCategoryField();
      return isCategoryValid() && fileAccepted;
    };

    const validateCategoryField = async () => {
      await formik.setFieldTouched('category', true, true);
      await formik.validateField('category');
    };
    useImperativeHandle(ref, () => ({ validateForm }), [formik, fileAccepted]);

    const handleDownloadReport = async () => {
      try {
        const res = await downloadErrorReport(errorHandling.idReport);
        {
          /* if (DEBUG_CONSOLE) {
          console.debug('downloadErrorReport response:', res);
        }
          */
        }
        downloadCsv(
          (res as any)?.data ?? (res as any) ?? '',
          (res as any)?.filename ?? 'report.csv'
        );
      } catch (error) {
        if (DEBUG_CONSOLE) {
          console.error('Error downloading the report:', error);
        }
      }
    };

    const processFileUpload = async (files: Array<File>) => {
      if (!isCategoryValid()) {
        errorHandling.showCategoryError();
        setFileAccepted(false);
        fileState.setFileRejectedState();
        return;
      }

      fileState.setFileIsLoading(true);
      errorHandling.clearErrors();

      try {
        const res = await uploadProductListVerify(
          files[0],
          formik.values.category.toUpperCase() as UploadProductListParams['category']
        );
        handleUploadResponse(res.data, files[0]);
      } catch (error) {
        handleUploadErrorAndRejectFile({ status: undefined });
      }
    };

    const handleUploadResponse = (res: Partial<{ status: string }>, file: File) => {
      const uploadTime = new Date(Date.now());
      if (res.status === 'OK') {
        fileState.setFileAcceptedState(file, uploadTime);
        setFileAccepted(true);
      } else {
        handleUploadErrorAndRejectFile(res);
      }
    };

    const handleUploadErrorAndRejectFile = (res: Partial<{ status: string }>) => {
      if (res.status) {
        errorHandling.handleUploadError(res);
      } else {
        errorHandling.handleGenericError();
      }
      setFileAccepted(false);
      fileState.setFileRejectedState();
    };

    const { getRootProps, getInputProps } = useDropzone({
      maxFiles: 1,
      maxSize: 2097152,
      accept: { 'text/csv': ['.csv'] },
      onFileDialogOpen: () => {
        if (!isCategoryValid()) {
          errorHandling.showCategoryError();
          setFileAccepted(false);
          fileState.setFileRejected(true);
        }
      },
      onDrop: () => fileState.setFileRejected(false),
      onDropAccepted: processFileUpload,
      onDropRejected: (files) => {
        errorHandling.clearErrors();
        const errorKey = files[0].errors[0].code;
        errorHandling.handleDropRejectedError(errorKey);
        fileState.setFileRejectedState();
        setFileAccepted(false);
      },
    });

    const handleContinue = async () => {
      const isValid = await validateForm();
      if (!isValid) {
        handleValidationErrors();
        return;
      }

      await handleFileProcessing();
    };

    const handleValidationErrors = () => {
      if (!isCategoryValid()) {
        handleError('category');
        return;
      }

      if (!fileAccepted) {
        handleError('file');
      }
    };

    const handleError = (type: 'category' | 'file') => {
      if (type === 'category') {
        errorHandling.showCategoryError();
      } else {
        if (errorHandling.alertDescription === '') {
          errorHandling.showMissingFileError();
        }
      }
      fileState.setFileRejected(true);
      setFileAccepted(false);
    };

    const handleFileProcessing = async () => {
      fileState.setFileIsLoading(true);
      errorHandling.clearErrors();

      try {
        await uploadFileAndNavigate();
      } catch (error) {
        handleFileProcessingError();
      }
    };

    const uploadFileAndNavigate = async () => {
      if (!fileState.currentFile) {
        throw new Error('No file available');
      }


      const res = await uploadProductList(
        fileState.currentFile,
        formik.values.category.toUpperCase() as UploadProductListParams['category']
      );

      if (res.status === 200) {
        await delay(1000);
        onExit(() => navigate(buildRoute(ROUTES.OVERVIEW, initiativeId ?? ""), { replace: true }));
      } else {
        handleUploadErrorAndRejectFile(res.data);
      }
    };

    const handleFileProcessingError = () => {
      errorHandling.handleGenericError();
      setFileAccepted(false);
      fileState.setFileRejectedState();
    };

    const resetFileStatus = () => {
      errorHandling.clearErrors();
      fileState.resetFileState();
      setFileAccepted(false);
    };

    const handleInputClick = (e: any) => {
      if (!isCategoryValid()) {
        e.preventDefault();
        errorHandling.showCategoryError();
        setFileAccepted(false);
        fileState.setFileRejected(true);
      }
    };

    const handleSelectChange = (e: any): void => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formik.setFieldValue('category', e.target.value);
      errorHandling.clearErrors();
    };

    return (
      <>
        <Paper
          sx={{
            display: 'grid',
            alignItems: 'baseline',
            background: 'background.paper',
            p: 3,
            pt: 0,
            columnGap: 3,
          }}
        >
          <Box gridColumn="auto" pt={2}>
            <Typography variant="body1" sx={{ gridColumn: 'span 12', fontWeight: 600 }}>
              {t('pages.addProducts.form.categoryLabel')}
            </Typography>

            <FormControl
              sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', mt: 2, mb: 3 }}
              size="small"
            >
              <InputLabel id="category-label">
                {t('pages.addProducts.form.categoryPlaceholder')}
              </InputLabel>
              <Select
                id="category"
                name="category"
                value={formik.values.category}
                labelId="category-label"
                label={t('pages.addProducts.form.categoryPlaceholder')}
                onChange={handleSelectChange}
                error={formik.touched.category && Boolean(formik.errors.category)}
                inputProps={{ 'data-testid': 'selectTimeParam-test' }}
                data-testid="category-label"
              >
                { categories && Object.entries(categories).map(([key, value]) => (
                  <MenuItem
                    key={`category-select-${key}`}
                    value={key}
                    data-testid={`category-option-${key}`}
                  >
                    {value.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText
                error={formik.touched.category && Boolean(formik.errors.category)}
                sx={{ gridColumn: 'span 12' }}
              >
                {formik.touched.category && formik.errors.category}
              </FormHelperText>
            </FormControl>

            <FileUploadSection
              fileRejected={fileState.fileRejected}
              fileIsLoading={fileState.fileIsLoading}
              fileAccepted={fileAccepted}
              fileName={fileState.fileName}
              fileDate={fileState.fileDate}
              alertTitle={errorHandling.alertTitle}
              alertDescription={errorHandling.alertDescription}
              isReport={errorHandling.isReport}
              onDownloadReport={handleDownloadReport}
              onDismissError={() => fileState.setFileRejected(false)}
              onChangeFile={resetFileStatus}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              onInputClick={handleInputClick}
              formikCategory={formik.values.category}
              csvTemplate={categories?.[formik.values.category]?.csv}
              t={t}
            />
          </Box>
        </Paper>
        <Box
          sx={{
            display: 'flex',
            gridColumn: 'span 12',
            justifyContent: 'space-between',
            paddingTop: 5,
            paddingBottom: 5,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => onExit(() => navigate(buildRoute(ROUTES.OVERVIEW, initiativeId ?? ""), { replace: true }))}
            data-testid="cancel-button-test"
          >
            {t('commons.backBtn')}
          </Button>
          <Button variant="contained" onClick={handleContinue} data-testid="continue-button-test">
            {t('commons.continueBtn')}
          </Button>
        </Box>
      </>
    );
  }
);
export default FormAddProducts;
