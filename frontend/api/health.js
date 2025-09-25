// src/api/health.js
import api from "./api";

/**
 * Health check
 * GET /health
 * @returns {Promise<{ status: string }>}
 */
export const checkHealth = () => api.get("/health");
