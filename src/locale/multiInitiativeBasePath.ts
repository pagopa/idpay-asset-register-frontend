export const getInitiativeFolderName = (initiativeId?: string): string => {
  if (
    initiativeId &&
    initiativeId === process.env.REACT_APP_INITIATIVE_ID_BONUS_ELETTRODOMESTICI
  ) {
    return 'bonusElettrodomestici2025';
  }

  if (initiativeId && initiativeId === process.env.REACT_APP_INITIATIVE_ID_BONUS_DECODER) {
    return 'bonusDecoder2026';
  }

  return '';
};

export const getInitiativeBasePath = (initiativeId?: string): string => {
  const folder = getInitiativeFolderName(initiativeId);
  return folder ? `./it/${folder}/` : '';
};
