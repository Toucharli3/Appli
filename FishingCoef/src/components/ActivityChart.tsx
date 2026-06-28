/**
 * 24-hour horizontal bar chart showing hourly fishing activity.
 * Periods are highlighted; current hour is marked with a cursor.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SolunarPeriod } from '../utils/solunar';
import { colors, scoreColor } from '../theme/colors';

interface Props {
  hourlyScores: number[];
  periods:      SolunarPeriod[];
  currentHour:  number;
}

function fmt(h: number): string {
  return `${h.toString().padStart(2, '0')}h`;
}

export default function ActivityChart({ hourlyScores, periods, currentHour }: Props) {
  const maxScore = Math.max(...hourlyScores, 1);

  function isPeriodActive(hour: number): { active: boolean; type?: 'major' | 'minor' } {
    for (const p of periods) {
      const sh = p.start.getHours() + p.start.getMinutes() / 60;
      const eh = p.end.getHours()   + p.end.getMinutes()   / 60;
      if (hour >= sh && hour < eh) return { active: true, type: p.type };
    }
    return { active: false };
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Activité du jour</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.chart}>
          {hourlyScores.map((score, h) => {
            const barH       = Math.max(4, (score / maxScore) * 80);
            const { active, type } = isPeriodActive(h);
            const isCurrent  = h === currentHour;
            const barColor   = active
              ? (type === 'major' ? colors.cyan : colors.primary)
              : scoreColor(score);

            return (
              <View key={h} style={styles.column}>
                <View style={styles.barContainer}>
                  {isCurrent && <View style={styles.cursor} />}
                  <View
                    style={[
                      styles.bar,
                      {
                        height:          barH,
                        backgroundColor: barColor,
                        opacity:         active ? 1 : 0.55,
                      },
                    ]}
                  />
                </View>
                {h % 3 === 0 && (
                  <Text style={[styles.label, isCurrent && styles.labelActive]}>
                    {fmt(h)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.cyan }]} />
          <Text style={styles.legendText}>Période majeure</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Période mineure</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
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
  scroll: {
    flexDirection: 'row',
  },
  chart: {
    flexDirection:  'row',
    alignItems:     'flex-end',
    height:         110,
    paddingBottom:  20,
  },
  column: {
    width:          20,
    alignItems:     'center',
    justifyContent: 'flex-end',
    marginRight:    2,
    position:       'relative',
  },
  barContainer: {
    width:          16,
    alignItems:     'center',
    justifyContent: 'flex-end',
    position:       'relative',
  },
  bar: {
    width:        16,
    borderRadius: 3,
  },
  cursor: {
    position:        'absolute',
    bottom:          -4,
    width:           2,
    height:          90,
    backgroundColor: colors.orange,
    opacity:         0.9,
    zIndex:          10,
  },
  label: {
    color:      colors.textMuted,
    fontSize:   9,
    marginTop:  4,
    position:   'absolute',
    bottom:     0,
  },
  labelActive: {
    color: colors.orange,
  },
  legend: {
    flexDirection:  'row',
    marginTop:      12,
    gap:            16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  legendText: {
    color:    colors.textSecond,
    fontSize: 12,
  },
});
