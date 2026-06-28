import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getMoonPhaseEmoji, getMoonPhaseName } from '../utils/astronomy';
import { colors, scoreColor } from '../theme/colors';
import WeekForecast from '../components/WeekForecast';

interface DayData {
  date:   Date;
  score:  number;
  rating: string;
  phase:  number;
}

interface Props {
  forecast:    DayData[];
  today:       Date;
  tideForecast: Array<{ date: Date; coefficient: number }>;
}

const MONTHS_FR = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];

const DAYS_FR_LONG = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

export default function CalendarScreen({ forecast, today, tideForecast }: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>
        {MONTHS_FR[today.getMonth()]} {today.getFullYear()}
      </Text>

      <WeekForecast forecast={forecast} today={today} />

      {/* Detailed day list */}
      <Text style={styles.sectionTitle}>Détail jour par jour</Text>

      {forecast.map((day, i) => {
        const isToday = day.date.toDateString() === today.toDateString();
        const tide    = tideForecast[i];
        const c       = scoreColor(day.score);

        return (
          <View key={i} style={[styles.dayRow, isToday && styles.dayRowToday]}>
            <View style={styles.dayLeft}>
              <Text style={[styles.dayName, isToday && { color: colors.cyan }]}>
                {isToday ? "Aujourd'hui" : DAYS_FR_LONG[day.date.getDay()]}
              </Text>
              <Text style={styles.dayDate}>
                {day.date.getDate()} {MONTHS_FR[day.date.getMonth()]}
              </Text>
            </View>

            <Text style={styles.moonEmoji}>{getMoonPhaseEmoji(day.phase)}</Text>

            <View style={styles.dayCenter}>
              <Text style={styles.phaseLabel}>{getMoonPhaseName(day.phase)}</Text>
              <Text style={styles.tideLabel}>Marée : {tide?.coefficient ?? '--'}</Text>
            </View>

            <View style={styles.scoreBlock}>
              <Text style={[styles.scoreNum, { color: c }]}>{day.score}</Text>
              <Text style={[styles.scoreRating, { color: c }]}>{day.rating}</Text>
            </View>
          </View>
        );
      })}

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Coefficient de marée</Text>
        {[
          { range: '95–120', label: 'Grande vive-eau', color: '#EF5350' },
          { range: '70–94',  label: 'Vive-eau',        color: '#FF9800' },
          { range: '50–69',  label: 'Intermédiaire',   color: '#66BB6A' },
          { range: '20–49',  label: 'Morte-eau',        color: '#42A5F5' },
        ].map(r => (
          <View key={r.range} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: r.color }]} />
            <Text style={styles.legendRange}>{r.range}</Text>
            <Text style={styles.legendLabel}>{r.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding:       16,
    paddingBottom: 32,
  },
  heading: {
    color:        colors.textPrimary,
    fontSize:     22,
    fontWeight:   '800',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    color:        colors.textPrimary,
    fontSize:     16,
    fontWeight:   '700',
    marginBottom: 10,
    marginTop:    6,
  },
  dayRow: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: colors.bgCard,
    borderRadius:   12,
    padding:        14,
    marginBottom:    8,
    gap:             12,
  },
  dayRowToday: {
    borderWidth:  1.5,
    borderColor:  colors.cyan,
  },
  dayLeft: {
    width: 90,
  },
  dayName: {
    color:      colors.textPrimary,
    fontSize:   14,
    fontWeight: '600',
  },
  dayDate: {
    color:    colors.textSecond,
    fontSize: 12,
    marginTop: 2,
  },
  moonEmoji: {
    fontSize: 24,
  },
  dayCenter: {
    flex: 1,
  },
  phaseLabel: {
    color:    colors.textSecond,
    fontSize: 12,
  },
  tideLabel: {
    color:    colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  scoreBlock: {
    alignItems: 'flex-end',
  },
  scoreNum: {
    fontSize:   22,
    fontWeight: '800',
  },
  scoreRating: {
    fontSize:  11,
    fontWeight: '600',
    marginTop:  1,
  },
  legend: {
    backgroundColor: colors.bgCard,
    borderRadius:    16,
    padding:         16,
    marginTop:        8,
    gap:              10,
  },
  legendTitle: {
    color:        colors.textPrimary,
    fontSize:     14,
    fontWeight:   '700',
    marginBottom:  4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            10,
  },
  legendDot: {
    width:        10,
    height:       10,
    borderRadius:  5,
  },
  legendRange: {
    color:      colors.textSecond,
    fontSize:   13,
    fontWeight: '600',
    width:       60,
  },
  legendLabel: {
    color:    colors.textSecond,
    fontSize: 13,
  },
});
