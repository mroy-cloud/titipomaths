// Titipo Maths — offline cache. Bump CACHE when you upload new files.
const CACHE = 'titipo-maths-v2';
const ASSETS = [
  './', './index.html', './quarry.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  // Level 1 voice clips (must sit next to index.html)
  './Game 1.mp3', './Game 2.mp3', './Game 3.mp3', './Game 4.mp3', './Game 5.mp3', './Game 6.mp3', './Yay - correct.mp3'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(a => c.add(a).catch(()=>{})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
