import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SolunarPeriod } from '../utils/solunar';
import { colors } from '../theme/colors';

interface Props {
  periods:     SolunarPeriod[];
  currentTime: Date;
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function isActive(period: SolunarPeriod, now: Date): boolean {
  return now >= period.start && now <= period.end;
}

export default function SolunarCard({ periods, currentTime }: Props) {
  // Show max 4 periods for today
  const displayed = periods.slice(0, 4);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Périodes solunar</Text>
        <Text style={styles.subtitle}>Théorie de Knight (1926)</Text>
      </View>

      {displayed.length === 0 ? (
        <Text style={styles.empty}>Pas de données disponibles</Text>
      ) : (
        displayed.map((p, i) => {
          const active = isActive(p, currentTime);
          const isMajor = p.type === 'major';
          return (
            <View key={i} style={[styles.row, active && styles.rowActive]}>
              {/* Type badge */}
              <View style={[styles.badge, isMajor ? styles.badgeMajor : styles.badgeMinor]}>
                <Text style={styles.badgeText}>
                  {isMajor ? 'MAJEURE' : 'MINEURE'}
                </Text>
              </View>

              {/* Time range */}
              <View style={styles.timeBlock}>
                <Text style={[styles.timeRange, active && styles.timeRangeActive]}>
                  {fmtTime(p.start)} – {fmtTime(p.end)}
                </Text>
                <Text style={styles.duration}>
                  {isMajor ? '2h de pêche optimale' : '1h30 de bonne pêche'}
                </Text>
              </View>

              {/* Active indicator */}
              {active && (
                <View style={styles.activeDot}>
                  <View style={styles.activeDotInner} />
                </View>
              )}
            </View>
          );
        })
      )}

      <View style={styles.info}>
        <Text style={styles.infoText}>
          🎣 Conseil : Les périodes majeures (transit lunaire) sont 2× plus efficaces que les mineures.
        </Text>
      </View>
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
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'baseline',
    marginBottom:   12,
  },
  title: {
    color:      colors.textPrimary,
    fontSize:   16,
    fontWeight: '700',
  },
  subtitle: {
    color:    colors.textMuted,
    fontSize: 11,
  },
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius:   10,
    marginBottom:    6,
    backgroundColor: colors.bgCardLight,
    gap:             12,
  },
  rowActive: {
    borderWidth:  1,
    borderColor:  colors.cyan,
    backgroundColor: '#0D2A3E',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      6,
    minWidth:          72,
    alignItems:        'center',
  },
  badgeMajor: {
    backgroundColor: '#00D4E820',
    borderWidth:     1,
    borderColor:     colors.cyan,
  },
  badgeMinor: {
    backgroundColor: '#1E90FF20',
    borderWidth:     1,
    borderColor:     colors.primary,
  },
  badgeText: {
    fontSize:     9,
    fontWeight:   '800',
    color:        colors.textPrimary,
    letterSpacing: 0.5,
  },
  timeBlock: {
    flex: 1,
  },
  timeRange: {
    color:      colors.textPrimary,
    fontSize:   14,
    fontWeight: '600',
  },
  timeRangeActive: {
    color: colors.cyan,
  },
  duration: {
    color:    colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  activeDot: {
    width:           16,
    height:          16,
    borderRadius:    8,
    backgroundColor: '#00D4E830',
    alignItems:      'center',
    justifyContent:  'center',
  },
  activeDotInner: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: colors.cyan,
  },
  empty: {
    color:     colors.textMuted,
    textAlign: 'center',
    padding:   16,
  },
  info: {
    marginTop:        10,
    padding:          10,
    backgroundColor:  colors.bgCardLight,
    borderRadius:     8,
  },
  infoText: {
    color:      colors.textSecond,
    fontSize:   12,
    lineHeight: 18,
  },
});
