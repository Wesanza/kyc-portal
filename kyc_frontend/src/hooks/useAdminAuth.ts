import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser, UserRole } from '../types/auth';

interface AdminState {
  userId: string | null;
  role: UserRole | null;
  accessToken: string | null;
  refreshToken: string | null;
  user: AdminUser | null;
  _hasHydrated: boolean;

  setAuth: (data: {
    userId: string;
    role: UserRole;
    accessToken: string;
    refreshToken: string;
    user: AdminUser;
  }) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setUser: (user: AdminUser) => void;

  setHasHydrated: (v: boolean) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      userId: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      user: null,
      _hasHydrated: false,

      setAuth: ({ userId, role, accessToken, refreshToken, user }) =>
        set({ userId, role, accessToken, refreshToken, user }),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () =>
        set({
          userId: null,
          role: null,
          accessToken: null,
          refreshToken: null,
          user: null,
        }),

      setUser: (user) => set({ user }),

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    
    {
      name: 'admin-auth',
      partialize: (state) => ({
        userId: state.userId,
        role: state.role,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const {
    userId,
    role,
    accessToken,
    user,
    _hasHydrated,
    clearAuth,
    setAuth,
    setAccessToken,
    setUser, 
  } = useAdminStore();

  const isAuthenticated = Boolean(accessToken && userId);
  const isAdmin = role === 'ADMIN';
  const isHR = role === 'HR';

  const logout = useCallback(() => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin-auth');
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  const login = useCallback(
    (
      data: {
        userId: string;
        role: UserRole;
        accessToken: string;
        refreshToken: string;
        user: AdminUser;
      },
      redirectTo = '/admin/dashboard'
    ) => {
      localStorage.setItem('admin_access_token', data.accessToken);
      setAuth(data);
      navigate(redirectTo);
    },
    [setAuth, navigate]
  );

  const updateAccessToken = useCallback(
    (token: string) => {
      localStorage.setItem('admin_access_token', token);
      setAccessToken(token);
    },
    [setAccessToken]
  );

  return {
    userId,
    role,
    accessToken,
    user,
    isAuthenticated,
    isAdmin,
    isHR,
    _hasHydrated,
    login,
    logout,
    updateAccessToken,
    setUser,
  };
};

export default useAdminAuth;