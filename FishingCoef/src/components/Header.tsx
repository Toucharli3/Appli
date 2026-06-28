import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  locationName: string;
  date:         Date;
  onRefresh?:   () => void;
}

export default function Header({ locationName, date, onRefresh }: Props) {
  const dateStr = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });

  const timeStr = date.toLocaleTimeString('fr-FR', {
    hour:   '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.locationRow}>
          <Text style={styles.pin}>📍</Text>
          <Text style={styles.location} numberOfLines={1}>{locationName}</Text>
        </View>
        <Text style={styles.date}>{dateStr}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.time}>{timeStr}</Text>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Text style={styles.refreshIcon}>↻</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: 20,
    paddingVertical:   14,
    backgroundColor:   colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: {
    flex: 1,
    gap:   2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            4,
  },
  pin: {
    fontSize: 14,
  },
  location: {
    color:      colors.textPrimary,
    fontSize:   16,
    fontWeight: '700',
    flexShrink: 1,
  },
  date: {
    color:     colors.textSecond,
    fontSize:  12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  right: {
    alignItems: 'flex-end',
    gap:         4,
  },
  time: {
    color:      colors.cyan,
    fontSize:   20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  refreshBtn: {
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: colors.bgCardLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  refreshIcon: {
    color:    colors.textSecond,
    fontSize: 16,
  },
});
