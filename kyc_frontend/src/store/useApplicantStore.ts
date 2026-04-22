import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KycStatus } from '../types/kyc';

interface ApplicantState {
  applicantId: string | null;
  token: string | null;
  fullName: string | null;
  email: string | null;
  kycStatus: KycStatus | null;
  _hasHydrated: boolean;

  setApplicant: (data: {
    applicantId: string;
    token: string;
    fullName: string;
    email?: string;
  }) => void;
  setKycStatus: (status: KycStatus) => void;
  clearApplicant: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useApplicantStore = create<ApplicantState>()(
  persist(
    (set) => ({
      applicantId: null,
      token: null,
      fullName: null,
      email: null,
      kycStatus: null,
      _hasHydrated: false,

      setApplicant: ({ applicantId, token, fullName, email }) =>
        set({ applicantId, token, fullName, email: email ?? null }),

      setKycStatus: (kycStatus) => set({ kycStatus }),

      clearApplicant: () =>
        set({
          applicantId: null,
          token: null,
          fullName: null,
          email: null,
          kycStatus: null,
        }),

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'applicant-session',
      partialize: (state) => ({
        applicantId: state.applicantId,
        token: state.token,
        fullName: state.fullName,
        email: state.email,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);