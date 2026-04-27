import { cacheSettingsMap } from '../lib/appSettings';
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from '../lib/auth';

// Registered by App.tsx so the client can trigger logout without a circular dep
let _onLogout: (() => void) | null = null;
export function registerLogoutCallback(fn: () => void) { _onLogout = fn; }

// Deduplicates concurrent refresh calls so only one hits the server
let _refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error('Refresh failed');
    const { accessToken } = await res.json();
    setAccessToken(accessToken);
    return accessToken;
  })().finally(() => { _refreshPromise = null; });

  return _refreshPromise;
}

function orgHeaders(): Record<string, string> {
  return {
    'X-Org-ID':    localStorage.getItem('orgId')    || '1',
    'X-Branch-ID': localStorage.getItem('branchId') || '1',
  };
}

async function request<T>(path: string, options?: RequestInit, isRetry = false): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...orgHeaders(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`/api${path}`, { headers, ...options });

  if (res.status === 401 && !isRetry) {
    const body = await res.json().catch(() => ({}));
    if (body.code === 'TOKEN_EXPIRED') {
      try {
        await refreshAccessToken();
        return request<T>(path, options, true);
      } catch {
        clearTokens();
        _onLogout?.();
        throw new Error('Session expired. Please sign in again.');
      }
    }
    clearTokens();
    _onLogout?.();
    throw new Error('Authentication required');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (data: { email: string; password: string; rememberMe?: boolean }) =>
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.ok ? r.json() : r.json().then((e: any) => Promise.reject(new Error(e.error)))),

    register: (data: any) =>
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.ok ? r.json() : r.json().then((e: any) => Promise.reject(new Error(e.error)))),

    refresh: () => {
      const refreshToken = getRefreshToken();
      return fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).then(r => r.ok ? r.json() : Promise.reject(new Error('Refresh failed')));
    },

    logout: () => {
      const refreshToken = getRefreshToken();
      return fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    },
  },
  organizations: {
    list:   ()                      => request<any[]>('/organizations'),
    get:    (id: number)            => request<any>(`/organizations/${id}`),
    create: (data: any)             => request<any>('/organizations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/organizations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  branches: {
    list:   ()                      => request<any[]>('/branches'),
    get:    (id: number)            => request<any>(`/branches/${id}`),
    create: (data: any)             => request<any>('/branches', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number)            => request<any>(`/branches/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list:   ()                      => request<any[]>('/customers'),
    get:    (id: number)            => request<any>(`/customers/${id}`),
    create: (data: any)             => request<any>('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number)            => request<any>(`/customers/${id}`, { method: 'DELETE' }),
    bulk:   (data: any)             => request<any>('/customers/bulk', { method: 'POST', body: JSON.stringify(data) }),
  },
  suppliers: {
    list:   ()                      => request<any[]>('/suppliers'),
    get:    (id: number)            => request<any>(`/suppliers/${id}`),
    create: (data: any)             => request<any>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number)            => request<any>(`/suppliers/${id}`, { method: 'DELETE' }),
    bulk:   (data: any)             => request<any>('/suppliers/bulk', { method: 'POST', body: JSON.stringify(data) }),
  },
  inventory: {
    list:   ()                      => request<any[]>('/inventory'),
    get:    (id: number)            => request<any>(`/inventory/${id}`),
    create: (data: any)             => request<any>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number)            => request<any>(`/inventory/${id}`, { method: 'DELETE' }),
    bulk:   (data: any)             => request<any>('/inventory/bulk', { method: 'POST', body: JSON.stringify(data) }),
  },
  sales: {
    list:         ()             => request<any[]>('/sales'),
    listFiltered: (params?: { from?: string; to?: string }) => {
      const qs = new URLSearchParams();
      if (params?.from) qs.set('from', params.from);
      if (params?.to)   qs.set('to',   params.to);
      const suffix = qs.toString() ? `?${qs}` : '';
      return request<any[]>(`/sales${suffix}`);
    },
    get:          (id: number)   => request<any>(`/sales/${id}`),
    create:       (data: any)    => request<any>('/sales', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: number, status: string) =>
      request<any>(`/sales/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    void:         (id: number)   => request<any>(`/sales/${id}/void`, { method: 'POST' }),
    delete:       (id: number)   => request<any>(`/sales/${id}`, { method: 'DELETE' }),
    bulk:         (data: any)    => request<any>('/sales/bulk', { method: 'POST', body: JSON.stringify(data) }),
    byTireType:   ()             => request<{ tire_type: string; item_count: number; revenue: number }[]>('/sales/by-tire-type'),
    dashboardStats: ()           => request<any>('/sales/stats/dashboard'),
  },
  purchases: {
    list:         ()             => request<any[]>('/purchases'),
    get:          (id: number)   => request<any>(`/purchases/${id}`),
    create:       (data: any)    => request<any>('/purchases', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: number, status: string) =>
      request<any>(`/purchases/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete:       (id: number)   => request<any>(`/purchases/${id}`, { method: 'DELETE' }),
    bulk:         (data: any)    => request<any>('/purchases/bulk', { method: 'POST', body: JSON.stringify(data) }),
  },
  settings: {
    get: async (): Promise<Record<string, string>> => {
      const data = await request<Record<string, string>>('/settings');
      cacheSettingsMap(data);
      return data;
    },
    update: async (data: Record<string, string>): Promise<Record<string, string>> => {
      const result = await request<Record<string, string>>('/settings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      cacheSettingsMap(result);
      return result;
    },
  },
  products: {
    list:   ()                      => request<any[]>('/products'),
    create: (data: any)             => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number)            => request<any>(`/products/${id}`, { method: 'DELETE' }),
  },
  lookups: {
    tireTypes:      ()                      => request<any[]>('/lookups/tire-types'),
    addTireType:    (name: string)          => request<any>('/lookups/tire-types', { method: 'POST', body: JSON.stringify({ name }) }),
    updateTireType: (id: number, data: any) => request<any>(`/lookups/tire-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTireType: (id: number)            => request<any>(`/lookups/tire-types/${id}`, { method: 'DELETE' }),
  },
  payments: {
    recordSalePayment:      (data: any)          => request<any>('/payments/sale', { method: 'POST', body: JSON.stringify(data) }),
    getSalePayments:        (saleId: number)      => request<any[]>(`/payments/sale/${saleId}`),
    deleteSalePayment:      (id: number)          => request<any>(`/payments/sale/${id}`, { method: 'DELETE' }),
    recordPurchasePayment:  (data: any)          => request<any>('/payments/purchase', { method: 'POST', body: JSON.stringify(data) }),
    getPurchasePayments:    (purchaseId: number)  => request<any[]>(`/payments/purchase/${purchaseId}`),
    deletePurchasePayment:  (id: number)          => request<any>(`/payments/purchase/${id}`, { method: 'DELETE' }),
  },
  users: {
    list:      ()                       => request<any[]>('/users'),
    create:    (data: any)              => request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
    update:    (id: number, data: any)  => request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    setStatus: (id: number, active: boolean) =>
      request<any>(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ is_active: active }) }),
    resetPassword: (id: number, password: string) =>
      request<any>(`/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),
  },
  audit: {
    list: (params?: { entity?: string; action?: string; from?: string; to?: string; page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.entity) qs.set('entity', params.entity);
      if (params?.action) qs.set('action', params.action);
      if (params?.from)   qs.set('from',   params.from);
      if (params?.to)     qs.set('to',     params.to);
      if (params?.page)   qs.set('page',   String(params.page));
      if (params?.limit)  qs.set('limit',  String(params.limit));
      const suffix = qs.toString() ? `?${qs}` : '';
      return request<{ logs: any[]; total: number; page: number; limit: number }>(`/audit${suffix}`);
    },
  },
  ledger: {
    summary:           ()           => request<any>('/ledger/summary'),
    customers:         ()           => request<any[]>('/ledger/customers'),
    suppliers:         ()           => request<any[]>('/ledger/suppliers'),
    customerStatement: (id: number) => request<any>(`/ledger/customer/${id}/statement`),
    supplierStatement: (id: number) => request<any>(`/ledger/supplier/${id}/statement`),
    unpaidInvoices:    (id: number) => request<any[]>(`/ledger/customer/${id}/unpaid-invoices`),
    unpaidPOs:         (id: number) => request<any[]>(`/ledger/supplier/${id}/unpaid-pos`),
  },
};
