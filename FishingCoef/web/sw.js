/*
 * Service worker — sert à une seule chose : que l'application s'ouvre au large,
 * sans réseau. Sans lui, toucher l'icône hors couverture n'affiche rien, ce qui
 * vide de son sens tout le travail fait pour que les calculs tournent hors ligne.
 */

const SHELL = "glenan-shell-v1";
const TILES = "glenan-tiles-v1";
const TILE_LIMIT = 600;          // ~40 Mo au pire, largement sous les quotas

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-32.png",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL)
      // Une icône manquante ne doit pas faire échouer l'installation entière.
      .then(c => Promise.allSettled(SHELL_FILES.map(f => c.add(f))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== SHELL && k !== TILES).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/** Empêche le cache des tuiles de gonfler sans fin. */
async function trimTiles() {
  const cache = await caches.open(TILES);
  const keys = await cache.keys();
  if (keys.length <= TILE_LIMIT) return;
  for (const k of keys.slice(0, keys.length - TILE_LIMIT)) await cache.delete(k);
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  /* La météo n'est jamais mise en cache ici : la page tient déjà son propre
     historique daté, et un cache muet lui ferait afficher du vieux en le
     croyant frais. */
  if (url.hostname.endsWith("open-meteo.com")) return;

  /* Tuiles de carte : le cache d'abord. C'est ce qui permet de retrouver le
     fond déjà consulté une fois au large. */
  if (url.hostname === "tile.openstreetmap.org" || url.hostname === "tiles.openseamap.org") {
    event.respondWith((async () => {
      const cache = await caches.open(TILES);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok) { await cache.put(req, res.clone()); trimTiles(); }
        return res;
      } catch {
        return hit || Response.error();
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  /* Coquille de l'application : on rend immédiatement la version gardée, et on
     rafraîchit en arrière-plan pour la fois suivante. L'ouverture est donc
     instantanée et fonctionne sans réseau, au prix d'une version de retard
     après un déploiement. */
  event.respondWith((async () => {
    const cache = await caches.open(SHELL);
    const hit = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req)
      .then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
      .catch(() => null);
    if (hit) { event.waitUntil(network); return hit; }
    const res = await network;
    if (res) return res;
    /* Hors ligne et jamais visité : on sert au moins la page d'accueil. */
    return (await cache.match("./index.html")) || Response.error();
  })());
});
