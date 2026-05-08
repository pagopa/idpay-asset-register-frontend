import { isObject } from '@mui/x-data-grid/internals';
import { createCsv } from '../helpers';
import useScopedTranslation from './useScopedTranslation';

type CategoryType = {
    label: string;
    csv: string;
};

export const useCategories = () => {
    const { t } = useScopedTranslation();
    const namespace = t("categories", { returnObjects: true}) as Record<string, string>;
    const categories: Record<string, CategoryType> = isObject(namespace) ? Object?.entries(namespace).reduce((acc, [key, value]) => {
        const formattedValue = value.toLowerCase().replace(/[ ,]+/g, '-');
        const isEprel = !!namespace?.eprel;
        const isNotCookinghobs = key !== "cookinghobs";
        const csvNamespace = t(`${isNotCookinghobs && isEprel ? "eprel" :  "csv"}`, { returnObjects: true, category: value }) as { headers: Array<string>; fields: Array<string> };
        const csvFile = createCsv(csvNamespace);
        return { ...acc, [key]: { label: value, csv: { name: `${isNotCookinghobs && isEprel ? "eprel" : isNotCookinghobs ? formattedValue : key}_template.csv`, file: csvFile } } };
    }, {}) : [];
    return { categories };
};