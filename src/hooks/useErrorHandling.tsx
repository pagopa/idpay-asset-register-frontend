import {useState} from "react";

export const useErrorHandling = (t: any) => {
    const [alertTitle, setAlertTitle] = useState('');
    const [alertDescription, setAlertDescription] = useState<string>('');
    const [isReport, setIsReport] = useState(false);
    const [idReport, setIdReport] = useState('');

    const showCategoryError = () => {
        setAlertTitle('');
        setAlertDescription("Seleziona la categoria dei prodotti che vuoi caricare.");
    };

    const showMissingFileError = () => {
        setAlertDescription(t('pages.addProducts.form.fileUpload.fileUploadError.invalidTypeDescription'));
    };

    const handleUploadError = (res: any) => {
        const errorMessages = {
            'product.invalid.file.extension': {
                title: 'pages.addProducts.form.fileUpload.fileUploadError.invalidTypeTitle',
                description: 'pages.addProducts.form.fileUpload.fileUploadError.invalidTypeDescription'
            },
            'product.invalid.file.maxrow': {
                title: 'pages.addProducts.form.fileUpload.fileUploadError.tooMuchProductsTitle',
                description: 'pages.addProducts.form.fileUpload.fileUploadError.tooMuchProductsDescription'
            },
            'product.invalid.file.header': {
                title: 'pages.addProducts.form.fileUpload.fileUploadError.wrongHeaderTitle',
                description: 'pages.addProducts.form.fileUpload.fileUploadError.wrongHeaderDescription'
            },
            'product.invalid.file.report': {
                title: 'pages.addProducts.form.fileUpload.fileUploadError.multipeErrorsTitle',
                description: 'pages.addProducts.form.fileUpload.fileUploadError.multipleErrorDescription'
            },
            'product.invalid.file.empty': {
                title: 'pages.addProducts.form.fileUpload.fileUploadError.emptyTitle',
                description: 'pages.addProducts.form.fileUpload.fileUploadError.emptyDescription'
            }
        };

        const error = errorMessages[res.errorKey as keyof typeof errorMessages];

        if (error) {
            setAlertTitle(t(error.title));
            setAlertDescription(t(error.description));

            if (res.errorKey === 'product.invalid.file.report') {
                setIsReport(true);
                setIdReport(res?.productFileId.toString());
            }
        } else {
            setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.errorGenericTitle'));
            setAlertDescription(t('pages.addProducts.form.fileUpload.fileUploadError.errorDescription'));
        }
    };

    const handleDropRejectedError = (errorKey: string) => {
        const errorMessages = {
            'file-invalid-type': {
                title: 'pages.addProducts.form.fileUpload.fileUploadError.invalidTypeTitle',
                description: 'pages.addProducts.form.fileUpload.fileUploadError.invalidTypeDescription'
            },
            'file-too-large': {
                title: 'pages.addProducts.form.fileUpload.fileUploadError.fileTooLargeTitle',
                description: 'pages.addProducts.form.fileUpload.fileUploadError.fileTooLargeDescription'
            }
        };

        const error = errorMessages[errorKey as keyof typeof errorMessages];

        if (error) {
            setAlertTitle(t(error.title));
            setAlertDescription(
                errorKey === 'file-too-large'
                    ? t(error.description, { x: 2 })
                    : t(error.description)
            );
        } else {
            setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.errorTitle'));
            setAlertDescription(t('pages.addProducts.form.fileUpload.fileUploadError.errorDescription'));
        }
    };

    const handleGenericError = () => {
        setAlertTitle(t('pages.addProducts.form.fileUpload.fileUploadError.errorGenericTitle'));
        setAlertDescription(t('pages.addProducts.form.fileUpload.fileUploadError.errorDescription'));
    };

    const clearErrors = () => {
        setAlertTitle('');
        setAlertDescription('');
        setIsReport(false);
        setIdReport('');
    };

    return {
        alertTitle,
        alertDescription,
        isReport,
        idReport,
        showCategoryError,
        showMissingFileError,
        handleUploadError,
        handleDropRejectedError,
        handleGenericError,
        clearErrors
    };
};