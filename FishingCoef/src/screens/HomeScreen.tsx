import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SolunarData } from '../utils/solunar';
import { TideInfo } from '../utils/tides';
import { getMoonIllumination, getMoonTimes, MoonIllumination, MoonTimes } from '../utils/astronomy';
import ScoreGauge from '../components/ScoreGauge';
import ActivityChart from '../components/ActivityChart';
import MoonCard from '../components/MoonCard';
import SolunarCard from '../components/SolunarCard';
import TideCard from '../components/TideCard';
import { colors } from '../theme/colors';

interface Props {
  solunar:    SolunarData;
  tideInfo:   TideInfo;
  moonIllum:  MoonIllumination;
  moonTimes:  MoonTimes;
  currentTime: Date;
  refreshing: boolean;
  onRefresh:  () => void;
}

export default function HomeScreen({
  solunar,
  tideInfo,
  moonIllum,
  moonTimes,
  currentTime,
  refreshing,
  onRefresh,
}: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.cyan}
          colors={[colors.cyan]}
        />
      }
    >
      {/* Main gauge */}
      <View style={styles.gaugeSection}>
        <ScoreGauge score={solunar.score} rating={solunar.rating} size={240} />

        <View style={styles.gaugeSubtitle}>
          <Text style={styles.subtitle}>Coefficient de pêche</Text>
          <Text style={styles.hint}>Basé sur la théorie solunar + phase lunaire</Text>
        </View>
      </View>

      {/* Quick stats row */}
      <View style={styles.statsRow}>
        <StatChip
          label="Phase"
          value={`${Math.round(solunar.moonPhase * 100)}%`}
          icon="🌙"
        />
        <StatChip
          label="Illumination"
          value={`${Math.round(solunar.moonIllum * 100)}%`}
          icon="💡"
        />
        <StatChip
          label="Coef. marée"
          value={`${tideInfo.coefficient}`}
          icon="🌊"
        />
      </View>

      {/* 24h activity chart */}
      <ActivityChart
        hourlyScores={solunar.hourlyScores}
        periods={solunar.periods}
        currentHour={currentTime.getHours()}
      />

      {/* Solunar periods */}
      <SolunarCard periods={solunar.periods} currentTime={currentTime} />

      {/* Moon card */}
      <MoonCard
        illumination={moonIllum}
        moonrise={moonTimes.rise}
        moonset={moonTimes.set}
        upperTransit={moonTimes.upperTransit}
      />

      {/* Tidal coefficient */}
      <TideCard tideInfo={tideInfo} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Données calculées localement • Mise à jour automatique toutes les minutes
        </Text>
      </View>
    </ScrollView>
  );
}

function StatChip({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={chip.wrapper}>
      <Text style={chip.icon}>{icon}</Text>
      <Text style={chip.value}>{value}</Text>
      <Text style={chip.label}>{label}</Text>
    </View>
  );
}

const chip = StyleSheet.create({
  wrapper: {
    flex:            1,
    backgroundColor: colors.bgCard,
    borderRadius:    12,
    padding:         12,
    alignItems:      'center',
    gap:              4,
  },
  icon: { fontSize: 20 },
  value: {
    color:      colors.textPrimary,
    fontSize:   16,
    fontWeight: '700',
  },
  label: {
    color:    colors.textMuted,
    fontSize: 11,
  },
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding:       16,
    paddingBottom: 32,
  },
  gaugeSection: {
    alignItems:    'center',
    paddingVertical: 24,
  },
  gaugeSubtitle: {
    alignItems: 'center',
    marginTop:  12,
    gap:          2,
  },
  subtitle: {
    color:      colors.textPrimary,
    fontSize:   18,
    fontWeight: '700',
  },
  hint: {
    color:    colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection:  'row',
    gap:             8,
    marginBottom:   12,
  },
  footer: {
    alignItems:  'center',
    marginTop:   16,
    paddingTop:  16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    color:    colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});
