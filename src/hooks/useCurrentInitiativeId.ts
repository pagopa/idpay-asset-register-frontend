import { useParams } from 'react-router-dom';

export const useCurrentInitiativeId = (): string | undefined => {
  const { initiativeId } = useParams<{ initiativeId: string }>();
  return initiativeId;
};
