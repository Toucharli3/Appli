import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getMoonPhaseEmoji } from '../utils/astronomy';
import { colors, scoreColor } from '../theme/colors';

interface DayData {
  date:   Date;
  score:  number;
  rating: string;
  phase:  number;
}

interface Props {
  forecast: DayData[];
  today:    Date;
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function WeekForecast({ forecast, today }: Props) {
  const todayStr = today.toDateString();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Prévisions 7 jours</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {forecast.map((day, i) => {
            const isToday = day.date.toDateString() === todayStr;
            const c       = scoreColor(day.score);
            const dayName = DAYS_FR[day.date.getDay()];
            const dayNum  = day.date.getDate();

            return (
              <View
                key={i}
                style={[styles.dayCard, isToday && styles.dayCardToday]}
              >
                <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                  {dayName}
                </Text>
                <Text style={styles.dayNum}>{dayNum}</Text>
                <Text style={styles.moon}>{getMoonPhaseEmoji(day.phase)}</Text>
                {/* Score bar */}
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${day.score}%`, backgroundColor: c },
                    ]}
                  />
                </View>
                <Text style={[styles.score, { color: c }]}>{day.score}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap:            8,
  },
  dayCard: {
    width:          62,
    alignItems:     'center',
    backgroundColor: colors.bgCardLight,
    borderRadius:   12,
    paddingVertical: 10,
    gap:             4,
  },
  dayCardToday: {
    borderWidth:  1.5,
    borderColor:  colors.cyan,
    backgroundColor: '#0D2A3E',
  },
  dayName: {
    color:      colors.textSecond,
    fontSize:   12,
    fontWeight: '600',
  },
  dayNameToday: {
    color: colors.cyan,
  },
  dayNum: {
    color:      colors.textPrimary,
    fontSize:   18,
    fontWeight: '700',
  },
  moon: {
    fontSize: 20,
  },
  barTrack: {
    width:           6,
    height:          50,
    backgroundColor: colors.bgCard,
    borderRadius:    3,
    overflow:        'hidden',
    justifyContent:  'flex-end',
    marginVertical:   4,
  },
  barFill: {
    width:        6,
    borderRadius: 3,
  },
  score: {
    fontSize:   13,
    fontWeight: '700',
  },
});
