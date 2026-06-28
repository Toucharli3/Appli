export const colors = {
  bg:           '#0A1628',
  bgCard:       '#132038',
  bgCardLight:  '#1A2C47',
  primary:      '#1E90FF',
  cyan:         '#00D4E8',
  green:        '#4CAF50',
  orange:       '#FF9800',
  red:          '#F44336',
  textPrimary:  '#FFFFFF',
  textSecond:   '#90A4AE',
  textMuted:    '#546E7A',
  border:       '#1E3050',
  excellent:    '#00E676',
  good:         '#69F0AE',
  medium:       '#FFD740',
  poor:         '#FF6D00',
  bad:          '#DD2C00',
};

export function scoreColor(score: number): string {
  if (score >= 80) return colors.excellent;
  if (score >= 60) return colors.good;
  if (score >= 40) return colors.medium;
  if (score >= 20) return colors.poor;
  return colors.bad;
}
