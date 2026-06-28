import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TideInfo } from '../utils/tides';
import { colors } from '../theme/colors';

interface Props {
  tideInfo: TideInfo;
}

function CoefficientBar({ coefficient }: { coefficient: number }) {
  const percent = ((coefficient - 20) / 100) * 100; // scale 20–120 → 0–100%

  // Color gradient: blue (morte-eau) → green → orange → red (vive-eau)
  const barColor =
    coefficient >= 95 ? '#EF5350' :
    coefficient >= 70 ? '#FF9800' :
    coefficient >= 50 ? '#66BB6A' :
                        '#42A5F5';

  return (
    <View style={bar.wrapper}>
      {/* Scale labels */}
      <View style={bar.scaleRow}>
        {[20, 45, 70, 95, 120].map(v => (
          <Text key={v} style={bar.scaleLabel}>{v}</Text>
        ))}
      </View>
      {/* Track */}
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${percent}%`, backgroundColor: barColor }]} />
        {/* Cursor */}
        <View style={[bar.cursor, { left: `${percent}%` }]} />
      </View>
      {/* Zone labels */}
      <View style={bar.zoneRow}>
        <Text style={bar.zoneLabel}>Morte-eau</Text>
        <Text style={bar.zoneLabel}>Interméd.</Text>
        <Text style={bar.zoneLabel}>Vive-eau</Text>
      </View>
    </View>
  );
}

const bar = StyleSheet.create({
  wrapper:    { marginVertical: 10 },
  scaleRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  scaleLabel: { color: colors.textMuted, fontSize: 10 },
  track: {
    height:          10,
    backgroundColor: colors.bgCardLight,
    borderRadius:    5,
    overflow:        'visible',
    position:        'relative',
  },
  fill: {
    height:          10,
    borderRadius:    5,
  },
  cursor: {
    position:        'absolute',
    top:             -4,
    width:           3,
    height:          18,
    backgroundColor: colors.textPrimary,
    borderRadius:    2,
    marginLeft:      -1.5,
  },
  zoneRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:       6,
  },
  zoneLabel: { color: colors.textMuted, fontSize: 10 },
});

export default function TideCard({ tideInfo }: Props) {
  const { coefficient, label, regime, isSpring } = tideInfo;

  const regimeColor = isSpring ? colors.orange : colors.primary;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Coefficient de marée</Text>
        <Text style={styles.source}>Simulation SHOM</Text>
      </View>

      <View style={styles.main}>
        <View style={styles.coefBlock}>
          <Text style={[styles.coef, { color: regimeColor }]}>{coefficient}</Text>
          <Text style={styles.coefMax}>/120</Text>
        </View>

        <View style={styles.labels}>
          <View style={[styles.regimeBadge, { borderColor: regimeColor }]}>
            <Text style={[styles.regimeText, { color: regimeColor }]}>{regime}</Text>
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>

      <CoefficientBar coefficient={coefficient} />

      <View style={styles.info}>
        <Text style={styles.infoText}>
          {coefficient >= 70
            ? `🌊 Forts courants — excellent brassage des eaux. Poissons actifs en vive-eau.`
            : coefficient >= 50
              ? `🌊 Courants modérés — conditions intermédiaires.`
              : `🌊 Faibles courants — eau calme. Préférer les postes profonds.`}
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
    marginBottom:   8,
  },
  title: {
    color:      colors.textPrimary,
    fontSize:   16,
    fontWeight: '700',
  },
  source: {
    color:    colors.textMuted,
    fontSize: 10,
    fontStyle: 'italic',
  },
  main: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           16,
  },
  coefBlock: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap:            4,
  },
  coef: {
    fontSize:   48,
    fontWeight: '800',
  },
  coefMax: {
    fontSize: 18,
    color:    colors.textSecond,
  },
  labels: {
    flex: 1,
    gap:  6,
  },
  regimeBadge: {
    borderWidth:       1,
    borderRadius:      6,
    paddingHorizontal: 10,
    paddingVertical:    4,
    alignSelf:         'flex-start',
  },
  regimeText: {
    fontSize:   13,
    fontWeight: '700',
  },
  label: {
    color:    colors.textSecond,
    fontSize: 13,
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
