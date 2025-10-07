import { Box, Button, Typography } from '@mui/material';
import {useTranslation} from "react-i18next";
import {useUnloadEventOnExit} from "@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor";
import hourGlassIcon from '../../asset/images/hourglass.png';
import {customExitAction} from "../../helpers";
import {UPCOMING_INITIATIVE_DAY} from "../../utils/constants";
import Layout from "../../components/Layout/Layout";

const UpcomingInitiative = () => {
    const { t } = useTranslation();
    const onExit = useUnloadEventOnExit();

    return(
        <Layout>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                gap={3}
                py={1}
            >
                <img src={hourGlassIcon} alt="hourglass icon" width={60} height={60} />

                <Box>
                    <Typography variant="h4" py={1}>{ t('pages.upcomingInitiative.title') }</Typography>
                    <Typography variant="body1" py={1}>
                        { t('pages.upcomingInitiative.subTitle',  {x: UPCOMING_INITIATIVE_DAY}) }
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    sx={{ height: 44, minWidth: 100, mt: 3 }}
                    onClick={() => onExit(customExitAction)}
                >
                    { t('commons.closeBtn')}
                </Button>
            </Box>
        </Layout>
    );
};

export default UpcomingInitiative;