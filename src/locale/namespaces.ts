export type InitiativeDescriptor = {
  initiativeId: string;
  initiativeName: string;
};

export enum LocaleNamespace {
  Common = 'common',

  DefaultCopy = 'default/copy',

  InitiativeCopy = 'initiative/copy',
}

export const initiativeNamespaceGenerator = (initiativesList: Array<InitiativeDescriptor>) =>
  initiativesList.map(({ initiativeName }) => initiativeName);

export const buildScopedNamespaces = (initiativeName?: string) => ({
  common: [LocaleNamespace.Common] as const,
  initiative: initiativeName
    ? ([
        `${initiativeName}/copy`,
      ] as const)
    : ([] as const),
  default: [
    LocaleNamespace.DefaultCopy,
  ] as const,
});
