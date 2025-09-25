// src/api/middleware.js

/**
 * Get the current user from localStorage
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/**
 * Check if user has a specific role
 * @param {string} role - "ADMIN" or "MEMBER"
 * @returns {boolean}
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.role === role;
};
