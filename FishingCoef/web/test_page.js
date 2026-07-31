/*
 * Tests de la page.
 *
 * Le plus important d'entre eux est l'étalonnage : la note sur 100 a été
 * réglée pour qu'« Excellent » reste exceptionnel sur une année. Toute
 * modification du modèle risque de dérégler cette distribution sans que rien
 * ne le signale à l'écran. Ce test l'attrape.
 *
 *   node test_page.js          (nécessite playwright)
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const PAGE = path.join(__dirname, "glenan.html");
const TMP = path.join(require("os").tmpdir(), "glenan-test.html");

/* Jeu de données du fond, au volume et à la composition observés en production. */
function seabedFixture() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const osm = [];
  for (let i = 0; i < 77; i++)
    osm.push({ k: "wreck", la: 47.63 + rnd() * 0.31, lo: -4.24 + rnd() * 0.58,
               n: i % 6 ? null : `Épave ${i}`, d: +(4 + rnd() * 46).toFixed(1) });
  osm.push({ k: "shoal", la: 47.7331, lo: -3.9958, n: "Guiriden", d: null });
  for (let i = 0; i < 61; i++)
    osm.push({ k: "rock", la: 47.65 + rnd() * 0.25, lo: -4.20 + rnd() * 0.50,
               n: null, d: +(1 + rnd() * 24).toFixed(1) });
  const bat = [];
  for (let i = 0; i < 45; i++)
    bat.push({ k: "bank", la: 47.63 + rnd() * 0.31, lo: -4.24 + rnd() * 0.58,
               d: +(5 + rnd() * 50).toFixed(1), r: +(4 + rnd() * 15).toFixed(1), s: null });
  for (let i = 0; i < 25; i++)
    bat.push({ k: "drop", la: 47.63 + rnd() * 0.31, lo: -4.24 + rnd() * 0.58,
               d: +(10 + rnd() * 45).toFixed(1), r: null, s: +(0.1 + rnd() * 0.2).toFixed(3) });
  return `window.__SEABED__ = ${JSON.stringify(osm)};\n`
       + `window.__BATHY__ = ${JSON.stringify(bat)};`;
}

const failures = [];
function check(label, ok, detail = "") {
  console.log(`  ${ok ? "ok  " : "ÉCHEC"} ${label}${detail ? " — " + detail : ""}`);
  if (!ok) failures.push(label);
}

(async () => {
  fs.writeFileSync(TMP,
    `<!doctype html><html><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<style>*{margin:0;padding:0}</style></head><body><script>`
    + seabedFixture() + `</` + `script>` + fs.readFileSync(PAGE, "utf8")
    + `</body></html>`);

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    timezoneId: "Europe/Paris", locale: "fr-FR", colorScheme: "dark",
  });
  /* Aucun appel réseau : on teste le moteur, pas la météo du jour. */
  await ctx.route("**://*.open-meteo.com/**", r => r.abort());
  await ctx.route("**://tile.openstreetmap.org/**", r => r.fulfill({
    status: 200, contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }));

  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error" && !/net::/.test(m.text())) errors.push(m.text()); });

  await page.goto("file://" + TMP);
  await page.waitForTimeout(2500);

  console.log("la page se construit :");
  check("aucune erreur JavaScript", errors.length === 0, errors.join(" | "));
  check("pas de débordement horizontal",
    !(await page.evaluate(() => document.documentElement.scrollWidth > 390)));
  check("le programme est rendu", !!(await page.$(".plan-hero")));
  check("la carte porte des marqueurs",
    (await page.evaluate(() => document.querySelectorAll(".pin").length)) > 0);

  console.log("\nétalonnage de la note sur une année :");
  const dist = await page.evaluate(() => {
    const b = {};
    for (let i = 0; i < 365; i++) {
      const d = new Date(2026, 0, 1, 12); d.setDate(d.getDate() + i);
      const ctx = dayContext(d, LAT, LNG);
      const s0 = new Date(d); s0.setHours(0, 0, 0, 0);
      let peak = 0;
      for (let k = 0; k < 96; k++) {
        const v = scoreAt(new Date(+s0 + k * 900000), ctx).total;
        if (v > peak) peak = v;
      }
      const r = rating(peak); b[r] = (b[r] || 0) + 1;
    }
    return b;
  });
  const pct = k => Math.round((dist[k] || 0) / 365 * 100);
  console.log(`    ${Object.entries(dist).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  /* Marges larges : on veut attraper un déréglage, pas un écart d'un jour. */
  check("Excellent reste exceptionnel", pct("Excellent") >= 18 && pct("Excellent") <= 35,
    `${pct("Excellent")} %`);
  check("les cinq niveaux sont utilisés", Object.keys(dist).length === 5,
    Object.keys(dist).join("/"));
  check("Faible reste rare", pct("Faible") <= 12, `${pct("Faible")} %`);

  console.log("\nle coefficient de marée suit sa définition :");
  const tide = await page.evaluate(() => {
    let mn = 999, mx = 0, sum = 0;
    for (let i = 0; i < 365; i++) {
      const c = tideCoefficient(new Date(Date.UTC(2026, 0, 1, 12) + i * 86400000));
      mn = Math.min(mn, c); mx = Math.max(mx, c); sum += c;
    }
    return { mn, mx, moy: Math.round(sum / 365) };
  });
  check("borné dans l'échelle 20–120", tide.mn >= 20 && tide.mx <= 120,
    `${tide.mn}–${tide.mx}`);
  check("moyenne proche du SHOM", tide.moy >= 68 && tide.moy <= 80, `${tide.moy}`);

  console.log("\nles repères théoriques restent à leur place :");
  const sep = await page.evaluate(() => ({
    plan: getPlan().every(e => !e.spot.seabed),
    horsClassement: [...document.querySelectorAll("#spot-rank .rank-row")].length > 0,
  }));
  check("aucun repère théorique dans le programme", sep.plan);
  check("le classement des postes est peuplé", sep.horsClassement);

  console.log("\nle verrou de sécurité se déclenche :");
  const safety = await page.evaluate(() => {
    const gale = { wind: 55, dir: 225, wave: 3.0, period: 8, gust: 70 };
    const calm = { wind: 12, dir: 225, wave: 0.6, period: 8, gust: 18 };
    return { gale: fishability(gale).unsafe, calm: fishability(calm).unsafe,
             rafale: fishability({ ...calm, gust: 70 }).unsafe };
  });
  check("coup de vent → impraticable", safety.gale === true);
  check("temps maniable → praticable", safety.calm === false);
  check("rafale seule suffit à alerter", safety.rafale === true);

  await browser.close();
  console.log();
  if (failures.length) {
    console.log(`ÉCHEC — ${failures.length} test(s) : ${failures.join(", ")}`);
    process.exit(1);
  }
  console.log("tous les tests passent");
})();
