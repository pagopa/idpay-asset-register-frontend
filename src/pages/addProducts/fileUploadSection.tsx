import {Box, FormHelperText, Link} from "@mui/material";
import LoadingFile from "../../components/LoadingFile/LoadingFile";
import AcceptedFile from "../../components/AcceptedFile/AcceptedFile";
import RejectedFile from "../../components/RejectedFile/RejectedFile";
import {initUploadBoxStyle, initUploadHelperBoxStyle} from "../../helpers";
import InitUploadBox from "../../components/InitUploadBox/InitUploadBox";

const FileUploadSection = ({
                               fileRejected,
                               fileIsLoading,
                               fileAccepted,
                               fileName,
                               fileDate,
                               alertTitle,
                               alertDescription,
                               isReport,
                               onDownloadReport,
                               onDismissError,
                               onChangeFile,
                               getRootProps,
                               getInputProps,
                               onInputClick,
                               formikCategory,
                               templateFileName,
                               t
                           }: any) => {

    if (fileIsLoading) {
        return <LoadingFile message={t('pages.addProducts.form.fileUpload.fileIsLoading')} />;
    }

    if (fileAccepted) {
        return (
            <AcceptedFile
                fileName={fileName}
                fileDate={fileDate}
                chipLabel={t('pages.addProducts.form.fileUpload.validFile')}
                buttonLabel={t('pages.addProducts.form.fileUpload.changeFile')}
                buttonHandler={onChangeFile}
            />
        );
    }

    return (
        <Box>
            {fileRejected && (alertTitle || alertDescription)  && (
                <Box pb={3}>
                    <RejectedFile
                        title={alertTitle}
                        description={alertDescription}
                        isReport={isReport}
                        onDownloadReport={onDownloadReport}
                        dismissFn={onDismissError}
                    />
                </Box>
            )}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                }}
            >
                <Box sx={initUploadBoxStyle} {...getRootProps({ className: 'dropzone' })}>
                    <input
                        {...getInputProps()}
                        data-testid="drop-input"
                        onClick={onInputClick}
                    />
                    <InitUploadBox
                        text={t('pages.addProducts.form.fileUpload.dragAreaText')}
                        link={t('pages.addProducts.form.fileUpload.dragAreaLink')}
                    />
                </Box>
                {formikCategory !== '' && (
                    <Box sx={initUploadHelperBoxStyle}>
                        <FormHelperText sx={{ fontSize: '0.875rem' }}>
                            {t('pages.addProducts.form.fileUpload.fileUploadHelpText')}&#160;
                            <Link
                                href={formikCategory ? `${templateFileName}` : undefined}
                                download={!!formikCategory}
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
                )}
            </Box>
        </Box>
    );
};

export default FileUploadSection;