# Skill: Admin Widget Fetch Pattern

When writing or reviewing fetch calls inside any admin widget or admin route page (`apps/backend/src/admin/`), always use **relative URLs** — never construct an absolute URL from an env var.

## Rule

**Do NOT do this:**
```ts
const BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

const res = await fetch(`${BACKEND_URL}/admin/collections/${id}`, { ... })
```

**Do this instead:**
```ts
const res = await fetch(`/admin/collections/${id}`, { ... })
```

## Why

The Medusa admin panel is served by the backend itself at `/app`. Every fetch from an admin widget or route is same-origin — the browser resolves relative paths against the backend's origin automatically. No env var is needed and there is no localhost fallback risk.

`VITE_MEDUSA_BACKEND_URL` is a Vite build-time variable. If it is not set at build time (e.g. on Railway where `.env` files are not committed), the fallback `"http://localhost:9000"` is baked into the bundle, causing all admin API calls to hit localhost in production.

## Applies to

- All files under `apps/backend/src/admin/widgets/`
- All files under `apps/backend/src/admin/routes/`
- Any helper like `adminFetch`, `uploadFile`, `postCollection`, etc. defined in those files
- `window.open(...)` calls that open backend endpoints (e.g. export/template downloads) — relative paths work fine here too

## Pattern for a shared fetch helper

```ts
async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}
```

No `BACKEND_URL` constant needed anywhere in admin files.
