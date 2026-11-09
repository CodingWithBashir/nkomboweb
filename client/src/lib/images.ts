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
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Please choose an image smaller than 8 MB.');
  }

  const settings = await loadImageSettings();
  const encoded = await base64(file);

  // 1. Upload straight from the browser — fastest, and keeps the file off the
  //    school server.
  if (settings.endpoint && settings.apiKey) {
    try {
      const body = new FormData();
      body.append('image', encoded);
      body.append('name', file.name.replace(/\.[^.]+$/, ''));
      const url = `${settings.endpoint}${settings.endpoint.includes('?') ? '&' : '?'}key=${encodeURIComponent(settings.apiKey)}`;
      const response = await fetch(url, { method: 'POST', body });
      const payload = await response.json().catch(() => null);
      const hosted = pickUrl(payload);
      if (response.ok && hosted) return hosted;
    } catch {
      /* blocked by the network or CORS — try the server relay below */
    }
  }

  // 2. Relay through the school API, which talks to the image host itself.
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  const body = new FormData();
  body.append('image', file);
  body.append('name', file.name.replace(/\.[^.]+$/, ''));
  let relay: Response;
  try {
    relay = await fetch('/api/images/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Token ${token}` } : undefined,
      body,
    });
  } catch {
    throw new Error('The image could not be uploaded. Check your connection and try again.');
  }

  const result = (await relay.json().catch(() => ({}))) as { url?: string; detail?: string };
  if (relay.ok && result.url) return result.url;

  throw new Error(
    result.detail ||
      (settings.apiKey
        ? 'The image host rejected that upload.'
        : 'No image host is configured yet. Add your imgdb / imgbb API key in Dashboard → Settings, or paste an image URL instead.')
  );
}
