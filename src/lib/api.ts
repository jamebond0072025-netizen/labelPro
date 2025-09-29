import axios, { type AxiosRequestConfig, AxiosError } from "axios";
import { USE_AUTH } from "./config";

interface AuthTokens {
  token: string | null;
  tenantId: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://crossbiz-api.apexpath.com/inventory-service/api";


if (!API_BASE_URL) {
  console.error("API base URL is not configured in environment variables.");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "*/*" },
});

export const uploadImage = async (
  file: File,
  auth: AuthTokens,
  toast: (options: { variant: 'destructive'; title: string; description: string }) => void,
  retryCount = 0
): Promise<string> => {
  const MAX_FILE_SIZE_KB = 50;
  if (file.size > MAX_FILE_SIZE_KB * 1024) {
    toast({
      variant: 'destructive',
      title: 'Image Too Large',
      description: `Please upload an image smaller than ${MAX_FILE_SIZE_KB} KB.`,
    });
    throw new Error(`File size exceeds ${MAX_FILE_SIZE_KB} KB`);
  }

  if (!USE_AUTH) {
    // Fallback for local development without auth
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  if (!auth.token || !auth.tenantId) {
    throw new Error("Authentication credentials not provided for image upload.");
  }

  const formData = new FormData();
  formData.append('File', file);

  try {
    const response = await api.post('/LabelTemplate/UploadImage', formData, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'X-Tenant-ID': auth.tenantId,
        'Content-Type': 'multipart/form-data',
      },
    });

    const { fileName } = response.data;
    if (!fileName) throw new Error("API did not return a filename.");

    return `https://crossbiz-api.apexpath.com/inventory-service/images/labeltemplates/${auth.tenantId}/${fileName}`;
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response?.status === 401 && USE_AUTH && retryCount < 5) {
      try {
        // Get new auth tokens from parent
        const newAuth = await waitForAuth();

        // Retry the upload with new token
        return await uploadImage(file, newAuth, toast, retryCount + 1);
      } catch (authError) {
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: 'Could not refresh token for image upload.',
        });
        throw authError;
      }
    }

    console.error("Image upload failed:", error);
    throw new Error("Could not upload the image.");
  }
};



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
