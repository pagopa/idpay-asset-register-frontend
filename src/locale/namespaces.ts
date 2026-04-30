export type InitiativeDescriptor = {
  initiativeId: string;
  initiativeName: string;
};

export enum LocaleNamespace {
  Common = 'common',

  DefaultCopy = 'default/copy',
  DefaultTos = 'default/tos',
  DefaultPrivacyPolicy = 'default/privacyPolicy',

  InitiativeCopy = 'initiative/copy',
  InitiativeTos = 'initiative/tos',
  InitiativePrivacyPolicy = 'initiative/privacyPolicy'
}

export const initiativeNamespaceGenerator = (initiativesList: Array<InitiativeDescriptor>) =>
  initiativesList.map(({ initiativeName }) => initiativeName);

export const buildScopedNamespaces = (initiativeName?: string) => ({
  common: [LocaleNamespace.Common] as const,
  initiative: initiativeName
    ? ([
        `${initiativeName}/copy`,
        `${initiativeName}/tos`,
        `${initiativeName}/privacyPolicy`
      ] as const)
    : ([] as const),
  default: [
    LocaleNamespace.DefaultCopy,
    LocaleNamespace.DefaultTos,
    LocaleNamespace.DefaultPrivacyPolicy
  ] as const
});
