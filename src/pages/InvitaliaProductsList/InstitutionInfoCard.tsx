import {Box, Paper, Tooltip, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useSelector} from "react-redux";
import {truncateString} from "../../helpers";
import {InstitutionResponse} from "../../api/generated/register/InstitutionResponse";
import {getInstitutionById} from "../../services/registerService";
import {institutionSelector} from "../../redux/slices/invitaliaSlice";

const InstitutionInfoCard: React.FC = () => {
    const { t } = useTranslation();
    const institution = useSelector(institutionSelector);
    const [institutionInfo, setInstitutionInfo] = useState<InstitutionResponse | null>(null);

    const fetchInstitution = async () => {
        try {
            const data = await getInstitutionById(institution?.institutionId || '');
            setInstitutionInfo(data);
        } catch (error) {
            console.error("Errore nel recupero dei dati dell'istituzione:", error);
        }
    };

    useEffect(() => {
        void fetchInstitution();
    }, []);

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
                        { label: 'ragioneSociale', value: institutionInfo?.description, truncate: true },
                        {
                            label: 'sedeLegale',
                            value: institutionInfo?.address,
                            truncate: true,
                        },
                        { label: 'codiceFiscale', value: institutionInfo?.fiscalCode, truncate: true },
                        {
                            label: 'pec',
                            value: institutionInfo?.digitalAddress,
                            truncate: true,
                        },
                        { label: 'piva', value: institutionInfo?.vatNumber, truncate: true },
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
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ gridColumn: 'span 3' }}>
                                {t(`pages.invitaliaProductsList.${label}`)}
                            </Typography>
                            {truncate && value ? (
                                <Tooltip title={value}>
                                    <Typography
                                        variant="body2"
                                        sx={{ cursor: 'pointer', fontWeight: '600', gridColumn: 'span 9' }}
                                        noWrap
                                    >
                                        {truncateString(value)}
                                    </Typography>
                                </Tooltip>
                            ) : (
                                <Typography variant="body2" sx={{ fontWeight: '600', gridColumn: 'span 9' }} noWrap>
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