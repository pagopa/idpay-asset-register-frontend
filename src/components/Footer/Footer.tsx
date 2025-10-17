import {
    Footer as MuiItaliaFooter,
    FooterLinksType,
    PreLoginFooterLinksType,
} from '@pagopa/mui-italia/dist/components/Footer/Footer';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { LangCode } from '@pagopa/mui-italia';
import i18n from '../../locale/index';
import { LANGUAGES, pagoPALink } from './FooterConfig';

type FooterProps = {
    loggedUser: boolean;
    productsJsonUrl?: string;
    onExit?: (exitAction: () => void) => void;
};
declare const window: any;
// eslint-disable-next-line sonarjs/cognitive-complexity
export default function Footer({
                                   loggedUser,
                                   productsJsonUrl,
                                   onExit = (exitAction) => exitAction(),
                               }: FooterProps) {
    const { t } = useTranslation();

    const currentLangByUrl = new URLSearchParams(window.location.search).get('lang') as LangCode;
    const lang = (currentLangByUrl ? currentLangByUrl : i18n.language) as LangCode;
    const openExternalLink = (url: string | undefined) => window.open(url, '_blank')?.focus();

    useEffect(() => {
        if (lang) {
            void i18n.changeLanguage(lang);
        }
    }, [lang]);

    const preLoginLinks: PreLoginFooterLinksType = {
        // First column
        aboutUs: {
            title: undefined,
            links: [
                {
                    label: t('common.footer.preLoginLinks.aboutUs.links.aboutUs'),
                    href: 'https://www.pagopa.it/it/societa/chi-siamo/',
                    ariaLabel: 'Vai al link: Chi siamo',
                    linkType: 'internal',
                },
                {
                    label: t('common.footer.preLoginLinks.aboutUs.links.media'),
                    href: 'https://www.pagopa.it/it/',
                    ariaLabel: 'Vai al link: Media',
                    linkType: 'internal',
                },
                {
                    label: t('common.footer.preLoginLinks.aboutUs.links.workwithud'),
                    href: 'https://www.pagopa.it/it/lavora-con-noi/',
                    ariaLabel: 'Vai al link: Lavora con noi',
                    linkType: 'internal',
                },
            ],
        },
        // Third column
        resources: {
            title: t('common.footer.preLoginLinks.resources.title'),
            links: [
                {
                    label: t('common.footer.preLoginLinks.resources.links.privacyPolicy'),
                    href: 'https://eie.cstar.pagopa.it/elenco-informatico-elettrodomestici/privacy-policy',
                    ariaLabel: 'Vai al link: Informativa Privacy',
                    linkType: 'internal',
                },
                {
                    label: t('common.footer.preLoginLinks.resources.links.certifications'),
                    href: 'https://www.pagopa.it/it/certificazioni/',
                    ariaLabel: 'Vai al link: Certificazioni',
                    linkType: 'internal',
                },
                {
                    label: t('common.footer.preLoginLinks.resources.links.informationsecurity'),
                    href: 'https://www.pagopa.it/it/politiche-per-la-sicurezza-delle-informazioni/',
                    ariaLabel: 'Vai al link: Sicurezza delle informazioni',
                    linkType: 'internal',
                },
                {
                    label: t('common.footer.preLoginLinks.resources.links.protectionofpersonaldata'),
                    href: 'https://privacyportal-de.onetrust.com/webform/77f17844-04c3-4969-a11d-462ee77acbe1/9ab6533d-be4a-482e-929a-0d8d2ab29df8',
                    ariaLabel: 'Vai al link: Diritto alla protezione dei dati personali',
                    linkType: 'internal',
                },
                {
                    label: t('common.footer.preLoginLinks.resources.links.cookies'),
                    onClick: () => window.OneTrust.ToggleInfoDisplay(),
                    ariaLabel: 'Vai al link: Preferenze Cookie',
                    linkType: 'internal',
                },
                {
                    label: t('common.footer.preLoginLinks.resources.links.termsandconditions'),
                    href: 'https://eie.cstar.pagopa.it/elenco-informatico-elettrodomestici/terms-of-service',
                    ariaLabel: 'Vai al link: Termini e Condizioni',
                    linkType: 'internal',
                },
                {
                    label: t('common.footer.preLoginLinks.resources.links.transparentcompany'),
                    href: 'https://pagopa.portaleamministrazionetrasparente.it/',
                    ariaLabel: 'Vai al link: Società trasparente',
                    linkType: 'internal',
                },
                {
                    label: t('common.footer.preLoginLinks.resources.links.disclosurePolicy'),
                    href: 'https://www.pagopa.it/it/responsible-disclosure-policy/',
                    ariaLabel: 'Vai al link: Responsible Disclosure Policy',
                    linkType: 'internal',
                },
                {
                    label: t('common.footer.preLoginLinks.resources.links.model231'),
                    href: 'https://pagopa.portaleamministrazionetrasparente.it/pagina746_altri-contenuti.html',
                    ariaLabel: 'Vai al link: Modello 231',
                    linkType: 'internal',
                },
            ],
        },
        // Fourth column
        followUs: {
            title: t('common.footer.preLoginLinks.followUs.title'),
            socialLinks: [
                {
                    icon: 'linkedin',
                    title: 'LinkedIn',
                    href: 'https://www.linkedin.com/company/pagopa/',
                    ariaLabel: 'Link: vai al sito LinkedIn di PagoPA S.p.A.',
                },
                {
                    title: 'Twitter',
                    icon: 'twitter',
                    href: 'https://twitter.com/pagopa',
                    ariaLabel: 'Link: vai al sito Twitter di PagoPA S.p.A.',
                },
                {
                    icon: 'instagram',
                    title: 'Instagram',
                    href: 'https://www.instagram.com/pagopaspa/',
                    ariaLabel: 'Link: vai al sito Instagram di PagoPA S.p.A.',
                },
                {
                    icon: 'medium',
                    title: 'Medium',
                    href: 'https://medium.com/pagopa-spa',
                    ariaLabel: 'Link: vai al sito Medium di PagoPA S.p.A.',
                },
            ],
            links: [
                {
                    label: t('common.footer.preLoginLinks.accessibility'),
                    href: 'https://form.agid.gov.it/view/87f46790-9798-11f0-b583-8b5f76942354',
                    ariaLabel: 'Vai al link: Accessibilità',
                    linkType: 'internal',
                },
            ],
        },
    };
    const postLoginLinks: Array<FooterLinksType> = [
        {
            label: t('common.footer.postLoginLinks.privacyPolicy'),
            href: 'https://eie.cstar.pagopa.it/elenco-informatico-elettrodomestici/privacy-policy',
            ariaLabel: 'Vai al link: Informativa Privacy',
            linkType: 'internal',
            onClick: () => openExternalLink('https://eie.cstar.pagopa.it/elenco-informatico-elettrodomestici/privacy-policy'),
        },
        {
            label: t('common.footer.postLoginLinks.protectionofpersonaldata'),
            href: 'https://privacyportal-de.onetrust.com/webform/77f17844-04c3-4969-a11d-462ee77acbe1/9ab6533d-be4a-482e-929a-0d8d2ab29df8',
            ariaLabel: 'Vai al link: Diritto alla protezione dei dati personali',
            linkType: 'internal',
            onClick: () => openExternalLink('https://privacyportal-de.onetrust.com/webform/77f17844-04c3-4969-a11d-462ee77acbe1/9ab6533d-be4a-482e-929a-0d8d2ab29df8'),
        },
        {
            label: t('common.footer.postLoginLinks.termsandconditions'),
            href: 'https://eie.cstar.pagopa.it/elenco-informatico-elettrodomestici/terms-of-service',
            ariaLabel: 'Vai al link: Termini e condizioni',
            linkType: 'internal',
            onClick: () => openExternalLink('https://eie.cstar.pagopa.it/elenco-informatico-elettrodomestici/terms-of-service'),
        },
        {
            label: t('common.footer.postLoginLinks.accessibility'),
            href: 'https://form.agid.gov.it/view/87f46790-9798-11f0-b583-8b5f76942354',
            ariaLabel: 'Vai al link: Accessibilità',
            linkType: 'internal',
            onClick: () => window.open('https://form.agid.gov.it/view/87f46790-9798-11f0-b583-8b5f76942354'),
        },
    ];
    const companyLegalInfo = (
        <span>
            <strong>PagoPA S.p.A.</strong> - Società per azioni con socio unico - Capitale sociale di euro
            1,000,000 interamente versato - Sede legale in Roma, Piazza Colonna 370, <br />
            CAP 00187 - N. di iscrizione a Registro Imprese di Roma, CF e P.IVA 15376371009
        </span>
    );

    return (
        <MuiItaliaFooter
            companyLink={pagoPALink}
            postLoginLinks={postLoginLinks}
            preLoginLinks={preLoginLinks}
            legalInfo={companyLegalInfo}
            loggedUser={loggedUser}
            onExit={onExit}
            languages={LANGUAGES as any}
            onLanguageChanged={async (language: LangCode) => {
                await i18n.changeLanguage(language);
            }}
            currentLangCode={lang}
            productsJsonUrl={productsJsonUrl}
        />
    );
}