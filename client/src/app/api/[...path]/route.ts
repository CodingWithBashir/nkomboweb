import { NextRequest, NextResponse } from 'next/server';

/**
 * Same-origin proxy for the Django API.
 *
 * The public site can be served from a different host than the API (for
 * example a preview URL), so browser requests are sent to `/api/**` on the same
 * origin and forwarded here. Trailing slashes are preserved because Django's
 * URL patterns require them.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const API_ORIGIN = (process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000').replace(/\/$/, '');

const FORWARDED_REQUEST_HEADERS = [
  'authorization',
  'content-type',
  'accept',
  'accept-language',
  'cookie',
  'x-csrftoken',
];

async function proxy(request: NextRequest, path: string[]) {
  const { pathname, search } = request.nextUrl;
  const suffix = pathname.endsWith('/') && path.length > 0 ? '/' : '';
  const target = `${API_ORIGIN}/api/${path.join('/')}${suffix}${search}`;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
      cache: 'no-store',
    });

    const responseHeaders = new Headers();
    const contentType = upstream.headers.get('content-type');
    if (contentType) responseHeaders.set('content-type', contentType);
    const disposition = upstream.headers.get('content-disposition');
    if (disposition) responseHeaders.set('content-disposition', disposition);
    const vary = upstream.headers.get('vary');
    if (vary) responseHeaders.set('vary', vary);

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { detail: 'The school API is unreachable right now.' },
      { status: 502 }
    );
  }
}

type Context = { params: { path: string[] } };

export function GET(request: NextRequest, { params }: Context) {
  return proxy(request, params.path);
}

export function POST(request: NextRequest, { params }: Context) {
  return proxy(request, params.path);
}

export function PUT(request: NextRequest, { params }: Context) {
  return proxy(request, params.path);
}

export function PATCH(request: NextRequest, { params }: Context) {
  return proxy(request, params.path);
}

export function DELETE(request: NextRequest, { params }: Context) {
  return proxy(request, params.path);
}
