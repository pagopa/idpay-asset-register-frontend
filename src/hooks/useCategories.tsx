import { isObject } from '@mui/x-data-grid/internals';
import { createCsv } from '../helpers';
import useScopedTranslation from './useScopedTranslation';

type CategoryType = {
    label: string;
    csv: string;
};

export const useCategories = () => {
    const { t, initiativeName } = useScopedTranslation();
    const namespace = t("categories", { returnObjects: true}) as Record<string, string>;
    const categories: Record<string, CategoryType> = isObject(namespace) ? Object?.entries(namespace).reduce((acc, [key, value]) => {
        const formattedValue = value.toLowerCase().replace(/[ ,]+/g, '-');
        const isEprel = initiativeName === "bonusElettrodomestici2025";
        const isNotCookinghobs = key !== "cookinghobs";
        const csvNamespace = t(`${isNotCookinghobs && isEprel ? "eprel" :  "csv"}`, { returnObjects: true, category: value }) as { headers: Array<string>; fields: Array<string> };
        const csvFile = createCsv(csvNamespace);
        const csvName = isEprel && isNotCookinghobs ? "eprel" : isNotCookinghobs ? formattedValue : key;
        return { ...acc, [key]: { label: value, csv: { name: `${csvName}_template.csv`, file: csvFile } } };
    }, {}) : [];
    return { categories };
};