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

type TemplateContentType = {
  headers: Array<string>;
  fields: Array<string>;
};

type TemplatesConfig = Partial<Record<FormatKey, TemplateContentType>>;

const applyTemplateValues = (templateContent: TemplateContentType, category: string) => ({
  headers: templateContent.headers,
  fields: templateContent.fields.map((field) => field.replace('{{category}}', category)),
});

const buildCategories = (
  categoriesConfig: any,
  formats: TemplatesConfig | undefined,
  t: (key: string) => string
): Record<string, CategoryType> => {
  if (!categoriesConfig) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(categoriesConfig as Record<string, any>)
      .map(([key, category]) => {
        const normalizedKey = key.toUpperCase();
        const isNew = !!category?.labelKey;
        const enabledUpload = isNew ? category?.enabledIn?.upload !== false : true;
        if (!enabledUpload) {
          return null;
        }

        const labelKey = isNew
          ? category.labelKey
          : `categories.${normalizedKey.toLowerCase()}.label`;
        const translated = t(labelKey);
        const label = translated && translated !== labelKey ? translated : normalizedKey;

        const templateFormat: FormatKey = isNew
          ? category.templateFormat
          : (category?.format as FormatKey);

        const templateContent = formats?.[templateFormat];
        if (!templateContent) {
          return [normalizedKey, { label }];
        }

        const csvNamespace = applyTemplateValues(templateContent, label);
        const csvFile = createCsv(csvNamespace);

        return [
          normalizedKey,
          {
            label,
            csv: {
              name: `${normalizedKey}_template.csv`,
              file: csvFile,
            },
          },
        ];
      })
      .filter(Boolean) as Array<[string, CategoryType]>
  );
};

export const useCategories = () => {
  const { t } = useScopedTranslation();
  const { config } = useInitiativeConfig();

  const categoriesConfig =
    ((config as any)?.categories as
      | Record<
          string,
          {
            labelKey: string;
            templateFormat: FormatKey;
            enabledIn?: { upload?: boolean; filters?: boolean };
          }
        >
      | undefined) ?? (config?.templates?.categories as any);

  const formats = config?.templates?.formats as TemplatesConfig | undefined;

  const categories = buildCategories(categoriesConfig, formats, t);

  return { categories };
};
