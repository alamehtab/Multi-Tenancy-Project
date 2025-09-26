import api from "./api";

/**
 * Login user
 * POST /login
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{ token: string, user: object }>}
 */
export const loginUser = (credentials) => api.post("auth/login", credentials);
