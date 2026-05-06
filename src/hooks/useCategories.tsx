import { useTranslation } from 'react-i18next';

type CategoryType = {
    label: string;
    csv: string;
};

export const useCategories = (selectedInitiative: string) => {
    const { t } = useTranslation();
    const namespace = t(`${selectedInitiative}.categories`, { returnObjects: true });
    const categories: Record<string, CategoryType> = Object.entries(namespace).reduce((acc, [key, value]) => {
        const isNotCookinghobs = selectedInitiative === "bonusElettrodomestici" && key !== "cookinghobs";
        return { ...acc, [key]: { label: value, csv: `${selectedInitiative}/${isNotCookinghobs ? "eprel" : key}_template.csv` } };
    }, {});
    return { categories };
};