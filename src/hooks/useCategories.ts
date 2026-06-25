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

const resolveCategoryTemplateValue = (
  normalizedKey: string,
  templatesCategories?: Record<string, any>,
  useNameAsCategoryValue?: boolean
): string => {
  if (!useNameAsCategoryValue) {
    return normalizedKey;
  }
  return (
    templatesCategories?.[normalizedKey]?.name ??
    templatesCategories?.[normalizedKey.toLowerCase()]?.name ??
    normalizedKey
  );
};

const resolveTemplateFileName = (
  normalizedKey: string,
  templatesCategories?: Record<string, any>
): string => {
  const configuredFileName =
    templatesCategories?.[normalizedKey]?.fileName ??
    templatesCategories?.[normalizedKey.toLowerCase()]?.fileName;
  if (typeof configuredFileName === 'string' && configuredFileName.trim().length > 0) {
    return configuredFileName;
  }
  return `${normalizedKey}_template.csv`;
};

const resolveLabel = (
  isNew: boolean,
  category: any,
  normalizedKey: string,
  t: (key: string) => string,
  templatesCategories?: Record<string, any>
): string => {
  const labelKey = isNew ? category.labelKey : `categories.${normalizedKey.toLowerCase()}.label`;
  const translated = t(labelKey);
  const resolvedFromTranslation =
    translated && translated !== labelKey ? translated : undefined;
  const resolvedFromTemplate = templatesCategories?.[normalizedKey]?.name;
  return resolvedFromTranslation ?? resolvedFromTemplate ?? normalizedKey;
};

const buildCategoryEntry = (
  key: string,
  category: any,
  formats: TemplatesConfig | undefined,
  t: (key: string) => string,
  templatesCategories?: Record<string, any>,
  useNameAsCategoryValue?: boolean
): [string, CategoryType] | null => {
  const normalizedKey = key.toUpperCase();
  const isNew = !!category?.labelKey;
  const enabledUpload = isNew ? category?.enabledIn?.upload !== false : true;
  if (!enabledUpload) {
    return null;
  }

  const label = resolveLabel(isNew, category, normalizedKey, t, templatesCategories);

  const templateFormat: FormatKey = isNew
    ? category.templateFormat
    : (category?.format as FormatKey);

  const templateContent = formats?.[templateFormat];
  if (!templateContent) {
    return [normalizedKey, { label }];
  }

  const categoryTemplateValue = resolveCategoryTemplateValue(
    normalizedKey,
    templatesCategories,
    useNameAsCategoryValue
  );
  const csvNamespace = applyTemplateValues(templateContent, categoryTemplateValue);
  const csvFile = createCsv(csvNamespace);

  return [
    normalizedKey,
    {
      label,
      csv: {
        name: resolveTemplateFileName(normalizedKey, templatesCategories),
        file: csvFile,
      },
    },
  ];
};

const buildCategories = (
  categoriesConfig: any,
  formats: TemplatesConfig | undefined,
  t: (key: string) => string,
  templatesCategories?: Record<string, any>,
  useNameAsCategoryValue?: boolean
): Record<string, CategoryType> => {
  if (!categoriesConfig) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(categoriesConfig as Record<string, any>)
      .map(([key, category]) =>
        buildCategoryEntry(
          key,
          category,
          formats,
          t,
          templatesCategories,
          useNameAsCategoryValue
        )
      )
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

  const templatesCategories = (config?.templates?.categories as Record<string, any>) || {};
  const useNameAsCategoryValue = Boolean(
    (config?.templates as any)?.useNameAsCategoryValue
  );
  const categories = buildCategories(
    categoriesConfig,
    formats,
    t,
    templatesCategories,
    useNameAsCategoryValue
  );

  return { categories };
};
