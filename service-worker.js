"use strict";

const CACHE_NAME = "otoiro-shell-v106";
// Deploy the compact-link sharing UI and receiver together.
const APP_FILES = [
  "./",
  "./index.html",
  "./about.html",
  "./policy.html",
  "./assets/icons/app-192.png",
  "./assets/icons/app-512.png",
  "./assets/icons/app-180.png",
  "./manifest.webmanifest",
  "./assets/css/style.css",
  "./assets/css/about.css",
  "./assets/js/sharing.js",
  "./assets/js/result-share.js",
  "./assets/js/song-library.js",
  "./assets/js/free-video.js",
  "./assets/js/game.js",
  "./assets/js/diagnostics.js",
  "./assets/js/catalog-info.js",
  "./assets/js/feedback.js",
  "./assets/data/custom-charts.json",
  "./assets/icons/kalimba.svg",
  "./assets/icons/wood-music.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request, { cache: "no-cache" }).then((response) => {
      if (response.ok && APP_FILES.some((path) => new URL(path, self.location.href).href === event.request.url)) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)));
      }
      return response;
    }).catch(async (error) => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      // Cloudflare redirects about.html to /about; serve the same cached page offline.
      if (event.request.mode === "navigate" && new URL(event.request.url).pathname === new URL("./about", self.location.href).pathname) {
        const about = await caches.match("./about.html");
        if (about) return about;
      }
      if (event.request.mode === "navigate") return caches.match("./index.html");
      throw error;
    })
  );
});
