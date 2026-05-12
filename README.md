# rvv-design — Ribble Valley View

Static marketing site for **Ribble Valley View** luxury lodge park, Old Langho, Lancashire.
Deployed on **Cloudflare Pages** as project `rvv-design`.

## Layout

```
www.ribblevalleyview.com/    # Pages publish root
  index.html                 # Home
  bookings.html              # Book a Break
  phase-2-1.html             # Lodge Ownership (Dinckley Brook View)
  reviews.html               # Reviews
  out-and-about.html         # Out & About
  contact.html               # Contact (+ /contact/ redirect)
  news.html                  # legacy redirect → out-and-about.html
  img/                       # Local hero/lodge photos (mirrored from original Squarespace)
  functions/_middleware.js   # HTTP Basic Auth gate for preview
  _redirects                 # Clean-URL redirects
  _headers                   # noindex + caching headers
  robots.txt                 # Disallow all (preview)
```

## Preview gate

Every request goes through `functions/_middleware.js` — HTTP Basic Auth.

Set credentials in **Cloudflare Pages → Settings → Environment variables**:

| Variable     | Example         |
|--------------|-----------------|
| `BASIC_USER` | `rvv`           |
| `BASIC_PASS` | `<long random>` |

Defaults are `rvv` / `preview` — **change before sharing the URL.**

## noindex

- `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">` on every page
- `X-Robots-Tag: noindex, nofollow` via `_headers` and middleware
- `robots.txt` disallows all crawlers

Remove all three when you’re ready to go live.

## Deploy

### Cloudflare dashboard (drag & drop)

1. dash.cloudflare.com → Workers & Pages → Create → Pages → **Direct Upload**
2. Project name: **`rvv-design`**
3. Drop the `www.ribblevalleyview.com/` folder.

### Wrangler (CLI)

```bash
npx wrangler pages deploy www.ribblevalleyview.com \
  --project-name=rvv-design \
  --branch=main
```

### Git-connected (auto-deploy)

1. Pages → Create → Pages → Connect to Git → pick `capability/rvv-design`.
2. Build settings:
   - Build command: *(leave empty)*
   - Build output directory: `www.ribblevalleyview.com`
3. Add env vars `BASIC_USER`, `BASIC_PASS`.

## Local preview

```bash
npx wrangler pages dev www.ribblevalleyview.com
```

Basic Auth gate runs locally too (defaults: `rvv` / `preview`).

## Going live (later)

- Remove `noindex` meta + `X-Robots-Tag` + `robots.txt` disallow.
- Delete `functions/_middleware.js`.
- Point real domain at the Pages project.
- Precompile Tailwind to a static `style.css` (replace CDN `<script>`).
