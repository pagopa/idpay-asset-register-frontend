import { useTranslation } from 'react-i18next';
import { createCsv } from '../helpers';

type CategoryType = {
    label: string;
    csv: string;
};

export const useCategories = (selectedInitiative: string) => {
    const { t } = useTranslation();
    const namespace = t(`${selectedInitiative}.categories`, { returnObjects: true });
    const categories: Record<string, CategoryType> = Object.entries(namespace).reduce((acc, [key, value]) => {
        const isNotCookinghobs = selectedInitiative === "bonusElettrodomestici" && key !== "cookinghobs";
        const csvNamespace = t(`${selectedInitiative}.${isNotCookinghobs ? "eprel" : "csv"}`, { returnObjects: true, category: value }) as { headers: Array<string>; fields: Array<string> };
        const csvFile = createCsv(csvNamespace);
        return { ...acc, [key]: { label: value, csv: { name: `${isNotCookinghobs ? "eprel" : key}_template.csv`, file: csvFile } } };
    }, {});
    return { categories };
};