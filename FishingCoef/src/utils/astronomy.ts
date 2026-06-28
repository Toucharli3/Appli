/**
 * Astronomical calculations for sun and moon positions.
 * Algorithms adapted from Jean Meeus "Astronomical Algorithms" (2nd ed.)
 * and the SunCalc.js library (Vladimir Agafonkin, MIT license).
 */

const PI = Math.PI;
const RAD = PI / 180;
const DEG = 180 / PI;
const J1970 = 2440588;    // Julian date of Unix epoch (Jan 1.5, 1970)
const J2000 = 2451545;    // Julian date of J2000.0 (Jan 1.5, 2000)
const DAY_MS = 86400000;
const e = RAD * 23.4397;  // obliquity of the ecliptic

// ─── Julian Date ──────────────────────────────────────────────────────────────

export function toJulianDate(date: Date): number {
  return date.getTime() / DAY_MS - 0.5 + J1970;
}

export function fromJulianDate(jd: number): Date {
  return new Date((jd + 0.5 - J1970) * DAY_MS);
}

/** Days since J2000.0 */
export function toDays(date: Date): number {
  return toJulianDate(date) - J2000;
}

// ─── Ecliptic ↔ Equatorial conversion ─────────────────────────────────────────

function rightAscension(l: number, b: number): number {
  return Math.atan2(
    Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e),
    Math.cos(l)
  );
}

function declination(l: number, b: number): number {
  return Math.asin(
    Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)
  );
}

// ─── Observer-based helpers ───────────────────────────────────────────────────

function azimuth(H: number, phi: number, dec: number): number {
  return Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)
  );
}

function altitude(H: number, phi: number, dec: number): number {
  return Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)
  );
}

/** Greenwich Mean Sidereal Time in radians */
function siderealTime(d: number, lw: number): number {
  return RAD * (280.16 + 360.9856235 * d) - lw;
}

// ─── Sun ──────────────────────────────────────────────────────────────────────

function sunCoords(d: number): { ra: number; dec: number } {
  const M = RAD * (357.5291 + 0.98560028 * d);
  const L = RAD * (280.46966 + 0.98564736 * d);
  const C = RAD * (
    1.9148 * Math.sin(M) +
    0.02   * Math.sin(2 * M) +
    0.0003 * Math.sin(3 * M)
  );
  const P = RAD * 102.9372;
  const lambda = L + C + P + PI;
  return {
    dec: declination(lambda, 0),
    ra:  rightAscension(lambda, 0),
  };
}

export interface SunPosition {
  azimuth:  number; // radians, south = 0, west = positive
  altitude: number; // radians above horizon
}

export function getSunPosition(date: Date, lat: number, lng: number): SunPosition {
  const lw  = RAD * -lng;
  const phi = RAD *  lat;
  const d   = toDays(date);
  const c   = sunCoords(d);
  const H   = siderealTime(d, lw) - c.ra;
  return {
    azimuth:  azimuth(H, phi, c.dec),
    altitude: altitude(H, phi, c.dec),
  };
}

// ─── Sun rise / set / noon ────────────────────────────────────────────────────

const J0 = 0.0009;

function julianCycle(d: number, lw: number): number {
  return Math.round(d - J0 - lw / (2 * PI));
}

function approxTransit(Ht: number, lw: number, n: number): number {
  return J0 + (Ht + lw) / (2 * PI) + n;
}

function solarTransitJ(ds: number, M: number, L: number): number {
  return J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
}

function hourAngleForAltitude(h: number, phi: number, d: number): number {
  return Math.acos(
    (Math.sin(h) - Math.sin(phi) * Math.sin(d)) /
    (Math.cos(phi) * Math.cos(d))
  );
}

export interface SunTimes {
  sunrise:   Date;
  sunset:    Date;
  solarNoon: Date;
}

export function getSunTimes(date: Date, lat: number, lng: number): SunTimes {
  const lw  = RAD * -lng;
  const phi = RAD *  lat;
  const d   = toDays(date);
  const n   = julianCycle(d, lw);
  const ds  = approxTransit(0, lw, n);
  const M   = RAD * (357.5291 + 0.98560028 * ds);
  const L   = RAD * (280.46966 + 0.98564736 * ds);
  const C   = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P   = RAD * 102.9372;
  const lam = L + C + P + PI;
  const dec = declination(lam, 0);
  const Jnoon = solarTransitJ(ds, M, lam);

  const h0 = RAD * (-0.833); // altitude at sunrise/sunset
  const w  = hourAngleForAltitude(h0, phi, dec);
  const a  = approxTransit(w, lw, n);
  const b  = approxTransit(-w, lw, n);

  return {
    solarNoon: fromJulianDate(Jnoon),
    sunrise:   fromJulianDate(solarTransitJ(a, M, lam) - (Jnoon - solarTransitJ(ds, M, lam))),
    sunset:    fromJulianDate(solarTransitJ(b, M, lam) - (Jnoon - solarTransitJ(ds, M, lam))),
  };
}

// ─── Moon ─────────────────────────────────────────────────────────────────────

function moonCoords(d: number): { ra: number; dec: number; dist: number } {
  const L = RAD * (218.316 + 13.176396 * d); // ecliptic longitude
  const M = RAD * (134.963 + 13.064993 * d); // mean anomaly
  const F = RAD * (93.272  + 13.229350 * d); // mean distance

  const l  = L + RAD * 6.289 * Math.sin(M);
  const b  = RAD * 5.128 * Math.sin(F);
  const dt = 385001 - 20905 * Math.cos(M);   // distance in km

  return {
    ra:   rightAscension(l, b),
    dec:  declination(l, b),
    dist: dt,
  };
}

export interface MoonPosition {
  azimuth:          number;
  altitude:         number;
  distance:         number;
  parallacticAngle: number;
}

export function getMoonPosition(date: Date, lat: number, lng: number): MoonPosition {
  const lw  = RAD * -lng;
  const phi = RAD *  lat;
  const d   = toDays(date);
  const c   = moonCoords(d);
  const H   = siderealTime(d, lw) - c.ra;
  const pa  = Math.atan2(
    Math.sin(H),
    Math.tan(phi) * Math.cos(c.dec) - Math.sin(c.dec) * Math.cos(H)
  );

  const h = altitude(H, phi, c.dec);
  // atmospheric refraction correction
  const hCorrected = h + RAD * 0.017 / Math.tan(h + RAD * 10.26 / (h * DEG + 5.10));

  return {
    azimuth:          azimuth(H, phi, c.dec),
    altitude:         hCorrected,
    distance:         c.dist,
    parallacticAngle: pa,
  };
}

// ─── Moon illumination / phase ────────────────────────────────────────────────

export interface MoonIllumination {
  /** 0–1: fraction of disk illuminated */
  fraction: number;
  /**
   * 0–1 cyclic phase:
   * 0 = new moon, 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter
   */
  phase: number;
  /** Midpoint angle of illuminated limb (radians) */
  angle: number;
}

export function getMoonIllumination(date: Date): MoonIllumination {
  const d = toDays(date);
  const s = sunCoords(d);
  const m = moonCoords(d);
  const sdist = 149598000; // km, Earth–Sun

  const phi = Math.acos(
    Math.sin(s.dec) * Math.sin(m.dec) +
    Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra)
  );
  const inc = Math.atan2(
    sdist * Math.sin(phi),
    m.dist - sdist * Math.cos(phi)
  );
  const angle = Math.atan2(
    Math.cos(s.dec) * Math.sin(s.ra - m.ra),
    Math.sin(s.dec) * Math.cos(m.dec) -
      Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra)
  );

  return {
    fraction: (1 + Math.cos(inc)) / 2,
    phase:    0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / PI,
    angle,
  };
}

// ─── Moon phase label ─────────────────────────────────────────────────────────

export type MoonPhaseName =
  | 'Nouvelle Lune'
  | 'Premier Croissant'
  | 'Premier Quartier'
  | 'Lune Gibbeuse Croissante'
  | 'Pleine Lune'
  | 'Lune Gibbeuse Décroissante'
  | 'Dernier Quartier'
  | 'Dernier Croissant';

export function getMoonPhaseName(phase: number): MoonPhaseName {
  if (phase < 0.0625 || phase >= 0.9375) return 'Nouvelle Lune';
  if (phase < 0.1875) return 'Premier Croissant';
  if (phase < 0.3125) return 'Premier Quartier';
  if (phase < 0.4375) return 'Lune Gibbeuse Croissante';
  if (phase < 0.5625) return 'Pleine Lune';
  if (phase < 0.6875) return 'Lune Gibbeuse Décroissante';
  if (phase < 0.8125) return 'Dernier Quartier';
  return 'Dernier Croissant';
}

export function getMoonPhaseEmoji(phase: number): string {
  const idx = Math.round(phase * 8) % 8;
  return ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'][idx];
}

// ─── Moon rise / set / transits ───────────────────────────────────────────────

function hoursLater(date: Date, h: number): Date {
  return new Date(date.getTime() + h * 3600000);
}

export interface MoonTimes {
  rise:        Date | null;
  set:         Date | null;
  upperTransit: Date | null; // moon due south / max altitude
  lowerTransit: Date | null; // moon due north / min altitude
  alwaysUp?:   boolean;
  alwaysDown?: boolean;
}

export function getMoonTimes(date: Date, lat: number, lng: number): MoonTimes {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const hc = RAD * 0.133; // apparent radius + parallax
  let h0 = getMoonPosition(startOfDay, lat, lng).altitude - hc;

  let rise:         Date | null = null;
  let set:          Date | null = null;

  // Sample in 2-hour steps
  for (let i = 1; i <= 24; i += 2) {
    const h1 = getMoonPosition(hoursLater(startOfDay, i),     lat, lng).altitude - hc;
    const h2 = getMoonPosition(hoursLater(startOfDay, i + 1), lat, lng).altitude - hc;

    const a  = (h0 + h2) / 2 - h1;
    const b  = (h2 - h0) / 2;
    const xe = -b / (2 * a);
    const ye = (a * xe + b) * xe + h1;
    const d  = b * b - 4 * a * h1;

    let roots = 0;
    let x1 = 0, x2 = 0;

    if (d >= 0) {
      const dx = Math.sqrt(d) / (Math.abs(a) * 2);
      x1 = xe - dx;
      x2 = xe + dx;
      if (Math.abs(x1) <= 1) roots++;
      if (Math.abs(x2) <= 1) roots++;
      if (x1 < -1) x1 = x2;
    }

    if (roots === 1) {
      if (h0 < 0) {
        if (!rise) rise = hoursLater(startOfDay, i + x1);
      } else {
        if (!set) set = hoursLater(startOfDay, i + x1);
      }
    } else if (roots === 2) {
      if (!rise) rise = hoursLater(startOfDay, i + (ye < 0 ? x2 : x1));
      if (!set)  set  = hoursLater(startOfDay, i + (ye < 0 ? x1 : x2));
    }

    if (rise && set) break;
    h0 = h2;
  }

  // Find upper and lower transit by sampling altitude every 10 min
  const samples: { t: Date; alt: number }[] = [];
  for (let i = 0; i <= 144; i++) {
    const t = new Date(startOfDay.getTime() + i * 600000);
    samples.push({ t, alt: getMoonPosition(t, lat, lng).altitude });
  }

  let upperTransit: Date | null = null;
  let lowerTransit: Date | null = null;

  for (let i = 1; i < samples.length - 1; i++) {
    const prev = samples[i - 1].alt;
    const curr = samples[i].alt;
    const next = samples[i + 1].alt;

    if (curr > prev && curr > next && !upperTransit) {
      upperTransit = samples[i].t;
    }
    if (curr < prev && curr < next && !lowerTransit) {
      lowerTransit = samples[i].t;
    }
    if (upperTransit && lowerTransit) break;
  }

  const result: MoonTimes = { rise, set, upperTransit, lowerTransit };

  if (!rise && !set) {
    const midAlt = getMoonPosition(hoursLater(startOfDay, 12), lat, lng).altitude;
    if (midAlt > 0) result.alwaysUp = true;
    else            result.alwaysDown = true;
  }

  return result;
}
