import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSectionStatus } from '../api/kyc';
import type { KycSectionKey, KycStatus } from '../types/kyc';

export const KYC_STATUS_KEY = ['kyc', 'status'];

export const useKycStatus = () => {
  return useQuery({
    queryKey: KYC_STATUS_KEY,
    queryFn: getSectionStatus,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useKycSectionStatus = (section: KycSectionKey): KycStatus => {
  const { data } = useKycStatus();
  return (
    data?.sections.find((s) => s.section === section)?.status ?? 'NOT_STARTED'
  );
};

export const useInvalidateKycStatus = () => {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: KYC_STATUS_KEY });
};
