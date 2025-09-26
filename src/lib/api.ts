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
    // When auth is disabled, you might still need a tenant ID for some APIs.
    // For many test environments, a non-empty tenant ID is still required.
    // We can use a dummy value here if one isn't provided via the auth object.
    const tenantId = auth.tenantId || 'c6142cc8-4977-4b2f-92bf-b5f89a94a8fa';
    headers.set('X-Tenant-ID', tenantId);
  }

  const finalOptions: RequestInit = {
    ...options,
    headers,
  };
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  if (!API_BASE_URL) {
    console.error("API base URL is not configured in environment variables.");
    return new Response(JSON.stringify({ message: "API endpoint is not configured." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const url = `${API_BASE_URL}/${endpoint}`;

  return fetch(url, finalOptions);
}
