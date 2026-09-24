/* Hält die App offline bereit. Bei jeder neuen Fassung ändert build-app.py die Version. */
var VERSION = 'patience-2026-09-24-1434';
var DATEIEN = ['./','./index.html','./manifest.webmanifest',
               './icon-180.png','./icon-192.png','./icon-512.png','./icon-152.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(DATEIEN); })
    .then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(k!==VERSION) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(treffer){
      if(treffer) return treffer;
      return fetch(e.request).then(function(antwort){
        try{
          var u = new URL(e.request.url);
          var merken = (u.origin === location.origin) || /fonts\.(googleapis|gstatic)\.com/.test(u.host);
          if(merken && antwort && antwort.status === 200){
            var kopie = antwort.clone();
            caches.open(VERSION).then(function(c){ c.put(e.request, kopie); });
          }
        }catch(err){}
        return antwort;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
