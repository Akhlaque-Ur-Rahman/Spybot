'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { adminApiErrorToUserMessage } from '@/lib/admin/user-facing-errors';

type AdminApiContextValue = {
  csrfToken: string;
  fetchJson: <T>(url: string, init?: RequestInit) => Promise<T>;
};

const AdminApiContext = createContext<AdminApiContextValue | null>(null);

export function AdminApiProvider({
  csrfToken,
  children,
}: {
  csrfToken: string;
  children: ReactNode;
}) {
  const value = useMemo<AdminApiContextValue>(() => {
    const REQUEST_TIMEOUT_MS = 15_000;
    return {
      csrfToken,
      async fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
        const headers = new Headers(init?.headers);
        if (csrfToken) headers.set('x-csrf-token', csrfToken);
        const isFormDataBody =
          typeof FormData !== 'undefined' && init?.body instanceof FormData;
        if (!headers.has('Content-Type') && init?.body && !isFormDataBody) {
          headers.set('Content-Type', 'application/json');
        }
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        if (init?.signal) {
          if (init.signal.aborted) controller.abort();
          else init.signal.addEventListener('abort', () => controller.abort(), { once: true });
        }
        let res: Response;
        try {
          res = await fetch(url, {
            ...init,
            headers,
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
          });
        } finally {
          window.clearTimeout(timeoutId);
        }
        const text = await res.text();
        let data: unknown = null;
        if (text) {
          try {
            data = JSON.parse(text) as unknown;
          } catch {
            data = { error: text };
          }
        }
        if (!res.ok) {
          const payload = data as { error?: string } | null;
          const method = (init?.method ?? 'GET').toUpperCase();
          const technical =
            typeof payload?.error === 'string'
              ? payload.error
              : text?.trim() || 'Request failed without a message';
          console.error('[admin-api]', method, url, res.status, { responseBody: payload ?? text, technicalError: technical });
          throw new Error(adminApiErrorToUserMessage(technical));
        }
        return data as T;
      },
    };
  }, [csrfToken]);

  return <AdminApiContext.Provider value={value}>{children}</AdminApiContext.Provider>;
}

export function useAdminApi() {
  const ctx = useContext(AdminApiContext);
  if (!ctx) throw new Error('useAdminApi must be used within AdminApiProvider');
  return ctx;
}
