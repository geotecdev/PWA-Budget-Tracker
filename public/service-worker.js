const FILES_TO_CACHE = [
    "/",
    "index.html",
    "styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];
const PRECACHE = "precache-v1"
const RUNTIME = "runtime"

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(PRECACHE)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys()
        .then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== PRECACHE && key !== RUNTIME) {
                        console.log("clearing cache", key);
                        return caches.delete(key);
                    }
                })
            ); 
        })
    );
    self.clients.claim();
});


self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/api/") && event.request.method === "GET") {
        console.log("fetching data");
        event.respondWith(caches.open(RUNTIME).then(cache => {
            return fetch(event.request)
            .then(response => {
                if (response.status === 200) {
                    cache.put(event.request.url, response.clone());
                }
                return response;
            })
            .catch(err => { 
                console.log(err);
                return cache.match(event.request);
            });
            })
        );
        return;
    }
    event.respondWith(
        caches.open(PRECACHE).then((cache) => {
            return cache.match(event.request).then((response) => {
                return response || fetch(event.request);
            });
        })
    );
});
