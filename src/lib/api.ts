import axios, { type AxiosRequestConfig } from 'axios';
import { USE_AUTH } from './config';

interface AuthTokens {
  token: string | null;
  tenantId: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

if (!API_BASE_URL) {
  console.error("API base URL is not configured in environment variables.");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': '*/*',
  }
});

export const apiCall = async (
  config: AxiosRequestConfig,
  auth: AuthTokens
) => {
  const headers = { ...config.headers };

  if (USE_AUTH) {
    if (!auth.token || !auth.tenantId) {
      throw new Error("Authentication credentials not provided.");
    }
    headers['Authorization'] = `Bearer ${auth.token}`;
    headers['X-Tenant-ID'] = auth.tenantId;
  } else {
    const tenantId = auth.tenantId || 'c6142cc8-4977-4b2f-92bf-b5f89a94a8fa';
    headers['X-Tenant-ID'] = tenantId;
  }
  
  if (config.data instanceof FormData) {
    headers['Content-Type'] = 'multipart/form-data';
  } else {
    headers['Content-Type'] = 'application/json';
  }

  const finalConfig: AxiosRequestConfig = {
    ...config,
    headers,
  };

  return api(finalConfig);
};
