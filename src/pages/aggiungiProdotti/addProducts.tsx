import React, {Fragment, useState} from "react";
import {Box, Breadcrumbs, Button, Link, Paper, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {TitleBox} from "@pagopa/selfcare-common-frontend/lib";
import {ButtonNaked} from "@pagopa/mui-italia";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useUnloadEventOnExit} from "@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor";
import {useNavigate} from "react-router-dom";
import ROUTES from "../../routes";
import FormAddProducts from "./formAddProducts";

const AddProducts: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const onExit = useUnloadEventOnExit();
    const [fileAccepted, setFileAccepted] = useState(false);

    return(
        <Fragment>
            <Box sx={{ gridColumn: 'span 12' }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <ButtonNaked
                        component="button"
                        onClick={() => onExit(() => navigate(ROUTES.HOME, { replace: true }))}
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: 'primary.main', fontSize: '1rem', marginBottom: '3px' }}
                        weight="default"
                        data-testid="exit-button-test"
                    >
                        {t('breadcrumbs.exit')}
                    </ButtonNaked>
                    <Typography color="text.primary" variant="body2">
                        {t('breadcrumbs.home')}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {t('breadcrumbs.aggiungiProdotti')}
                    </Typography>
                </Breadcrumbs>
            </Box>

            <Box sx={{ gridColumn: 'span 12' }}>
                <TitleBox
                    title={t('pages.addProducts.title')}
                    mbTitle={2}
                    mtTitle={2}
                    mbSubTitle={5}
                    variantTitle="h4"
                    variantSubTitle="body1"
                    data-testid="title"
                />
            </Box>

            {/* Sezione Carica i tuoi prodotti */}
            <Box sx={{ gridColumn: 'span 12' }}>
                <Paper
                    sx={{
                        display: 'grid',
                        alignItems: 'baseline',
                        background: 'background.paper',
                        p: 3,
                        columnGap: 3,
                    }}
                >
                    <TitleBox
                        title={t('pages.addProducts.boxAddTitle')}
                        mbTitle={2}
                        variantTitle="h5"
                        variantSubTitle="body1"
                        data-testid="title-box-info"
                    />
                    <Box gridColumn="auto" pt={2}>
                        <Typography>
                            {t('pages.addProducts.boxAddText')}
                            <strong>{t('pages.addProducts.boxAddTextProduct')}</strong>
                        </Typography>
                        <Typography>
                            <Link href="">{t('pages.addProducts.goToManual')}</Link>
                        </Typography>
                    </Box>

                    <FormAddProducts fileAccepted={fileAccepted} setFileAccepted={setFileAccepted} />
                </Paper>
                <Box
                    sx={{
                        display: "flex",
                        gridColumn: 'span 12',
                        justifyContent: "space-between",
                        paddingTop: 2
                    }}
                >
                    <Button
                        variant="outlined"
                        sx={{ gridArea: 'cancelBtn', justifySelf: 'end' }}
                        onClick={() => onExit(() => navigate(ROUTES.HOME, { replace: true }))}
                        data-testid="cancel-button-test"
                    >
                        {t('commons.backBtn')}
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ gridArea: 'exitBtn', justifySelf: 'end' }}
                        onClick={(e)=>(console.log(e))}
                        data-testid="exit-button-test"
                        disabled={!fileAccepted}
                    >
                        {t('commons.confirmBtn')}
                    </Button>
                </Box>
            </Box>
        </Fragment>
    );
};

export default AddProducts;