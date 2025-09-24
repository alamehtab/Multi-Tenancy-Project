import axios from "axios";

const API_URL = "http://localhost:3000"; // backend URL

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Named export to set the auth token dynamically
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Optional: interceptors for logging errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
