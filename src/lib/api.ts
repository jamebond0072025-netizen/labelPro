import { USE_AUTH } from './config';

interface AuthTokens {
  token: string | null;
  tenantId: string | null;
}

export async function fetchWithAuth(
  endpoint: string,
  auth: AuthTokens,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {});
  headers.set('accept', '*/*');

  if (USE_AUTH) {
    if (!auth.token || !auth.tenantId) {
      // Returning a response that looks like an authentication failure
      // This will be caught by the calling function's .then(response => ...) block
      return new Response(JSON.stringify({ message: "Authentication credentials not provided." }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    headers.set('Authorization', `Bearer ${auth.token}`);
    headers.set('X-Tenant-ID', auth.tenantId);
  } else {
    // If auth is disabled, you might still need a tenant ID for some APIs.
    // This part can be adjusted based on the unauthenticated API requirements.
    // For now, we assume no headers are needed when auth is off.
    // If a tenant ID is always required, you could add it here.
    // headers.set('X-Tenant-ID', 'some-default-tenant-id');
  }

  const finalOptions: RequestInit = {
    ...options,
    headers,
  };
  
  const API_BASE_URL = 'https://crossbiz-api.apexpath.com/inventory-service/api';
  const url = `${API_BASE_URL}/${endpoint}`;

  return fetch(url, finalOptions);
}
