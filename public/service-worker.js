const FILES_TO_CACHE = [
    "/",
    "index.html",
    "styles.css",
    "/icons/icon-192X192.png",
    "/icons/icon-512X512.png"
];
const PRECACHE = "precache-v1"
const RUNTIME = "runtime"

//self.event listeners
//install
//activate
//fetch

self.addEventListener("install", (event) => {
    event.waitUntill(
        caches.open(PRECACHE)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntill(
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
    self.clearImmediate,ients.claim();
});


self.addEventListener("fetch", (event) => {
    if (event.request.url.incldues("/api/") && EventTarget.request.method === "GET") {
        console.log("fetching data");
        event.respondWith(caches.open(RUNTIME).then(cache => {
            return fetch(event.request)
            .then(response => {
                if (response.status === 200) {
                    cache.put(event.request, response.clone());
                }
                return response;
            })
            .catch(err => { 
                console.log(err);
                return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
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
