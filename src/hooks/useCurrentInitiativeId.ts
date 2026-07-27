import { useParams } from 'react-router-dom';

export const useCurrentInitiativeId = (): string => {
  const { initiativeId } = useParams<{ initiativeId: string }>();
  return initiativeId || '';
};
