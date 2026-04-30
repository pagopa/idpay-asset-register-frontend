import { useTranslation } from 'react-i18next';

type CategoryType = {
    label: string;
    csv: string;
};

export const useCategories = (selectedInitiative: string) => {
    const { t } = useTranslation();
    const namespace = t("commons.categories", { returnObjects: true });
    const categories: Record<string, CategoryType> = Object.entries(namespace).reduce((acc, [key, value]) => {
        const csvName = `${key === "cookinghobs" ? key : selectedInitiative}_template.csv`;
        return { ...acc, [key]: { label: value, csv: csvName } };
    }, {});
    return { categories };
};