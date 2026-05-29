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

  columns: Array<ColumnConfig>;
  filters?: Array<FilterConfig>;
  detail?: {
    fields: Array<DetailFieldConfig>;
  };
}

export interface InitiativeUIConfig {
  resolutionUpscaling?: number;
  tables: {
    products: ProductTableConfig;
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

export interface TemplatesConfig {
  categories?: Record<string, unknown>;
  formats?: Record<string, unknown>;
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
  ui: InitiativeUIConfig;
}

export interface LegacyInitiativeConfig {
  role?: string;
  logicalName?: string;
  subRoles?: RolesConfig['subRoles'];
  errors?: RolesConfig['errors'];
  templates?: TemplatesConfig;
  tables?: {
    products: ProductTableConfig;
  };
}
