import { InitiativeDTO } from '../api/generated/register';
import { useGetInitiativesQuery } from '../redux/api/initiativesApi';

export const useInitiativesQuery = () => {
  const { data, isLoading, isError, refetch } = useGetInitiativesQuery();
  const initiatives: Array<InitiativeDTO> = data && data.length > 0 ? data : [];

  return {
    initiatives,
    isLoading: isLoading && initiatives.length === 0,
    isError: isError && initiatives.length === 0,
    refetch,
  };
};
