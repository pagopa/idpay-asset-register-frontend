import { isObject } from '@mui/x-data-grid/internals';
import { createCsv } from '../helpers';
import useScopedTranslation from './useScopedTranslation';
import { useInitiativeConfig } from './useInitiativeConfig';

type CategoryType = {
    label: string;
    csv?: {
      name: string;
      file: string;
    };
};

type TemplateType = {
    type: "csv" | "eprel";
    name: string;
};

type CopyCategoryType = {
    label: string;
};

type TemplateContentType = {
    headers: Array<string>;
    fields: Array<string>;
};

type CategoryTemplatesConfig = Record<string, TemplateType>;

type TemplatesConfig = Partial<Record<TemplateType['type'], TemplateContentType>>;

const getCategoryLabel = (value: string | CopyCategoryType) =>
    isObject(value) && 'label' in value ? String(value.label) : String(value);

const applyTemplateValues = (templateContent: TemplateContentType, category: string) => ({
    headers: templateContent.headers,
    fields: templateContent.fields.map((field) => field.replace('{{category}}', category)),
});

export const useCategories = () => {
    const { t } = useScopedTranslation();
    const { config } = useInitiativeConfig();
    const namespace = t('categories', { returnObjects: true }) as Record<
        string,
        string | CopyCategoryType
    >;
    const categoryTemplates = config?.categoryTemplates as CategoryTemplatesConfig | undefined;
    const templates = config?.templates as TemplatesConfig | undefined;
    const categories: Record<string, CategoryType> = isObject(namespace)
        ? Object?.entries(namespace).reduce((acc, [key, value]) => {
            const label = getCategoryLabel(value);
            const template = categoryTemplates?.[key];
            const templateContent = template ? templates?.[template.type] : undefined;

            if (!template || !templateContent) {
              return { ...acc, [key]: { label } };
            }

            const csvNamespace = applyTemplateValues(templateContent, label);
            const csvFile = createCsv(csvNamespace);
            return {
                ...acc,
                [key]: { label, csv: { name: `${template.name}_template.csv`, file: csvFile } },
            };
    }, {})
    : {};
  return { categories };
};
