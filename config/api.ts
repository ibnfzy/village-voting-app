// API Configuration
export const API_CONFIG = {
  // Base URL for the API
  BASE_URL: 'https://arliani.jultdev.site/API',

  // API Routes
  ROUTES: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER_USER: '/auth/register-user',
      REGISTER_PEMILIH: '/auth/register-pemilih',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE_PROFILE: '/user/update',
    },
    CANDIDATES: {
      LIST: '/candidates',
      DETAIL: '/candidates/:id_candidate',
    },
    VOTING: {
      VOTE: '/vote',
      RESULTS: '/vote/results',
      STATUS: '/vote/status',
      SCHEDULE: '/vote/schedule',
    },
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (route: string): string => {
  return `${API_CONFIG.BASE_URL}${route}`;
};

// Helper function to replace route parameters
export const buildRouteWithParams = (
  route: string,
  params: Record<string, string>
): string => {
  let finalRoute = route;
  Object.entries(params).forEach(([key, value]) => {
    finalRoute = finalRoute.replace(`:${key}`, value);
  });
  return finalRoute;
};
