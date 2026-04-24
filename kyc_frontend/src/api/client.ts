import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const url = config.url ?? '';

  // Public applicant routes — no auth header
  const isPublicApplicantRoute =
    url.includes('/invite/') && url.includes('/validate');

  if (isPublicApplicantRoute) {
    return config;
  }

  if (url.startsWith('/applicant/')) {
    const applicantToken = (() => {
      try {
        const raw = localStorage.getItem('applicant-session');
        return raw ? JSON.parse(raw)?.state?.token ?? null : null;
      } catch {
        return null;
      }
    })();

    if (applicantToken) {
      config.headers.Authorization = `Applicant ${applicantToken}`;
    }
  } else {
    const adminToken = localStorage.getItem('admin_access_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isApplicantRoute = window.location.pathname.startsWith('/portal');
      if (isApplicantRoute) {
        window.location.href = '/no-session';
      } else {
        localStorage.removeItem('admin_access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default apiClient;