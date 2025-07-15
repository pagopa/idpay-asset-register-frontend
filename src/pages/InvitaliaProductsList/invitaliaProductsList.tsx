import React from "react";
import {Box, Breadcrumbs, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {ButtonNaked} from "@pagopa/mui-italia";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useUnloadEventOnExit} from "@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {TitleBox} from "@pagopa/selfcare-common-frontend/lib";
import {BASE_ROUTE} from "../../routes";
import {institutionSelector} from "../../redux/slices/invitaliaSlice";
import InstitutionInfoCard from "./InstitutionInfoCard";

const InvitaliaProductsList: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const onExit = useUnloadEventOnExit();
    const institutionName = useSelector(institutionSelector);
    
    return(
        <Box pt={"16px"} pl={"8px"}>
            <Box sx={{ display: "flex", gridColumn: 'span 12', alignItems: 'center'}}>
                <ButtonNaked
                    component="button"
                    onClick={() => onExit(() => navigate(BASE_ROUTE, { replace: true }))}
                    startIcon={<ArrowBackIcon />}
                    sx={{ color: 'primary.main', fontSize: '1rem', marginBottom: '3px', marginRight: '8px', fontWeight: 700 }}
                    weight="default"
                    data-testid="exit-button-test"
                >
                    {t('breadcrumbs.back')}
                </ButtonNaked>
                <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '3px', marginRight: '8px' }} >
                    <Typography color="text.primary" variant="body2">
                        {t('breadcrumbs.home')}
                    </Typography>
                    <Typography color="text.primary" variant="body2" sx={{ fontWeight: 600}}>
                        {institutionName}
                    </Typography>
                </Breadcrumbs>
            </Box>

            <Box sx={{ gridColumn: 'span 12' }}>
                <TitleBox
                    title={institutionName}
                    mbTitle={5}
                    mtTitle={4}
                    mbSubTitle={5}
                    variantTitle="h4"
                    variantSubTitle="body1"
                    data-testid="title"
                />
            </Box>

            <InstitutionInfoCard />
        </Box>
    );
};

export default InvitaliaProductsList;