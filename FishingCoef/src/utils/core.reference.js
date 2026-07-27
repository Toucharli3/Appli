/* FishingCoef core — astronomie, marée, solunar.
   Algorithmes: Jean Meeus, Astronomical Algorithms (2e éd.) / SunCalc (MIT). */

const PI = Math.PI, RAD = PI / 180, DEG = 180 / PI;
const J1970 = 2440588, J2000 = 2451545, DAY = 86400000;
const OBL = RAD * 23.4397;

const toJD    = d => d.getTime() / DAY - 0.5 + J1970;
const fromJD  = j => new Date((j + 0.5 - J1970) * DAY);
const toDays  = d => toJD(d) - J2000;

const rightAsc = (l, b) => Math.atan2(Math.sin(l) * Math.cos(OBL) - Math.tan(b) * Math.sin(OBL), Math.cos(l));
const decl     = (l, b) => Math.asin(Math.sin(b) * Math.cos(OBL) + Math.cos(b) * Math.sin(OBL) * Math.sin(l));
const sidereal = (d, lw) => RAD * (280.16 + 360.9856235 * d) - lw;

/* ── Soleil ─────────────────────────────────────────────────────────── */

const solarMeanAnomaly = d => RAD * (357.5291 + 0.98560028 * d);
const eclipticLong = M =>
  M + RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) + RAD * 102.9372 + PI;

function sunCoords(d) {
  const M = solarMeanAnomaly(d), L = eclipticLong(M);
  return { dec: decl(L, 0), ra: rightAsc(L, 0), L, M };
}

function sunAltitude(date, lat, lng) {
  const d = toDays(date), lw = RAD * -lng, phi = RAD * lat, c = sunCoords(d);
  const H = sidereal(d, lw) - c.ra;
  return Math.asin(Math.sin(phi) * Math.sin(c.dec) + Math.cos(phi) * Math.cos(c.dec) * Math.cos(H));
}

const J0 = 0.0009;
const julianCycle  = (d, lw) => Math.round(d - J0 - lw / (2 * PI));
const approxTransit = (Ht, lw, n) => J0 + (Ht + lw) / (2 * PI) + n;
const solarTransitJ = (ds, M, L) => J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
const hourAngle = (h, phi, d) =>
  Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)));

/** Lever, coucher, midi solaire. Renvoie null si le soleil ne franchit pas l'horizon. */
function sunTimes(date, lat, lng) {
  const lw = RAD * -lng, phi = RAD * lat, d = toDays(date);
  const n = julianCycle(d, lw), ds = approxTransit(0, lw, n);
  const M = solarMeanAnomaly(ds), L = eclipticLong(M), dec = decl(L, 0);
  const Jnoon = solarTransitJ(ds, M, L);

  const h0 = RAD * -0.833;
  const cosH = (Math.sin(h0) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
  if (cosH > 1 || cosH < -1) return { sunrise: null, sunset: null, noon: fromJD(Jnoon) };

  const w = hourAngle(h0, phi, dec);
  const Jset = solarTransitJ(approxTransit(w, lw, n), M, L);
  const Jrise = Jnoon - (Jset - Jnoon);
  return { sunrise: fromJD(Jrise), sunset: fromJD(Jset), noon: fromJD(Jnoon) };
}

/* ── Lune ───────────────────────────────────────────────────────────── */

function moonCoords(d) {
  const L = RAD * (218.316 + 13.176396 * d);   // longitude écliptique moyenne
  const M = RAD * (134.963 + 13.064993 * d);   // anomalie moyenne
  const F = RAD * (93.272 + 13.229350 * d);    // argument de latitude
  const l = L + RAD * 6.289 * Math.sin(M);
  const b = RAD * 5.128 * Math.sin(F);
  const dt = 385001 - 20905 * Math.cos(M);
  return { ra: rightAsc(l, b), dec: decl(l, b), dist: dt, lambda: l, M };
}

function moonAltitude(date, lat, lng) {
  const d = toDays(date), lw = RAD * -lng, phi = RAD * lat, c = moonCoords(d);
  const H = sidereal(d, lw) - c.ra;
  const h = Math.asin(Math.sin(phi) * Math.sin(c.dec) + Math.cos(phi) * Math.cos(c.dec) * Math.cos(H));
  return h + RAD * 0.017 / Math.tan(h + RAD * 10.26 / (h * DEG + 5.10)); // réfraction
}

/** Illumination et phase. phase: 0 = nouvelle, 0.25 = PQ, 0.5 = pleine, 0.75 = DQ. */
function moonIllumination(date) {
  const d = toDays(date), s = sunCoords(d), m = moonCoords(d), sdist = 149598000;
  const phi = Math.acos(Math.sin(s.dec) * Math.sin(m.dec) +
    Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra));
  const inc = Math.atan2(sdist * Math.sin(phi), m.dist - sdist * Math.cos(phi));
  const angle = Math.atan2(
    Math.cos(s.dec) * Math.sin(s.ra - m.ra),
    Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra));
  return { fraction: (1 + Math.cos(inc)) / 2, phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / PI };
}

const norm = a => { a %= 2 * PI; if (a > PI) a -= 2 * PI; if (a < -PI) a += 2 * PI; return a; };

/** Angle horaire de la Lune, normalisé [-π, π]. 0 = passage au méridien (transit supérieur). */
function moonHourAngle(date, lng) {
  const d = toDays(date), lw = RAD * -lng;
  return norm(sidereal(d, lw) - moonCoords(d).ra);
}

/**
 * Passages de la Lune au méridien sur [from, from+hours].
 * kind 'upper' = culmination (zénith), 'lower' = anti-culmination (nadir).
 * Recherche des changements de signe avec interpolation linéaire, pas de 5 min.
 */
function moonTransits(from, hours, lng, kind) {
  const off = kind === 'upper' ? 0 : PI;
  const step = 5 * 60000, out = [];
  let prevT = from.getTime(), prevV = norm(moonHourAngle(new Date(prevT), lng) - off);
  for (let t = prevT + step; t <= from.getTime() + hours * 3600000; t += step) {
    const v = norm(moonHourAngle(new Date(t), lng) - off);
    // le transit est le passage de négatif à positif sans saut de branche
    if (prevV < 0 && v >= 0 && v - prevV < PI) {
      out.push(new Date(prevT + (t - prevT) * (-prevV / (v - prevV))));
    }
    prevT = t; prevV = v;
  }
  return out;
}

/** Lever et coucher de la Lune sur la journée civile de `date`. */
function moonRiseSet(date, lat, lng) {
  const s0 = new Date(date); s0.setHours(0, 0, 0, 0);
  const hc = RAD * 0.133;
  let rise = null, set = null;
  let prevT = s0.getTime(), prevH = moonAltitude(new Date(prevT), lat, lng) - hc;
  for (let t = prevT + 300000; t <= s0.getTime() + DAY; t += 300000) {
    const h = moonAltitude(new Date(t), lat, lng) - hc;
    if (prevH < 0 && h >= 0 && !rise) rise = new Date(prevT + (t - prevT) * (-prevH / (h - prevH)));
    if (prevH >= 0 && h < 0 && !set)  set  = new Date(prevT + (t - prevT) * (prevH / (prevH - h)));
    prevT = t; prevH = h;
  }
  return { rise, set };
}

/* ── Coefficient de marée ───────────────────────────────────────────── */
/*
 * Le coefficient français est défini à Brest comme le rapport entre l'amplitude
 * de la marée et l'amplitude moyenne d'une vive-eau d'équinoxe, ×100.
 * On reconstruit l'amplitude à partir des composantes harmoniques dominantes :
 *   M2 (lunaire), S2 (solaire), N2 (elliptique lunaire).
 *   amplitude ∝ M2 + S2·cos(2D) + N2·cos(M)
 * D = élongation Lune–Soleil (0 ou π en syzygie → vive-eau)
 * M = anomalie moyenne lunaire (0 au périgée → marée amplifiée)
 * S2 est modulé par la déclinaison solaire (marées d'équinoxe renforcées).
 */
const M2 = 2.03, S2 = 0.72, N2 = 0.62;

function tideCoefficient(date) {
  const d = toDays(date);
  const m = moonCoords(d), s = sunCoords(d);
  const D = m.lambda - s.L;                       // élongation
  const S2e = S2 * (1 + 0.15 * Math.cos(2 * s.L)); // renfort équinoxial
  const amp = M2 + S2e * Math.cos(2 * D) + N2 * Math.cos(m.M);
  const raw = 100 * amp / (M2 + S2);
  return Math.max(20, Math.min(120, Math.round(raw)));
}

function tideBand(c) {
  if (c >= 100) return { key: 've+', label: 'Grande vive-eau', short: 'Vive-eau' };
  if (c >= 70)  return { key: 've',  label: 'Vive-eau',        short: 'Vive-eau' };
  if (c >= 45)  return { key: 'int', label: 'Marée moyenne',   short: 'Moyenne' };
  return { key: 'me', label: 'Morte-eau', short: 'Morte-eau' };
}

/*
 * Pleines et basses mers estimées.
 * Chaque passage de la Lune au méridien (supérieur ou inférieur) engendre une
 * pleine mer décalée de l'« établissement du port » (intervalle lunitidal).
 * Concarneau / baie de La Forêt ≈ 3 h 40. Estimation, ±30 min.
 */
const LUNITIDAL_MS = (3 * 60 + 40) * 60000;
const SEMI_TIDE_MS = 6 * 3600000 + 12.5 * 60000;

function tideTimes(date, lng) {
  const s0 = new Date(date); s0.setHours(0, 0, 0, 0);
  const from = new Date(s0.getTime() - 14 * 3600000);
  const transits = [
    ...moonTransits(from, 52, lng, 'upper'),
    ...moonTransits(from, 52, lng, 'lower'),
  ];
  const ev = [];
  for (const t of transits) {
    const hw = new Date(t.getTime() + LUNITIDAL_MS);
    ev.push({ type: 'PM', time: hw });
    ev.push({ type: 'BM', time: new Date(hw.getTime() + SEMI_TIDE_MS) });
  }
  const end = s0.getTime() + DAY;
  return ev
    .filter(e => e.time.getTime() >= s0.getTime() && e.time.getTime() < end)
    .sort((a, b) => a.time - b.time);
}

/* ── Solunaire ──────────────────────────────────────────────────────── */

const MAJOR_MS = 60 * 60000;   // ±60 min autour du passage au méridien
const MINOR_MS = 45 * 60000;   // ±45 min autour du lever / coucher

/** Cloche cosinus: 1 au centre, 0 au bord. */
function bell(now, center, half) {
  const dist = Math.abs(now - center);
  return dist > half ? 0 : (1 + Math.cos(PI * dist / half)) / 2;
}

function solunarWindows(date, lat, lng) {
  const s0 = new Date(date); s0.setHours(0, 0, 0, 0);
  const w = [];
  for (const t of moonTransits(new Date(s0.getTime() - 3600000), 26, lng, 'upper'))
    w.push({ type: 'major', center: t, half: MAJOR_MS, cause: 'Lune au zénith' });
  for (const t of moonTransits(new Date(s0.getTime() - 3600000), 26, lng, 'lower'))
    w.push({ type: 'major', center: t, half: MAJOR_MS, cause: 'Lune au nadir' });
  const { rise, set } = moonRiseSet(date, lat, lng);
  if (rise) w.push({ type: 'minor', center: rise, half: MINOR_MS, cause: 'Lever de lune' });
  if (set)  w.push({ type: 'minor', center: set,  half: MINOR_MS, cause: 'Coucher de lune' });

  return w
    .map(x => ({ ...x, start: new Date(+x.center - x.half), end: new Date(+x.center + x.half) }))
    .filter(x => x.end >= s0 && x.start < new Date(+s0 + DAY))
    .sort((a, b) => a.start - b.start);
}

/* ── Score ──────────────────────────────────────────────────────────── */
/*
 * 100 points répartis sur quatre facteurs indépendants et affichés à l'écran :
 *   Solunaire 50 · Lune 20 · Marée 20 · Lumière 10
 */
const WEIGHTS = { solunar: 50, moon: 20, tide: 20, light: 10 };

/*
 * Force lunaire: dans la théorie solunaire, l'intensité d'une période dépend
 * de la phase — les fenêtres de syzygie (nouvelle / pleine lune) sont nettement
 * plus productives que celles de quadrature. Le terme solunaire est donc modulé,
 * et non additionné indépendamment : sans cela chaque jour sature à 50/50,
 * puisqu'il y a toujours un passage au méridien.
 */
const lunarStrength = phase => 0.42 + 0.58 * Math.pow(Math.abs(Math.cos(phase * 2 * PI)), 0.7);

function scoreAt(date, lat, lng, ctx) {
  const t = date.getTime();

  let sol = 0;
  for (const w of ctx.windows) {
    const f = bell(t, +w.center, w.half * 1.5) * (w.type === 'major' ? 1 : 0.64);
    if (f > sol) sol = f;
  }
  sol *= lunarStrength(ctx.phase);

  const moon = Math.pow(Math.abs(Math.cos(ctx.phase * 2 * PI)), 0.5);
  const tide = Math.max(0, Math.min(1, (ctx.coef - 30) / 70));

  let light = 0;
  if (ctx.sun.sunrise) light = Math.max(light, bell(t, +ctx.sun.sunrise, 90 * 60000));
  if (ctx.sun.sunset)  light = Math.max(light, bell(t, +ctx.sun.sunset,  90 * 60000));

  const parts = {
    solunar: sol * WEIGHTS.solunar,
    moon:    moon * WEIGHTS.moon,
    tide:    tide * WEIGHTS.tide,
    light:   light * WEIGHTS.light,
  };
  const total = Math.round(parts.solunar + parts.moon + parts.tide + parts.light);
  return { total: Math.max(0, Math.min(100, total)), parts };
}

function dayContext(date, lat, lng) {
  return {
    windows: solunarWindows(date, lat, lng),
    phase:   moonIllumination(date).phase,
    coef:    tideCoefficient(date),
    sun:     sunTimes(date, lat, lng),
  };
}

/** Courbe du jour échantillonnée toutes les `stepMin` minutes. */
function dayCurve(date, lat, lng, ctx, stepMin = 10) {
  const s0 = new Date(date); s0.setHours(0, 0, 0, 0);
  const n = Math.round(1440 / stepMin), out = [];
  for (let i = 0; i <= n; i++) {
    const t = new Date(+s0 + i * stepMin * 60000);
    out.push({ t, v: scoreAt(t, lat, lng, ctx).total });
  }
  return out;
}

/** Indicateur du jour = pic de la journée (et non un instantané à midi). */
function daySummary(date, lat, lng) {
  const ctx = dayContext(date, lat, lng);
  const curve = dayCurve(date, lat, lng, ctx, 15);
  let best = curve[0];
  for (const p of curve) if (p.v > best.v) best = p;
  return { date, ctx, peak: best.v, peakAt: best.t, coef: ctx.coef, phase: ctx.phase };
}

/* Seuils calés sur la distribution réelle du site : sur une année, « Excellent »
   ne doit sortir que sur les jours vraiment exceptionnels (~1 sur 5). */
function rating(v) {
  if (v >= 84) return 'Excellent';
  if (v >= 71) return 'Très bon';
  if (v >= 55) return 'Bon';
  if (v >= 38) return 'Moyen';
  return 'Faible';
}

module.exports = {
  toJD, toDays, sunTimes, sunAltitude, moonIllumination, moonAltitude, moonRiseSet,
  moonTransits, moonHourAngle, tideCoefficient, tideBand, tideTimes,
  solunarWindows, scoreAt, dayContext, dayCurve, daySummary, rating, WEIGHTS,
};
