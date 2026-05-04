import { useGetInitiativesQuery } from '../redux/api/initiativesApi';

export const useInitiativesQuery = () => {
  const { data, isLoading, isError, refetch } = useGetInitiativesQuery();

  return {
    initiatives: data ?? [],
    isLoading,
    isError,
    refetch,
  };
};
