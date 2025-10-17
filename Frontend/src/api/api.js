import axios from "axios";
import { jwtDecode } from 'jwt-decode';

// Axios instance
const api = axios.create({
  baseURL: "http://localhost:8082/api",
  headers: { "Content-Type": "application/json" },
});

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

api.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (isTokenExpired(accessToken) && refreshToken && !config.url.includes("/auth/refresh")) {
      return refreshTokenAndRetry(config, refreshToken);
    }
    if (accessToken && !config.url.includes("/auth/")) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest?._noRedirect) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }
        const refreshResponse = await axios.post(
          "http://localhost:8082/api/auth/refresh",
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );
        localStorage.setItem("token", refreshResponse.data.token);
        localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
        return axios(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

const refreshTokenAndRetry = async (config, refreshToken) => {
  if (isTokenExpired(refreshToken)) {
    localStorage.clear();
    window.location.href = "/login";
    return Promise.reject("Refresh token expired");
  }
  const refreshResponse = await axios.post(
    "http://localhost:8082/api/auth/refresh",
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );
  localStorage.setItem("token", refreshResponse.data.token);
  localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
  config.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
  return config;
};

// =================== AUTH ===================
export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  if (res.data.token && res.data.refreshToken) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("refreshToken", res.data.refreshToken);
  }
  return res;
};
export const registerUser = (data) => api.post("/auth/register", data);
export const testBackend = () => api.get("/auth/test");

// =================== USERS ===================
export const getMyProfile = () => api.get("/users/profile");
export const updateMyProfile = (profileData) => api.patch("/users/profile", profileData);
export const updatePassword = (passwordData) => api.post("/users/password", passwordData, { _noRedirect: true });

// ✅ Toggle notifications preference
export const toggleNotifications = (enabled) => api.put("/users/notifications", { enabled });

// =================== LOGS ===================
export const createLog = (log, files) => {
  const formData = new FormData();
  formData.append("log", new Blob([JSON.stringify(log)], { type: "application/json" }));
  if (files) Array.from(files).forEach(f => formData.append("files", f));
  return api.post("/logs", formData, { headers: { "Content-Type": "multipart/form-data" } });
};
export const getLogById = (id) => api.get(`/logs/id/${id}`);
export const getAllLogs = (page = 0, size = 10, sort = "createdAt,desc") => api.get("/logs", { params: { page, size, sort } });
export const updateLog = (id, log, files) => {
  const formData = new FormData();
  if (log) formData.append("log", new Blob([JSON.stringify(log)], { type: "application/json" }));
  if (files) Array.from(files).forEach(f => formData.append("files", f));
  return api.patch(`/logs/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
};
export const deleteLog = (id) => api.delete(`/logs/${id}`);
export const filterLogs = (params = {}) => api.get("/logs/filter", { params });

export default api;
