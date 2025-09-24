import { Box, Button, Typography } from '@mui/material';
import {useTranslation} from "react-i18next";
import {useUnloadEventOnExit} from "@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor";
import hourGlassIcon from '../../asset/images/hourglass.png';
import {ENV} from "../../utils/env";
import {customExitAction} from "../../helpers";

const UpcomingInitiative = () => {
    const { t } = useTranslation();
    const onExit = useUnloadEventOnExit();

    return(
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
                    { t('pages.upcomingInitiative.subTitle',  {x: ENV.UPCOMING_INITIATIVE_DAY}) }
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
    );
};

export default UpcomingInitiative;