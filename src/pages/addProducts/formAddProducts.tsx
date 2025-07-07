import {Dispatch, SetStateAction, useState} from "react";
import { useDropzone } from 'react-dropzone';
import {useTranslation} from "react-i18next";
import {Box, FormControl, FormHelperText, InputLabel, Link, MenuItem, Select, Typography} from "@mui/material";
import {useFormik} from "formik";
import * as Yup from 'yup';
import RejectedFile from "../../components/RejectedFile/RejectedFile";
import LoadingFile from "../../components/LoadingFile/LoadingFile";
import AcceptedFile from "../../components/AcceptedFile/AcceptedFile";
import {PRODUCTS_CATEGORY} from "../../utils/constants";
import {initUploadBoxStyle, initUploadHelperBoxStyle} from "../../helpers";
import InitUploadBox from "../../components/InitUploadBox/InitUploadBox";
import {downloadErrorReport, uploadProductList} from "../../services/registerService";
import {categoryList, downloadCsv} from "./helpers";

type Props = {
    fileAccepted: boolean;
    setFileAccepted: Dispatch<SetStateAction<boolean>>;
};

const FormAddProducts = ({fileAccepted, setFileAccepted}: Props) => {
    const { t } = useTranslation();
    const [fileIsLoading, setFileIsLoading] = useState(false);
    const [fileRejected, setFileRejected] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertDescription, setAlertDescription] = useState<string>('');
    const [fileName, setFileName] = useState('');
    const [fileDate, setFileDate] = useState('');
    const [isReport, setIsReport] = useState(false);
    const [idReport, setIdReport] = useState('');

    const validationSchema = Yup.object().shape({
        category: Yup.string().required(t('validation.categoryRequired')),
    });

    const handleDownloadReport = async () => {
        try {
            const res = await downloadErrorReport(idReport);

            downloadCsv(res.data,res.filename);
        } catch (error) {
            console.error('Errore nel download del report:', error);
        }
    };

    const formik = useFormik({
        initialValues: {
            category: "",
        },
        validateOnMount: true,
        validateOnChange: true,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values) => {
            console.log(values);
        },
    });

    const isCategoryValid = !formik.errors.category && formik.values.category !== '';

    const templateFileName =
        formik.values.category === PRODUCTS_CATEGORY.COOKINGHOBS
            ? 'cookinghobs_template.csv'
            : 'eprel_template.csv';

    const setIntiStatus = () => {
        setAlertTitle('');
        setAlertDescription('');
        setFileName('');
        setFileDate('');
        setFileIsLoading(false);
        setFileRejected(false);
        setFileAccepted(false);
    };


    const { getRootProps, getInputProps } = useDropzone({
        maxFiles: 1,
        maxSize: 2097152,
        accept: {
            'text/csv': ['.csv']
        },
        onFileDialogOpen: async () => {
            await formik.setFieldTouched('category', true, true);
            await formik.validateField('category');

            if (formik.errors.category || !formik.values.category) {
                return;
            }
        },
        onDrop: () => {
            setFileRejected(false);
        },
        onDropAccepted: async (files) => {
            if (!isCategoryValid) {
                return;
            }
            setFileIsLoading(true);

            uploadProductList( files[0], formik.values.category)
                .then((res : any) => {
                    if (res.status === 'OK') {
                        setFileName(files[0].name);
                        const dateField =
                            Object.prototype.toString.call(files[0].lastModified) === '[object Date]'
                                ? files[0].lastModified
                                : new Date();
                        const fileDate = dateField && dateField.toLocaleString('fr-BE');
                        setFileDate(fileDate || '');
                        setFileIsLoading(false);
                        setFileRejected(false);
                        setFileAccepted(true);
                    } else {
                        switch (res.errorKey) {
                            case 'product.invalid.file.extension':
                                setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.invalidTypeTitle'));
                                setAlertDescription(t('pages.addProducts.form.fileUpload.fileUploadError.invalidTypeDescription'));
                                break;
                            case 'product.invalid.file.maxrow':
                                setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.tooMuchProductsTitle'));
                                setAlertDescription(t('pages.addProducts.form.fileUpload.fileUploadError.tooMuchProductsDescription'));
                                break;
                            case 'product.invalid.file.header':
                                setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.wrongHeaderTitle'));
                                setAlertDescription(t('pages.addProducts.form.fileUpload.fileUploadError.wrongHeaderDescription'));
                                break;
                            case 'product.invalid.file.report':
                                setIsReport(true);
                                setIdReport(res.productFileId.toString());
                                setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.multipeErrorsTitle'));
                                setAlertDescription(
                                    t('pages.addProducts.form.fileUpload.fileUploadError.multipleErrorDescription')
                                );
                                break;
                            case 'product.invalid.file.empty':
                                setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.emptyTitle'));
                                setAlertDescription(t('pages.addProducts.form.fileUpload.fileUploadError.emptyDescription'));
                                break;
                            default:
                                setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.errorGenericTitle'));
                                setAlertDescription(
                                    t('pages.addProducts.form.fileUpload.fileUploadError.multipleErrorDescription')
                                );
                                break;
                        }
                        setFileIsLoading(false);
                        setFileAccepted(false);
                        setFileRejected(true);
                    }
                })
                .catch((_error: any) => {
                    setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.errorGenericTitle'));
                    setAlertDescription(t('pages.addProducts.form.fileUpload.fileUploadError.errorDescription'));
                    setFileIsLoading(false);
                    setFileAccepted(false);
                    setFileRejected(true);
                });
        },
        onDropRejected: (files) => {
            const errorKey = files[0].errors[0].code;
            switch (errorKey) {
                case 'file-invalid-type':
                    setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.invalidTypeTitle'));
                    setAlertDescription(t('pages.addProducts.form.fileUpload.fileUploadError.invalidTypeDescription'));
                    break;
                case 'file-too-large':
                    setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.fileTooLargeTitle'));
                    setAlertDescription(
                        t('pages.addProducts.form.fileUpload.fileUploadError.fileTooLargeDescription', { x: 2 })
                    );
                    break;
                default:
                    setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.errorTitle'));
                    setAlertDescription(t('pages.addProducts.form.fileUpload.fileUploadError.errorDescription'));
                    break;
            }
            setFileIsLoading(false);
            setFileRejected(true);
            setFileAccepted(false);
        },
    });

    const InitStatusPartial = (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
            }}
        >
            <Box sx={initUploadBoxStyle} {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} data-testid="drop-input" onClick={async (e) => {
                    if (!isCategoryValid) {
                        e.preventDefault();
                        await formik.setFieldTouched('category', true, true);
                        await formik.validateField('category');
                    }
                }}/>
                <InitUploadBox
                    text={t('pages.addProducts.form.fileUpload.dragAreaText')}
                    link={t('pages.addProducts.form.fileUpload.dragAreaLink')}
                />
            </Box>
            { formik.values.category !== '' &&
                <Box sx={initUploadHelperBoxStyle}>
                    <FormHelperText sx={{ fontSize: '0.875rem' }}>
                        {t('pages.addProducts.form.fileUpload.fileUploadHelpText')}&#160;
                            <Link
                                href={formik.values.category ? `/${templateFileName}` : undefined}
                                download={!!formik.values.category}
                                type="text/csv"
                                target="_blank"
                                variant="body2"
                                sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                }}
                            >
                                {t('pages.addProducts.form.fileUpload.fileUploadHelpLinkLabel')}
                            </Link>
                    </FormHelperText>
                </Box>
            }
        </Box>
    );

    return(
        <Box gridColumn="auto" pt={2}>
            <Typography variant="body1" sx={{ gridColumn: 'span 12', fontWeight: 600 }}>
                {t('pages.addProducts.form.categoryLabel')}
            </Typography>

            {/* Select Input */}
            <FormControl
                sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', mt: 2, mb: 3 }}
                size="small"
            >
                <InputLabel id="select-time-parameter">
                    {t('pages.addProducts.form.categoryPlaceholder')}
                </InputLabel>
                <Select
                    id="category"
                    name="category"
                    value={formik.values.category}
                    label={t('pages.addProducts.form.categoryPlaceholder')}
                    onChange={(e) => formik.setFieldValue('category', e.target.value)}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                    inputProps={{
                        'data-testid': 'selectTimeParam-test',
                    }}
                >
                    {categoryList.map((el) => (
                        <MenuItem key={`category-select-${el.value}`} value={el.value} data-testid="category-select-id">
                            {t(el.label)}
                        </MenuItem>
                    ))
                    }
                </Select>
                <FormHelperText
                    error={
                        formik.touched.category &&
                        Boolean(formik.errors.category)
                    }
                    sx={{ gridColumn: 'span 12' }}
                >
                    {formik.touched.category && formik.errors.category}
                </FormHelperText>
            </FormControl>

            {/* File Input */}
            {fileRejected && (
                <Box pb={3}>
                    <RejectedFile
                        title={t(alertTitle)}
                        description={alertDescription}
                        isReport={isReport}
                        onDownloadReport={()=>handleDownloadReport()}
                        dismissFn={() => setFileRejected(false)}
                    />
                </Box>
            )}

            {fileIsLoading ? (
                <LoadingFile message={t('pages.addProducts.form.fileUpload.fileIsLoading')} />
            ) : fileAccepted ? (
                <AcceptedFile
                    fileName={fileName}
                    fileDate={fileDate}
                    chipLabel={t('pages.addProducts.form.fileUpload.validFile')}
                    buttonLabel={t('pages.addProducts.form.fileUpload.changeFile')}
                    buttonHandler={setIntiStatus}
                />
            ) : (
                InitStatusPartial
            )}
        </Box>
    );
};

export default FormAddProducts;