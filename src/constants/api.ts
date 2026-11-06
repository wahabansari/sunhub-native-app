/**
 * Client API endpoints, relative to the configured base URL and API version.
 *
 * These mirror the endpoints used by the web reference app. Keep this list
 * intentionally small: add endpoints only when a feature needs them.
 */
export const API_ENDPOINTS = {
  login: '/client/login',
  profile: '/client/my-profile/edit',
  logout: '/client/logout',
} as const;
