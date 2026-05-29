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

type FormatKey = 'csv' | 'eprel';

type TemplateType = {
  format: FormatKey;
  name: string;
};

type TemplateContentType = {
  headers: Array<string>;
  fields: Array<string>;
};

type CategoryTemplatesConfig = Record<string, TemplateType>;

type TemplatesConfig = Partial<Record<FormatKey, TemplateContentType>>;

const applyTemplateValues = (templateContent: TemplateContentType, category: string) => ({
  headers: templateContent.headers,
  fields: templateContent.fields.map((field) => field.replace('{{category}}', category)),
});

export const useCategories = () => {
  const { t } = useScopedTranslation();
  const { config } = useInitiativeConfig();
  const categoriesConfig = config?.templates?.categories as CategoryTemplatesConfig | undefined;
  const formats = config?.templates?.formats as TemplatesConfig | undefined;

  const categories: Record<string, CategoryType> = categoriesConfig
    ? Object.entries(categoriesConfig).reduce((acc, [key, template]) => {
        const translated = t(`categories.${key}.label`);
        const label = translated && translated !== `categories.${key}.label` ? translated : key;

        const templateContent = formats?.[template.format];

        if (!templateContent) {
          return { ...acc, [key]: { label } };
        }

        const csvNamespace = applyTemplateValues(templateContent, label);
        const csvFile = createCsv(csvNamespace);

        return {
          ...acc,
          [key]: {
            label,
            csv: {
              name: `${template.name}_template.csv`,
              file: csvFile,
            },
          },
        };
      }, {})
    : {};

  return { categories };
};
