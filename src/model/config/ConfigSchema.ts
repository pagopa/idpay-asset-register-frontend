export interface ColumnConfig {
  id: string;
  labelKey: string;
  sortable?: boolean;
}

export interface FilterConfig {
  id: string;
  type: 'select' | 'text';
  labelKey?: string;
  defaultValue?: string;
  regEx?: string;
  message?: string;
  inputProps?: Record<string, unknown>;
  options?: Record<string, { labelKey: string }>;
  filtersBehavior?: {
    statusOptionsByRole?: Record<string, Array<string>>;
  };
}

export interface DetailFieldConfig {
  id: string;
  labelKey?: string;
}

export interface ProductTableConfig {
  style?: {
    maxTableHeight: number;
    lengths: {
      detail: number;
      minTable: number;
      maxTable: number;
    };
  };

  pagination?: {
    enabled: boolean;
    defaultRowsPerPage: number;
    rowsPerPageOptions: Array<number>;
  };

  organizationSource?: 'user' | 'filter';

  selection?: {
    enabled?: boolean;
    rules?: Record<string, Array<string>>;
  };

  statusBehavior?: Record<
    string,
    {
      requiresAdmin?: boolean;
      allowBulkAction?: boolean;
    }
  >;

  defaultFiltersByRole?: Record<string, Record<string, string>>;

  columns: Array<ColumnConfig>;
  filters?: Array<FilterConfig>;
  detail?: {
    fields: Array<DetailFieldConfig>;
  };
}

export interface HistoryUploadTableConfig {
  functions?: {
    enableDownloadReport?: boolean;
  };
}

export interface OverviewInfoTableConfig {
  functions?: {
    enableModifyEmail?: boolean;
  };
}

export interface InitiativeUIConfig {
  resolutionUpscaling?: number;
  tables: {
    products: ProductTableConfig;
    historyUpload?: HistoryUploadTableConfig;
    overviewInfo?: OverviewInfoTableConfig;
  };
}

export interface RolesConfig {
  name: string;
  logicalName: string;
  subRoles: Record<
    string,
    {
      logicalName: string;
      permissions: {
        tables: Array<string>;
      };
    }
  >;
  errors?: {
    profileNotConfigured?: string;
  };
}

export interface TemplateCategoryConfig {
  format?: 'csv' | 'eprel';
  name?: string;
  fileName?: string;
}

export interface TemplatesConfig {
  useNameAsCategoryValue?: boolean;
  categories?: Record<string, TemplateCategoryConfig>;
  formats?: Record<string, unknown>;
  functions?: {
    enableTemplateUpload?: boolean;
  };
}

export interface ValidationConfig {
  operativeEmail?: {
    regEx: string;
  };
}


export interface InitiativeConfig {
  roles: RolesConfig;
  categories?: Record<
    string,
    {
      labelKey: string;
      templateFormat: 'csv' | 'eprel';
      enabledIn?: { upload?: boolean; filters?: boolean };
    }
  >;
  templates?: TemplatesConfig;
  validation?: ValidationConfig;
  ui: InitiativeUIConfig;
}

export interface LegacyInitiativeConfig {
  role?: string;
  logicalName?: string;
  subRoles?: RolesConfig['subRoles'];
  errors?: RolesConfig['errors'];
  templates?: TemplatesConfig;
  validation?: ValidationConfig;
  tables?: {
    products: ProductTableConfig;
    historyUpload?: HistoryUploadTableConfig;
    overviewInfo?: OverviewInfoTableConfig;
  };
}
