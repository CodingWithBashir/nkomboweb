/**
 * The API implementation is shared with the Next.js version of this project, so
 * it is written against the web `Request`/`Response` classes. This is the only
 * piece of Next.js it touched: a request that also exposes a parsed URL.
 */
export type NextRequest = Request & { nextUrl: URL };
