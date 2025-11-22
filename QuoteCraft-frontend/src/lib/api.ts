// Centralized API client for QuoteCraft frontend
// Uses Vite env var VITE_BACKEND_URL; defaults to http://localhost:3001

export const API_BASE = (
  import.meta.env?.VITE_BACKEND_URL as string | undefined
) || 'http://localhost:3001';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson ? (data?.error?.message || data?.message || 'Request failed') : String(data);
    throw new Error(message);
  }

  return data as T;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    fileId: string;
    fileName: string;
    fileType: 'boq' | 'quote';
    parsedData?: any;
    flowExecutionId?: string;
    status?: string;
  };
  message?: string;
}

export const api = {
  health: () => request<{ status: string; timestamp: string; environment: string; uptime: number }>(`/health`, { method: 'GET' }),

  uploadFile: (file: File, params: { fileType: 'boq' | 'quote'; vendorName?: string; vendorId?: string }) => {
    const form = new FormData();
    form.append('file', file);
    form.append('fileType', params.fileType);
    if (params.vendorName) form.append('vendorName', params.vendorName);
    if (params.vendorId) form.append('vendorId', params.vendorId);
    return request<UploadResponse>(`/api/upload`, {
      method: 'POST',
      body: form,
    });
  },

  createComparison: (payload: any) => request(`/api/comparison`, { method: 'POST', body: JSON.stringify(payload) }),
  getComparison: (id: string) => request(`/api/comparison/${id}`, { method: 'GET' }),
  submitApproval: (payload: any) => request(`/api/approval`, { method: 'POST', body: JSON.stringify(payload) }),
  getKPI: () => request(`/api/kpi`, { method: 'GET' }),
};
