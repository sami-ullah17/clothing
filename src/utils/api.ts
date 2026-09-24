export const API_BASE_URL = (
  (typeof import.meta !== 'undefined' &&
    ((import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE_URL)) ||
  ''
).replace(/\/$/, '');

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export function getSafeImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs (base64) are 100% self-contained and always display
  if (trimmed.startsWith('data:image/')) return trimmed;

  // Blob URLs
  if (trimmed.startsWith('blob:')) return trimmed;

  // Google Drive sharing links -> Direct image link
  if (trimmed.includes('drive.google.com')) {
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      // lh3.googleusercontent.com/d/ID is Google's official public image rendering CDN
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }
  }

  // Dropbox shared links -> Direct raw image link
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('?dl=0', '?raw=1').replace('&dl=0', '&raw=1');
  }

  // External absolute URLs (HTTP / HTTPS)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  // Local uploads or images
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return getApiUrl(cleanPath);
  }
  if (trimmed.startsWith('/images/') || trimmed.startsWith('images/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return getApiUrl(cleanPath);
  }
  if (trimmed.startsWith('/')) {
    return getApiUrl(trimmed);
  }
  return trimmed;
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

/**
 * Robust fetch wrapper with automatic retry for transient connection glitches,
 * dev-server restarts, reverse-proxy warmups, or cold starts.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoffMs = 500
): Promise<Response> {
  let lastError: any = null;
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);

      // Fast-path: successful response
      if (res.ok) {
        return res;
      }

      // Check if this might be a transient reverse-proxy startup phase (e.g. 502/503/504 or HTML 404)
      const contentType = res.headers.get('content-type') || '';
      const isHtmlResponse = contentType.includes('text/html');
      const isTransient =
        res.status === 502 ||
        res.status === 503 ||
        res.status === 504 ||
        (res.status === 404 && isHtmlResponse && attempt < retries);

      if (isTransient && attempt < retries) {
        lastResponse = res;
        await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
        continue;
      }

      return res;
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
      }
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError || new Error(`Network request failed for ${url}`);
}

/**
 * Unified API fetch function with automatic retry for transient reverse-proxy warmup,
 * server reload, or network fluctuations.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  retries = 3,
  backoffMs = 500
): Promise<Response> {
  const url =
    endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : getApiUrl(endpoint);
  return fetchWithRetry(url, options, retries, backoffMs);
}

/**
 * Checks if the backend server on port 3000 is healthy and responding.
 */
export async function isBackendReachable(): Promise<boolean> {
  try {
    const res = await apiFetch('/api/health', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function parseApiResponse<T>(
  res: Response,
  fallbackMsg = 'Request failed'
): Promise<ApiResponse<T>> {
  try {
    const contentType = res.headers.get('content-type') || '';

    // Non-JSON response (e.g. HTML error page from proxy or startup phase)
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      let error = fallbackMsg;
      if (res.status === 404) {
        error = 'Backend server is initializing. Please retry in a moment.';
      } else if (res.status === 413) {
        error = 'Upload too large (413). The image file exceeds allowed size.';
      } else if (res.status === 429) {
        error = 'Quota exceeded (429). Rate limit reached. Please try again in a few moments.';
      } else if (res.status === 401 || res.status === 403) {
        error = 'Authentication error (401/403): Invalid or expired credentials.';
      } else if (res.status >= 500) {
        error = `Server temporarily busy (${res.status}). Please retry in a moment.`;
      } else {
        error = `Unexpected response (${res.status}): expected JSON but received ${contentType || 'text'}`;
      }
      return { ok: false, data: null, error, status: res.status };
    }

    const json = await res.json();

    if (!res.ok || json?.success === false) {
      let error = json?.error || fallbackMsg;
      if (res.status === 404) {
        error = json?.error || 'Resource not found (404).';
      } else if (res.status === 429 || String(error).toLowerCase().includes('quota')) {
        error = 'Quota exceeded: Request limit or storage quota reached. Please try again later.';
      } else if (res.status === 401 || res.status === 403) {
        error = 'Admin authorization failed. Please log in again.';
      }
      return { ok: false, data: null, error, status: res.status };
    }

    // Auto-unwrap if response format is { success: true, data: ... }
    const unwrappedData =
      json && typeof json === 'object' && 'success' in json && 'data' in json
        ? json.data
        : json;

    return { ok: true, data: unwrappedData as T, error: '', status: res.status };
  } catch (err: any) {
    return { ok: false, data: null, error: err?.message || fallbackMsg, status: 0 };
  }
}
