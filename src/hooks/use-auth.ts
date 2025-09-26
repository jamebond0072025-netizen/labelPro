
'use client';

import { useState, useEffect } from 'react';
import { USE_AUTH } from '@/lib/config';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    if (!USE_AUTH) {
      return;
    }

    let retryInterval: NodeJS.Timeout;

    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== 'http://localhost:3000' &&
        event.origin !== 'http://localhost:9002' &&
        !event.origin.includes('apexpath.com')
      ) {
        console.warn(`Message from untrusted origin blocked: ${event.origin}`);
        return;
      }

      const { type, token, tenantId } = event.data || {};
      if (type === 'SET_AUTH' && token && tenantId) {
        setToken(token);
        setTenantId(tenantId);
        localStorage.setItem('authToken', token);
        localStorage.setItem('tenantId', tenantId);
        if (retryInterval) clearInterval(retryInterval);
      }
    };

    const storedToken = localStorage.getItem('authToken');
    const storedTenantId = localStorage.getItem('tenantId');

    if (storedToken && storedTenantId) {
      setToken(storedToken);
      setTenantId(storedTenantId);
    } else {
        retryInterval = setInterval(() => {
          if (!token || !tenantId) {
            window.parent.postMessage({ type: 'GET_AUTH' }, '*');
          }
        }, 1000);
    }

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (retryInterval) clearInterval(retryInterval);
    };
  }, [token, tenantId]);

  return { token, tenantId };
}
