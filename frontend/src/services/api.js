import { getAccessToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * ApiError carries the structured error info from the backend's
 * standard error envelope, so callers can branch on `code` instead
 * of parsing message strings.
 */
export class ApiError extends Error {
  constructor(message, code, status, details) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError("Network error - is the backend running?", "NETWORK_ERROR", 0, {});
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // non-JSON response
  }

  if (!response.ok || payload.success === false) {
    const err = payload.error || {};
    throw new ApiError(
      payload.message || "Request failed",
      err.code || "UNKNOWN_ERROR",
      response.status,
      err.details || {}
    );
  }

  return payload.data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),

  // Convenience wrappers matching the backend route surface.
  health: () => request("/health", { auth: false }),

  projects: {
    list: () => request("/projects"),
    create: (data) => request("/projects", { method: "POST", body: data }),
    get: (id) => request(`/projects/${id}`),
  },

  processing: {
    submit: (data) => request("/processing", { method: "POST", body: data }),
    status: (id) => request(`/processing/${id}`),
  },

  results: {
    list: () => request("/results"),
    get: (id) => request(`/results/${id}`),
    delete: (id) => request(`/results/${id}`, { method: "DELETE" }),
  },
};

export default api;
