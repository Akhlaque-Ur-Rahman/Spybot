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
    return {
      csrfToken,
      async fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
        const headers = new Headers(init?.headers);
        if (csrfToken) headers.set('x-csrf-token', csrfToken);
        if (!headers.has('Content-Type') && init?.body) {
          headers.set('Content-Type', 'application/json');
        }
        const res = await fetch(url, {
          ...init,
          headers,
          credentials: 'include',
        });
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
