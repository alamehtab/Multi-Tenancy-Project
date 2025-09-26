import api from "./api";

/**
 * Get all users (Admins only)
 * GET /tenants/all-users
 */
export const getAllUsers = () => api.get("/tenants/all-users");

/**
 * Get tenant info by slug (Admins only)
 * GET /tenants/:slug
 */
export const getTenantInfo = (slug) => api.get(`/tenants/${slug}`);

/**
 * Toggle subscription plan (Admins only)
 * POST /tenants/:slug/toggle-plan
 */
export const toggleTenantPlan = (slug) => api.post(`/tenants/${slug}/toggle-plan`);

/**
 * Update user within tenant (Admins only)
 * PUT /tenants/:slug/users/:userId
 */
export const updateTenantUser = (slug, userId, data) =>
  api.put(`/tenants/${slug}/users/${userId}`, data);

/**
 * Invite new user to tenant (Admins only)
 * POST /tenants/:slug/invite
 */
export const inviteTenantUser = (slug, data) =>
  api.post(`/tenants/${slug}/invite`, data);

/**
 * List users of a tenant
 * GET /tenants/:slug/users
 */
export const getTenantUsers = (slug) => api.get(`/tenants/${slug}/users`);

/**
 * Delete user from tenant (Admins only)
 * DELETE /tenants/:slug/users/:userId
 */
export const deleteTenantUser = (tenantSlug, userId) =>
  api.delete(`/tenants/${tenantSlug}/users/${userId}`);
