import { isObject } from '@mui/x-data-grid/internals';
import { createCsv } from '../helpers';
import useScopedTranslation from './useScopedTranslation';

type CategoryType = {
    label: string;
    csv: string;
};

type TemplateType = {
    type: "csv" | "eprel";
    name: string;
};

type ConfigType = {
    label: string;
    template: TemplateType;
};

export const useCategories = () => {
    const { t } = useScopedTranslation();
    const namespace = t("categories", { returnObjects: true}) as Record<string, ConfigType>;
    const categories: Record<string, CategoryType> = isObject(namespace) ? Object?.entries(namespace).reduce((acc, [key, value]) => {
        const csvNamespace = t(`${value.template.type}`, { returnObjects: true, category: value.label }) as { headers: Array<string>; fields: Array<string> };
        const csvFile = createCsv(csvNamespace);
        return { ...acc, [key]: { label: value.label, csv: { name: `${value.template.name}_template`, file: csvFile } } };
    }, {}) : [];
    return { categories };
};