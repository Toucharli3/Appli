import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getMoonPhaseName, getMoonPhaseEmoji, MoonIllumination } from '../utils/astronomy';
import { colors } from '../theme/colors';

interface Props {
  illumination: MoonIllumination;
  moonrise:     Date | null;
  moonset:      Date | null;
  upperTransit: Date | null;
}

function fmtTime(d: Date | null): string {
  if (!d) return '--:--';
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function IlluminationBar({ fraction }: { fraction: number }) {
  return (
    <View style={bar.track}>
      <View style={[bar.fill, { width: `${Math.round(fraction * 100)}%` }]} />
    </View>
  );
}

const bar = StyleSheet.create({
  track: {
    height:          6,
    backgroundColor: colors.bgCardLight,
    borderRadius:    3,
    overflow:        'hidden',
    marginTop:       6,
  },
  fill: {
    height:          6,
    backgroundColor: '#FFD700',
    borderRadius:    3,
  },
});

export default function MoonCard({ illumination, moonrise, moonset, upperTransit }: Props) {
  const phaseName = getMoonPhaseName(illumination.phase);
  const emoji     = getMoonPhaseEmoji(illumination.phase);
  const illumPct  = Math.round(illumination.fraction * 100);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Lune</Text>

      <View style={styles.row}>
        {/* Big emoji */}
        <Text style={styles.emoji}>{emoji}</Text>

        <View style={styles.info}>
          <Text style={styles.phaseName}>{phaseName}</Text>
          <Text style={styles.illumLabel}>Illumination : {illumPct}%</Text>
          <IlluminationBar fraction={illumination.fraction} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.timesRow}>
        <TimeItem icon="🌅" label="Lever" value={fmtTime(moonrise)} />
        <TimeItem icon="🌕" label="Transit" value={fmtTime(upperTransit)} />
        <TimeItem icon="🌇" label="Coucher" value={fmtTime(moonset)} />
      </View>
    </View>
  );
}

function TimeItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.timeItem}>
      <Text style={styles.timeIcon}>{icon}</Text>
      <Text style={styles.timeValue}>{value}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius:    16,
    padding:         16,
    marginBottom:    12,
  },
  title: {
    color:        colors.textPrimary,
    fontSize:     16,
    fontWeight:   '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           16,
  },
  emoji: {
    fontSize: 56,
  },
  info: {
    flex: 1,
  },
  phaseName: {
    color:      colors.textPrimary,
    fontSize:   16,
    fontWeight: '600',
  },
  illumLabel: {
    color:     colors.textSecond,
    fontSize:  13,
    marginTop: 4,
  },
  divider: {
    height:           1,
    backgroundColor:  colors.border,
    marginVertical:   14,
  },
  timesRow: {
    flexDirection:  'row',
    justifyContent: 'space-around',
  },
  timeItem: {
    alignItems: 'center',
    gap:        4,
  },
  timeIcon: {
    fontSize: 20,
  },
  timeValue: {
    color:      colors.textPrimary,
    fontSize:   15,
    fontWeight: '700',
  },
  timeLabel: {
    color:    colors.textMuted,
    fontSize: 11,
  },
});
