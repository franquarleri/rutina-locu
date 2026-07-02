const CACHE = 'rutina-v4';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

let notifTimer = null;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match('./index.html'))));
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIF') {
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => {
      self.registration.showNotification('¡Descanso terminado! 🔥', {
        body: '¡A mover los fierros! 💪',
        vibrate: [300, 100, 300, 100, 500],
        icon: './icon.svg',
        badge: './icon.svg',
        tag: 'rest-timer',
        renotify: true
      });
    }, e.data.delay);
  }
  if (e.data && e.data.type === 'CANCEL_NOTIF') {
    clearTimeout(notifTimer);
  }
});
