// src/api/api.js
import axios from "axios";

const API_URL = "https://multi-tenancy-project-c7rcwcna9-mehtab-alams-projects-b6c495d4.vercel.app";

const api = axios.create({
  baseURL: API_URL, // ✅ relative path for Vercel
  headers: { "Content-Type": "application/json" },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
