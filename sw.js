const CACHE = 'localshare-v3';
const SHARE_CACHE = 'localshare-share';
const SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];
const ALLOWED_ORIGINS = [self.location.origin, 'https://cdn.jsdelivr.net'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('localshare-v') && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Paylaş menüsünden gelen metin ve dosyaları geçici olarak sakla, sonra uygulamaya yönlendir.
async function handleShare(req) {
  try {
    const fd = await req.formData();
    const cache = await caches.open(SHARE_CACHE);
    for (const k of await cache.keys()) await cache.delete(k);
    const str = (v) => (typeof v === 'string' ? v : '');
    const meta = { title: str(fd.get('title')), text: str(fd.get('text')), url: str(fd.get('url')) };
    const base = self.registration.scope;
    await cache.put(base + '__shared/meta', new Response(JSON.stringify(meta), {
      headers: { 'Content-Type': 'application/json' },
    }));
    let i = 0;
    for (const f of fd.getAll('files')) {
      if (typeof f === 'string') continue;
      await cache.put(base + '__shared/file-' + (i++), new Response(f, {
        headers: { 'Content-Type': f.type || 'application/octet-stream', 'X-Name': encodeURIComponent(f.name || 'dosya') },
      }));
    }
  } catch (err) { /* yoksay */ }
  return Response.redirect(self.registration.scope + '?shared=1', 303);
}

// Önce ağ, olmazsa önbellek: güncellemeler hemen gelir, çevrimdışıyken de sayfa açılır.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method === 'POST' && url.origin === self.location.origin && url.pathname.endsWith('/share-target')) {
    e.respondWith(handleShare(req));
    return;
  }
  if (req.method !== 'GET') return;
  if (!ALLOWED_ORIGINS.includes(url.origin)) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
