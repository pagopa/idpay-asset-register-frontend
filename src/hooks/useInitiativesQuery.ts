import { InitiativeDTO } from '../api/generated/register';
import { useGetInitiativesQuery } from '../redux/api/initiativesApi';
import { MOCKED_INITIATIVES_LIST } from '../utils/constants';

export const useInitiativesQuery = () => {
  const { data, isLoading, isError, refetch } = useGetInitiativesQuery();
  const initiatives: Array<InitiativeDTO> =
    data && data.length > 0 ? data : MOCKED_INITIATIVES_LIST;

  return {
    initiatives,
    isLoading: isLoading && initiatives.length === 0,
    isError: isError && initiatives.length === 0,
    refetch,
  };
};
