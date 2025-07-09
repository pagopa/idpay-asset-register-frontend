import React, {useRef, useState} from "react";
import {Box, Breadcrumbs, Button, Link, Paper, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {TitleBox} from "@pagopa/selfcare-common-frontend/lib";
import {ButtonNaked} from "@pagopa/mui-italia";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useUnloadEventOnExit} from "@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor";
import {useNavigate} from "react-router-dom";
import ROUTES, {BASE_ROUTE} from "../../routes";
import FormAddProducts, {FormAddProductsRef} from "./formAddProducts";

const AddProducts: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const onExit = useUnloadEventOnExit();
    const [fileAccepted, setFileAccepted] = useState(false);
    const formRef = useRef<FormAddProductsRef>(null);

    const handleContinue = async () => {
        if (formRef.current) {
            const isValid = await formRef.current.validateForm();
            if (isValid) {
                onExit(() => navigate(ROUTES.HOME, { replace: true }));
            }
        }
    };

    return(
        <Box pb={0}>
            <Box sx={{ display: "flex", gridColumn: 'span 12', alignItems: 'center', marginTop: 5}}>
                <ButtonNaked
                    component="button"
                    onClick={() => onExit(() => navigate(BASE_ROUTE, { replace: true }))}
                    startIcon={<ArrowBackIcon />}
                    sx={{ color: 'primary.main', fontSize: '1rem', marginBottom: '3px', marginRight: '8px', fontWeight: 700 }}
                    weight="default"
                    data-testid="exit-button-test"
                >
                    {t('breadcrumbs.exit')}
                </ButtonNaked>
                <Breadcrumbs aria-label="breadcrumb" >
                    <Typography color="text.primary" variant="body2">
                        {t('breadcrumbs.home')}
                    </Typography>
                    <Typography color="text.disabled" variant="body2">
                        {t('breadcrumbs.aggiungiProdotti')}
                    </Typography>
                </Breadcrumbs>
            </Box>

            <Box sx={{ gridColumn: 'span 12' }}>
                <TitleBox
                    title={t('pages.addProducts.title')}
                    mbTitle={5}
                    mtTitle={5}
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
                        variantTitle="h6"
                        data-testid="title-box-info"
                        titleFontSize="24px"
                    />
                    <Box gridColumn="auto" pt={2}>
                        <Typography>
                            {t('pages.addProducts.boxAddText')}
                            <strong>{t('pages.addProducts.boxAddTextProduct')}</strong>
                        </Typography>
                        <Typography letterSpacing={"0.3px"} fontWeight={700}>
                            <Link href="">{t('pages.addProducts.goToManual')}</Link>
                        </Typography>
                    </Box>

                    <FormAddProducts
                        ref={formRef}
                        fileAccepted={fileAccepted}
                        setFileAccepted={setFileAccepted}
                    />
                </Paper>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    gridColumn: 'span 12',
                    justifyContent: "space-between",
                    paddingTop: 5,
                    paddingBottom: 5
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
                    onClick={handleContinue}
                    data-testid="exit-button-test"
                >
                    {t('commons.continueBtn')}
                </Button>
            </Box>
        </Box>
    );
};

export default AddProducts;