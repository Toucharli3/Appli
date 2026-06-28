/**
 * Solunar theory implementation.
 * John Alden Knight (1926): fish activity correlates with moon transits
 * and rise/set events.
 *
 * Major periods: ±60 min around upper/lower moon transit
 * Minor periods: ±45 min around moonrise/moonset
 *
 * The global fishing score (0–100) combines:
 *   - Moon phase factor      (0–30 pts)  peaks at new/full moon
 *   - Solunar activity       (0–60 pts)  current proximity to a period
 *   - Dawn / dusk bonus      (0–10 pts)  fish feed at low light
 */

import {
  getMoonIllumination,
  getMoonPosition,
  getMoonTimes,
  getSunPosition,
  getSunTimes,
} from './astronomy';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PeriodType = 'major' | 'minor';

export interface SolunarPeriod {
  type:  PeriodType;
  start: Date;
  end:   Date;
  /** Score 0–100 for this specific period (major ~90–100, minor ~60–75) */
  score: number;
}

export interface SolunarData {
  periods:      SolunarPeriod[];
  moonIllum:    number; // 0–1
  moonPhase:    number; // 0–1 (0=new, 0.5=full)
  /** Current fishing score 0–100 */
  score:        number;
  /** Rating label */
  rating:       'Excellent' | 'Très bon' | 'Bon' | 'Moyen' | 'Faible';
  /** Hourly forecast (24 entries, index = hour 0–23) */
  hourlyScores: number[];
}

// ─── Period durations ─────────────────────────────────────────────────────────

const MAJOR_HALF = 60 * 60000; // ±60 min
const MINOR_HALF = 45 * 60000; // ±45 min

// ─── Moon phase factor (0–1) ──────────────────────────────────────────────────

/**
 * Peaks at new moon (phase≈0) and full moon (phase≈0.5).
 * Dips at quarter moons (0.25, 0.75).
 * Formula: |cos(phase × 2π)| ^ 0.4 — makes peaks broad
 */
function moonPhaseFactor(phase: number): number {
  return Math.pow(Math.abs(Math.cos(phase * 2 * Math.PI)), 0.4);
}

// ─── Proximity factor for solunar periods ─────────────────────────────────────

/**
 * Returns 0–1 representing how "inside" a period the current time is.
 * 1.0 = exactly at transit/rise/set, 0 = outside window.
 */
function proximityFactor(
  nowMs: number,
  centerMs: number,
  halfWindowMs: number
): number {
  const dist = Math.abs(nowMs - centerMs);
  if (dist > halfWindowMs) return 0;
  // Cosine bell — smooth peak at center
  return (1 + Math.cos((Math.PI * dist) / halfWindowMs)) / 2;
}

// ─── Dawn / dusk factor (0–1) ─────────────────────────────────────────────────

function dawnDuskFactor(date: Date, lat: number, lng: number): number {
  try {
    const { sunrise, sunset } = getSunTimes(date, lat, lng);
    const now = date.getTime();
    const sr  = sunrise.getTime();
    const ss  = sunset.getTime();
    const win = 2 * 3600000; // 2-hour bonus window

    const dawnFactor = proximityFactor(now, sr, win);
    const duskFactor = proximityFactor(now, ss, win);
    return Math.max(dawnFactor, duskFactor);
  } catch {
    return 0;
  }
}

// ─── Build solunar periods from moon times ────────────────────────────────────

function buildPeriods(moonTimes: ReturnType<typeof getMoonTimes>): SolunarPeriod[] {
  const periods: SolunarPeriod[] = [];

  const addPeriod = (
    center: Date | null,
    type: PeriodType
  ): void => {
    if (!center) return;
    const half = type === 'major' ? MAJOR_HALF : MINOR_HALF;
    const baseScore = type === 'major' ? 95 : 65;
    periods.push({
      type,
      start: new Date(center.getTime() - half),
      end:   new Date(center.getTime() + half),
      score: baseScore,
    });
  };

  addPeriod(moonTimes.upperTransit, 'major');
  addPeriod(moonTimes.lowerTransit, 'major');
  addPeriod(moonTimes.rise,         'minor');
  addPeriod(moonTimes.set,          'minor');

  return periods.sort((a, b) => a.start.getTime() - b.start.getTime());
}

// ─── Solunar activity factor (0–1) for a given moment ────────────────────────

function solunarFactor(nowMs: number, periods: SolunarPeriod[]): number {
  let best = 0;
  for (const p of periods) {
    const center   = (p.start.getTime() + p.end.getTime()) / 2;
    const halfWin  = p.type === 'major' ? MAJOR_HALF : MINOR_HALF;
    const f        = proximityFactor(nowMs, center, halfWin * 1.5); // slightly wider
    if (f > best) best = f;
  }
  return best;
}

// ─── Composite score 0–100 ────────────────────────────────────────────────────

function computeScore(
  date: Date,
  lat: number,
  lng: number,
  phaseFactor: number,
  periods: SolunarPeriod[]
): number {
  const nowMs  = date.getTime();
  const sol    = solunarFactor(nowMs, periods);
  const dawn   = dawnDuskFactor(date, lat, lng);

  const phasePoints  = phaseFactor * 30;
  const solunarPts   = sol * 60;
  const dawnPts      = dawn * 10;

  return Math.min(100, Math.round(phasePoints + solunarPts + dawnPts));
}

// ─── Rating label ─────────────────────────────────────────────────────────────

function getRating(score: number): SolunarData['rating'] {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Très bon';
  if (score >= 40) return 'Bon';
  if (score >= 20) return 'Moyen';
  return 'Faible';
}

// ─── Main API ─────────────────────────────────────────────────────────────────

export function getSolunarData(
  date: Date,
  lat: number,
  lng: number
): SolunarData {
  const illum    = getMoonIllumination(date);
  const phaseFac = moonPhaseFactor(illum.phase);
  const moonTimes = getMoonTimes(date, lat, lng);
  const periods  = buildPeriods(moonTimes);

  const score    = computeScore(date, lat, lng, phaseFac, periods);
  const rating   = getRating(score);

  // Build 24-hour hourly forecast for the given day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const hourlyScores = Array.from({ length: 24 }, (_, h) => {
    const t = new Date(dayStart.getTime() + h * 3600000);
    return computeScore(t, lat, lng, phaseFac, periods);
  });

  return {
    periods,
    moonIllum:  illum.fraction,
    moonPhase:  illum.phase,
    score,
    rating,
    hourlyScores,
  };
}

/** Compute a fishing score for each day in a date range (used for weekly calendar). */
export function getWeekForecast(
  startDate: Date,
  days: number,
  lat: number,
  lng: number
): Array<{ date: Date; score: number; rating: SolunarData['rating']; phase: number }> {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    d.setHours(12, 0, 0, 0); // midday snapshot

    const illum    = getMoonIllumination(d);
    const phaseFac = moonPhaseFactor(illum.phase);
    const moonTimes = getMoonTimes(d, lat, lng);
    const periods  = buildPeriods(moonTimes);
    const score    = computeScore(d, lat, lng, phaseFac, periods);

    return {
      date:   d,
      score,
      rating: getRating(score),
      phase:  illum.phase,
    };
  });
}
