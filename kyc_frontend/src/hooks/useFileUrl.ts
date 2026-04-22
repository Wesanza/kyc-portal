import { useQuery } from '@tanstack/react-query';
import { getSecureFileUrl } from '../api/files';

export const useFileUrl = (fileToken: string | null | undefined) => {
  return useQuery({
    queryKey: ['file', fileToken],
    queryFn: () => getSecureFileUrl(fileToken!),
    enabled: Boolean(fileToken),
    staleTime: 50 * 60 * 1000, // 50 min — slightly under the 1-hour pre-sign expiry
    gcTime: 60 * 60 * 1000,
  });
};

export default useFileUrl;
