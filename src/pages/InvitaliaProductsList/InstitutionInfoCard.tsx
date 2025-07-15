import {Box, Paper, Tooltip, Typography} from "@mui/material";
import React, {useMemo} from "react";
import {useTranslation} from "react-i18next";
import {fetchUserFromLocalStorage, truncateString} from "../../helpers";


const InstitutionInfoCard: React.FC = () => {
    const { t } = useTranslation();
    const user = useMemo(() => fetchUserFromLocalStorage(), []);

    return(
        <Box sx={{ gridColumn: 'span 12' }}>
            <Paper
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    alignItems: 'baseline',
                    background: 'background.paper',
                    p: 3,
                    columnGap: 3,
                }}
            >
                <Typography
                    fontWeight={700}
                    fontSize="14px"
                    lineHeight="100%"
                    letterSpacing="1px"
                    sx={{ gridColumn: 'span 12', paddingBottom: "16px"}}
                >
                    {t('pages.invitaliaProductsList.infoCardTitle').toUpperCase()}
                </Typography>

                <Box
                    sx={{
                        gridColumn: 'span 12',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, 1fr)',
                        rowGap: 2,
                        columnGap: 2
                    }}
                >
                    {[
                        { label: 'overviewTitleBoxInfoTitleLblRs', value: user?.org_name, truncate: true },
                        {
                            label: 'overviewTitleBoxInfoTitleLblCf',
                            value: user?.org_taxcode,
                            truncate: true,
                        },
                        { label: 'overviewTitleBoxInfoTitleLblPiva', value: user?.org_vat, truncate: true },
                        {
                            label: 'overviewTitleBoxInfoTitleLblSl',
                            value: user?.org_address,
                            truncate: true,
                        },
                        { label: 'overviewTitleBoxInfoTitleLblPec', value: user?.org_pec, truncate: true },
                        {
                            label: 'overviewTitleBoxInfoTitleLblEmailOp',
                            value: user?.org_email,
                            truncate: true,
                        },
                    ].map(({ label, value, truncate }) => (
                        <Box
                            key={label}
                            sx={{
                                gridColumn: 'span 6',
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                                flexWrap: 'nowrap',
                                minWidth: 0,
                            }}
                        >
                            <Typography variant="body2" fontWeight={500} noWrap>
                                {t(`pages.overview.${label}`)}:
                            </Typography>
                            {truncate && value ? (
                                <Tooltip title={value}>
                                    <Typography
                                        variant="body2"
                                        sx={{ cursor: 'pointer', fontWeight: '600' }}
                                        noWrap
                                    >
                                        {truncateString(value)}
                                    </Typography>
                                </Tooltip>
                            ) : (
                                <Typography variant="body2" sx={{ fontWeight: '600' }} noWrap>
                                    {value || '-'}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Box>
            </Paper>
        </Box>
    );};

export default InstitutionInfoCard;