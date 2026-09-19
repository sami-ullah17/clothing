export const API_BASE_URL = (
  (typeof import.meta !== 'undefined' &&
    ((import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE_URL)) ||
  ''
).replace(/\/$/, '');

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export function getAdminAuthToken(): string {
  if (typeof window === 'undefined') return 'priboutique_owner_token_direct';
  return (
    localStorage.getItem('priboutique_admin_token') ||
    localStorage.getItem('pributeeq_admin_token') ||
    'priboutique_owner_token_direct'
  );
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T | null;
  error: string;
  status: number;
}

export async function parseApiResponse<T>(
  res: Response,
  fallbackMsg = 'Request failed'
): Promise<ApiResponse<T>> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      let error = fallbackMsg;
      if (res.status === 404) {
        error = 'Backend API endpoint not found (404). Please ensure server is running.';
      } else if (res.status === 413) {
        error = 'Upload too large (413). The image file is too large for storage.';
      } else if (res.status === 429) {
        error = 'Quota exceeded: Server rate limit or hosting quota reached. Please try again later.';
      } else if (res.status === 401 || res.status === 403) {
        error = 'Authentication error (401/403): Invalid or expired admin credentials.';
      } else if (res.status >= 500) {
        error = `Server error (${res.status}): ${text.slice(0, 100)}`;
      }
      return { ok: false, data: null, error, status: res.status };
    }

    const data = await res.json();
    if (!res.ok) {
      let error = data?.error || fallbackMsg;
      if (res.status === 429 || String(error).toLowerCase().includes('quota')) {
        error = 'Quota exceeded: Request limit or storage quota reached. Please try again later.';
      } else if (res.status === 401 || res.status === 403) {
        error = 'Admin authorization failed. Please log in again.';
      }
      return { ok: false, data, error, status: res.status };
    }

    return { ok: true, data, error: '', status: res.status };
  } catch (err: any) {
    return { ok: false, data: null, error: err?.message || fallbackMsg, status: 0 };
  }
}
