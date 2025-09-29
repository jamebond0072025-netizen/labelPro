import axios, { type AxiosRequestConfig, AxiosError } from "axios";
import { USE_AUTH } from "./config";

interface AuthTokens {
  token: string | null;
  tenantId: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

if (!API_BASE_URL) {
  console.error("API base URL is not configured in environment variables.");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "*/*" },
});

// --- Helper: wait for SET_AUTH message from parent ---
function waitForAuth(): Promise<AuthTokens> {
  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      const { type, token, tenantId } = event.data || {};
      if (type === "SET_AUTH" && token && tenantId) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("tenantId", tenantId);
        window.removeEventListener("message", handleMessage);
        resolve({ token, tenantId });
      }
    };

    const timeout = setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      reject(new Error("Auth refresh timeout"));
    }, 5000);

    window.addEventListener("message", (event) => {
      const { type, token, tenantId } = event.data || {};
      if (type === "SET_AUTH" && token && tenantId) {
        clearTimeout(timeout);
        window.removeEventListener("message", handleMessage);
        resolve({ token, tenantId });
      }
    });

    // 🚨 Ask parent for credentials
    window.parent.postMessage({ type: "GET_AUTH" }, "*");
  });
}

// --- Main API call wrapper ---
export const apiCall = async (
  config: AxiosRequestConfig,
  auth: AuthTokens,
  retryCount = 0
) => {
  const headers: Record<string, string> = { ...config.headers };

  if (USE_AUTH) {
    if (!auth.token || !auth.tenantId) {
      throw new Error("Authentication credentials not provided.");
    }
    headers["Authorization"] = `Bearer ${auth.token}`;
    headers["X-Tenant-ID"] = auth.tenantId;
  } else {
    headers["X-Tenant-ID"] =
      auth.tenantId || "c6142cc8-4977-4b2f-92bf-b5f89a94a8fa";
  }

  if (config.data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  } else {
    headers["Content-Type"] = "application/json";
  }

  const finalConfig: AxiosRequestConfig = { ...config, headers };

  try {
    return await api(finalConfig);
  } catch (error) {
    const axiosError = error as AxiosError;

    // --- If unauthorized, retry up to 5 times ---
    if (axiosError.response?.status === 401 && USE_AUTH && retryCount < 5) {
      try {
        const newAuth = await waitForAuth();

        // Retry with fresh token, increment retryCount
        return await apiCall(config, newAuth, retryCount + 1);
      } catch (authError) {
        throw authError;
      }
    }

    throw error;
  }
};
