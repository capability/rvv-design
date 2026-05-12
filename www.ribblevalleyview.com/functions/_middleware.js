// HTTP Basic Auth gate for the whole Pages project.
// Configure BASIC_USER + BASIC_PASS in Cloudflare Pages → Settings → Environment variables.
// Defaults are intentionally weak — set real values before sharing the URL.

const REALM = 'Ribble Valley View — preview';

function unauthorized() {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const onRequest = async ({ request, env, next }) => {
  const user = env.BASIC_USER || 'rvv';
  const pass = env.BASIC_PASS || 'preview';

  const header = request.headers.get('Authorization') || '';
  if (header.startsWith('Basic ')) {
    let decoded = '';
    try { decoded = atob(header.slice(6).trim()); } catch (_) {}
    const idx = decoded.indexOf(':');
    if (idx >= 0) {
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (timingSafeEqual(u, user) && timingSafeEqual(p, pass)) {
        const res = await next();
        const headers = new Headers(res.headers);
        headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
      }
    }
  }
  return unauthorized();
};
