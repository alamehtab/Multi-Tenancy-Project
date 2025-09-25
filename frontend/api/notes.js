// src/api/notes.js
import api from "./api";

/**
 * Create a new note
 * POST /notes
 * @param {Object} data - { title, content }
 * @returns {Promise<Object>}
 */
export const createNote = (data) => api.post("/notes", data);

/**
 * Get all notes for the current user or tenant
 * GET /notes
 * @returns {Promise<Array>}
 */
export const getNotes = () => api.get("/notes");

/**
 * Get a single note by ID
 * GET /notes/:id
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const getNoteById = (id) => api.get(`/notes/${id}`);

/**
 * Update a note by ID
 * PUT /notes/:id
 * @param {number|string} id
 * @param {Object} data - { title, content }
 * @returns {Promise<Object>}
 */
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);

/**
 * Delete a note by ID
 * DELETE /notes/:id
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const deleteNote = (id) => api.delete(`/notes/${id}`);
