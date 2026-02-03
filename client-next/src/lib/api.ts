// API Base URL configuration
// Using relative URLs - Next.js rewrites will proxy /api/* to the Express backend
// This works for both development and production (single Render service)
export const API_BASE_URL = '';

export const API_ENDPOINTS = {
  sessions: '/api/sessions',
  attendance: '/api/attendance',
  drills: '/api/drills',
  goals: '/api/goals',
  rapsodo: '/api/rapsodo',
  parent: '/api/parent',
  rules: '/api/rules',
};

