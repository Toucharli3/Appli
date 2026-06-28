/**
 * Tidal coefficient simulation (coefficient de marée — système français SHOM).
 *
 * The official coefficient (20–120) is calculated from tidal harmonics specific
 * to each French port and is published daily by the SHOM. Without port-specific
 * harmonic data or an API, we simulate the coefficient using the dominant
 * astronomical drivers:
 *
 *   1. Spring-neap cycle  (synodic month  ≈ 29.53 days)
 *      → high at new moon / full moon, low at quarter moons
 *
 *   2. Perigee-apogee variation (anomalistic month ≈ 27.55 days)
 *      → perigee amplifies tides ("perigean spring tides" can reach 115–120)
 *
 *   3. Declination effect (tropical month ≈ 27.32 days)
 *      → small modulation; ignored here for simplicity
 *
 * Formula:
 *   coef = BASE + SPRING_AMP × |cos(φ)| + PERIGEE_AMP × cos(anomaly × 2π)
 *
 * where φ = phase × 2π (0 at new/full moon → |cos φ| = 1).
 * Result is clamped to [20, 120].
 */

import { getMoonIllumination, toJulianDate } from './astronomy';

// ─── Constants ────────────────────────────────────────────────────────────────

const SYNODIC_MONTH      = 29.530588853;  // days
const ANOMALISTIC_MONTH  = 27.554551868;  // days
const BASE_COEF          = 70;
const SPRING_AMP         = 45;  // spring-neap swing
const PERIGEE_AMP        = 12;  // perigee amplification

// Known perigee: 2018-01-01 21:54 UTC → JD 2458120.413
const KNOWN_PERIGEE_JD   = 2458120.413;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Anomalistic phase 0–1 (0 = perigee, 0.5 = apogee) */
function anomalisticPhase(date: Date): number {
  const jd = toJulianDate(date);
  const raw = ((jd - KNOWN_PERIGEE_JD) % ANOMALISTIC_MONTH) / ANOMALISTIC_MONTH;
  return raw < 0 ? raw + 1 : raw;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface TideInfo {
  /** Simulated tidal coefficient 20–120 */
  coefficient: number;
  /** Qualitative label */
  label: TideLabel;
  /** Tide regime */
  regime: 'Vive-eau' | 'Morte-eau' | 'Intermédiaire';
  /** True if spring tide (coef ≥ 70) */
  isSpring: boolean;
}

export type TideLabel =
  | 'Vive-eau exceptionnelle'
  | 'Grande vive-eau'
  | 'Vive-eau'
  | 'Intermédiaire'
  | 'Morte-eau'
  | 'Petite morte-eau';

function getLabel(coef: number): TideLabel {
  if (coef >= 110) return 'Vive-eau exceptionnelle';
  if (coef >= 90)  return 'Grande vive-eau';
  if (coef >= 70)  return 'Vive-eau';
  if (coef >= 50)  return 'Intermédiaire';
  if (coef >= 35)  return 'Morte-eau';
  return 'Petite morte-eau';
}

export function getTideInfo(date: Date): TideInfo {
  const { phase } = getMoonIllumination(date);
  const anomaly   = anomalisticPhase(date);

  // Spring-neap: |cos(phase × 2π)| → 1 at new/full moon, 0 at quarters
  const springFactor  = Math.abs(Math.cos(phase * 2 * Math.PI));

  // Perigee: cos(anomaly × 2π) → 1 at perigee, -1 at apogee
  const perigeeFactor = Math.cos(anomaly * 2 * Math.PI);

  const raw = BASE_COEF + SPRING_AMP * springFactor + PERIGEE_AMP * perigeeFactor;
  const coefficient = Math.round(Math.max(20, Math.min(120, raw)));

  const label    = getLabel(coefficient);
  const isSpring = coefficient >= 70;
  const regime   = coefficient >= 70
    ? 'Vive-eau'
    : coefficient >= 50
      ? 'Intermédiaire'
      : 'Morte-eau';

  return { coefficient, label, regime, isSpring };
}

/** Returns tide coefficients for the next `days` days (one per day). */
export function getTideForecast(
  startDate: Date,
  days: number
): Array<{ date: Date; coefficient: number }> {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    d.setHours(12, 0, 0, 0);
    return { date: d, coefficient: getTideInfo(d).coefficient };
  });
}
