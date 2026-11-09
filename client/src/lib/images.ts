'use client';

/**
 * Photo hosting.
 *
 * Images are not stored on the school server: an administrator configures an
 * image host (imgbb / imgdb style API) once in the dashboard, and every upload
 * goes straight from the browser to that service. Only the resulting URL is
 * saved in the school database, which keeps the deployment small and fast.
 */

export type ImageHostSettings = {
  endpoint: string;
  apiKey: string;
};

export async function loadImageSettings(): Promise<ImageHostSettings> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  if (!token) return { endpoint: '', apiKey: '' };
  const response = await fetch('/api/settings/', {
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok) return { endpoint: '', apiKey: '' };
  const data = (await response.json()) as { imgdb_endpoint?: string; imgdb_api_key?: string };
  return {
    endpoint: data.imgdb_endpoint || 'https://api.imgbb.com/1/upload',
    apiKey: data.imgdb_api_key || '',
  };
}

export async function saveImageSettings(settings: ImageHostSettings): Promise<void> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  const response = await fetch('/api/settings/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    body: JSON.stringify({ imgdb_endpoint: settings.endpoint, imgdb_api_key: settings.apiKey }),
  });
  if (!response.ok) throw new Error('Could not save the image host settings.');
}

function base64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(new Error('That file could not be read.'));
    reader.readAsDataURL(file);
  });
}

function pickUrl(payload: any): string | null {
  const candidates = [
    payload?.data?.url,
    payload?.data?.display_url,
    payload?.data?.image?.url,
    payload?.url,
    payload?.link,
    payload?.data?.link,
  ];
  const found = candidates.find((value) => typeof value === 'string' && /^https?:\/\//.test(value));
  return found ?? null;
}

/** Uploads a photo and returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const { endpoint, apiKey } = await loadImageSettings();
  if (!endpoint || !apiKey) {
    throw new Error(
      'No image host is configured yet. Add your imgdb / imgbb API key in Dashboard → Settings, or paste an image URL instead.'
    );
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Please choose an image smaller than 8 MB.');
  }

  const body = new FormData();
  body.append('image', await base64(file));
  body.append('name', file.name.replace(/\.[^.]+$/, ''));

  const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${encodeURIComponent(apiKey)}`;
  let response: Response;
  try {
    response = await fetch(url, { method: 'POST', body });
  } catch {
    throw new Error('The image host could not be reached from this network.');
  }

  const payload = await response.json().catch(() => null);
  const hosted = pickUrl(payload);
  if (!response.ok || !hosted) {
    const detail =
      (payload && (payload?.error?.message || payload?.error || payload?.status_txt)) ||
      'The image host rejected that upload.';
    throw new Error(typeof detail === 'string' ? detail : 'The image host rejected that upload.');
  }
  return hosted;
}
