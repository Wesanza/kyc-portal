import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicantStore } from '../store/useApplicantStore';

export const useApplicantSession = () => {
  const navigate = useNavigate();
  const { applicantId, token, fullName, email, setApplicant, clearApplicant } =
    useApplicantStore();

  const isAuthenticated = Boolean(token && applicantId);

  const login = useCallback(
    (data: { applicantId: string; token: string; fullName: string; email?: string }) => {
      // Persist to localStorage for Axios interceptor
      localStorage.setItem('applicant_token', data.token);
      setApplicant(data);
      navigate('/portal/home');
    },
    [setApplicant, navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('applicant_token');
    localStorage.removeItem('applicant-session');
    clearApplicant();
    navigate('/login');
  }, [clearApplicant, navigate]);

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return {
    applicantId,
    token,
    fullName,
    email,
    isAuthenticated,
    login,
    logout,
    requireAuth,
  };
};

export default useApplicantSession;
