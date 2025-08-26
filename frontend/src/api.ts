import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
export const api = axios.create({ baseURL: API_BASE });

export function setToken(t?: string) {
  if (t) api.defaults.headers.common.Authorization = `Bearer ${t}`;
  else delete api.defaults.headers.common.Authorization;
}

// Auto-logout on 401 (no /me)
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
