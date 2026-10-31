/* Service worker app Tho Ve Kinh (T178). 20261031101855 duoc dang-web.py thay bang moc build. */
var VER = '20261031101855';
var CACHE = 'ctk-' + VER;
var PRE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png", "./mau/Mau-dim-nho.csv", "./mau/MauNhapCSV-CT-Mode1.csv", "./mau/MauNhapCSV-CT-Mode6(CTKinh).csv", "./mau/MauNhapCSV-CongTrinh(NhieuMode).csv", "./mau/T147-thu.csv", "./mau/T21-test-tong.csv", "./mau/T38-thu.csv", "./mau/T48-thu.csv", "./mau/T49-thu.csv", "./mau/T52-thu.csv", "./mau/T56-thu.csv", "./mau/T57-thu.csv", "./mau/T59-thu.csv", "./mau/T62-thu.csv", "./mau/ThucTX2-thu.csv", "./mau/ThucTX3-thu.csv", "./tk/firebase-app.js", "./tk/firebase-auth.js", "./tk/firebase-firestore-lite.js"];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    /* tung file mot: thieu 1 file mau khong lam hong ca lan cai */
    return Promise.all(PRE.map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('ctk-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== location.origin) return;            /* khong chan CDN/ngoai */
  if (u.searchParams.has('chk')) return;                /* kiem ban moi: luon di mang */
  if (r.mode === 'navigate') {                          /* trang chinh: mang truoc (3s), mat mang -> ban da luu */
    e.respondWith(new Promise(function (ok) {
      var done = false;
      var t = setTimeout(function () { if (!done) caches.match('./index.html').then(function (m) { if (m && !done) { done = true; ok(m); } }); }, 3000);
      fetch(r).then(function (res) {
        clearTimeout(t);
        if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put('./index.html', cp); }); }
        if (!done) { done = true; ok(res); }
      }).catch(function () {
        clearTimeout(t);
        caches.match('./index.html').then(function (m) { if (!done) { done = true; ok(m || Response.error()); } });
      });
    }));
    return;
  }
  e.respondWith(caches.match(r).then(function (m) {      /* file tinh: cache truoc */
    return m || fetch(r).then(function (res) {
      if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); }
      return res;
    });
  }));
});
