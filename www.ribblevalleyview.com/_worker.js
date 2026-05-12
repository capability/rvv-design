// Single-file Cloudflare Pages Worker — gates the whole project behind
// HTTP Basic Auth. Configure BASIC_USER + BASIC_PASS in
// Pages → Settings → Environment variables. Change from defaults before sharing.

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

export default {
  async fetch(request, env) {
    const user = env.BASIC_USER || 'rvv';
    const pass = env.BASIC_PASS || 'preview';

    const header = request.headers.get('Authorization') || '';
    let ok = false;
    if (header.startsWith('Basic ')) {
      let decoded = '';
      try { decoded = atob(header.slice(6).trim()); } catch (_) {}
      const idx = decoded.indexOf(':');
      if (idx >= 0) {
        const u = decoded.slice(0, idx);
        const p = decoded.slice(idx + 1);
        if (timingSafeEqual(u, user) && timingSafeEqual(p, pass)) ok = true;
      }
    }

    if (!ok) return unauthorized();

    const res = await env.ASSETS.fetch(request);
    const headers = new Headers(res.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  },
};
