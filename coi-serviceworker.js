/*! coi-serviceworker v0.1.7 | MIT License | https://github.com/gzuidhof/coi-serviceworker */
if (typeof window === "undefined") {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener("fetch", (event) => {
        if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
            return;
        }

        event.respondWith(
            fetch(event.request).then((response) => {
                if (response.status === 0) {
                    return response;
                }

                const newHeaders = new Headers(response.headers);
                newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
                newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders,
                });
            })
        );
    });
} else {
    (() => {
        const script = document.currentScript;
        const reloader = () => {
            if (window.top === window) {
                window.location.reload();
            }
        };

        if (window.crossOriginIsolated !== false) return;

        if (!window.isSecureContext) {
            console.error("COI-ServiceWorker: Not a secure context, cannot register ServiceWorker");
            return;
        }

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register(window.location.pathname).then((registration) => {
                console.log("COI-ServiceWorker: ServiceWorker registered", registration.scope);

                registration.addEventListener("updatefound", () => {
                    console.log("COI-ServiceWorker: Update found, reloading...");
                    reloader();
                });

                if (registration.active && !navigator.serviceWorker.controller) {
                    console.log("COI-ServiceWorker: ServiceWorker active, reloading...");
                    reloader();
                }
            });
        }
    })();
}
