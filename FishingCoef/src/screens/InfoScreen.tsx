import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function InfoScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>À propos de FishingCoef</Text>

      <Section title="🎣 Théorie Solunar">
        <Text style={styles.bodyText}>
          La théorie solunar a été développée par John Alden Knight en 1926. Elle prédit que
          l'activité des poissons est influencée par les positions du soleil et de la lune.
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Périodes majeures (~2h)</Text>
          <Text style={styles.cardBody}>
            Lorsque la lune est au zénith (transit supérieur) ou au nadir (transit inférieur).
            Ce sont les meilleures fenêtres de pêche — le poisson est au maximum d'activité.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Périodes mineures (~1h30)</Text>
          <Text style={styles.cardBody}>
            Lors du lever et du coucher de la lune. L'activité est bonne, bien que moindre
            que lors des périodes majeures.
          </Text>
        </View>
      </Section>

      <Section title="🌙 Phase lunaire">
        <Text style={styles.bodyText}>
          L'illumination lunaire influence directement l'activité des poissons. La nouvelle lune
          et la pleine lune génèrent les marées les plus fortes (vives-eaux) et stimulent
          l'alimentation des poissons.
        </Text>
        <View style={styles.phaseGrid}>
          {[
            { emoji: '🌑', name: 'Nouvelle Lune',   score: '★★★★★' },
            { emoji: '🌒', name: 'Croissant',        score: '★★★☆☆' },
            { emoji: '🌓', name: 'Premier Quartier', score: '★★★☆☆' },
            { emoji: '🌔', name: 'Gibbeuse crois.',  score: '★★★★☆' },
            { emoji: '🌕', name: 'Pleine Lune',      score: '★★★★★' },
            { emoji: '🌖', name: 'Gibbeuse décr.',   score: '★★★★☆' },
            { emoji: '🌗', name: 'Dernier Quartier', score: '★★★☆☆' },
            { emoji: '🌘', name: 'Dernier Croiss.',  score: '★★★☆☆' },
          ].map((p, i) => (
            <View key={i} style={styles.phaseItem}>
              <Text style={styles.phaseEmoji}>{p.emoji}</Text>
              <Text style={styles.phaseName}>{p.name}</Text>
              <Text style={styles.phaseScore}>{p.score}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="🌊 Coefficient de marée">
        <Text style={styles.bodyText}>
          Le coefficient de marée (système français SHOM) va de 20 à 120. Il mesure
          l'amplitude des marées : plus il est élevé, plus les courants sont forts et
          les poissons actifs.
        </Text>
        {[
          { range: '95–120', label: 'Grande vive-eau', desc: 'Forts courants, excellent brassage' },
          { range: '70–94',  label: 'Vive-eau',        desc: 'Bons courants, pêche productive' },
          { range: '50–69',  label: 'Intermédiaire',   desc: 'Conditions moyennes' },
          { range: '35–49',  label: 'Morte-eau',       desc: 'Faibles courants, eau calme' },
          { range: '20–34',  label: 'Petite morte-eau',desc: 'Pêche en eau profonde conseillée' },
        ].map(r => (
          <InfoRow key={r.range} label={`${r.range} — ${r.label}`} value={r.desc} />
        ))}
      </Section>

      <Section title="📊 Calcul du score">
        <Text style={styles.bodyText}>
          Le coefficient de pêche (0–100) combine trois facteurs :
        </Text>
        <InfoRow label="Phase lunaire (0–30 pts)" value="Pic à nouvelle et pleine lune" />
        <InfoRow label="Activité solunar (0–60 pts)" value="Période majeure/mineure active" />
        <InfoRow label="Bonus aube/crépuscule (0–10 pts)" value="±2h autour du lever/coucher" />
      </Section>

      <Section title="⚠️ Avertissements">
        <Text style={styles.bodyText}>
          • Les données astronomiques sont calculées localement avec des algorithmes précis.{'\n'}
          • Le coefficient de marée est une simulation basée sur la phase lunaire, non les données
            officielles SHOM. Pour la navigation, consultez toujours les tables officielles.{'\n'}
          • La théorie solunar est une aide à la décision, non une garantie de résultat.
        </Text>
      </Section>

      <View style={styles.versionBlock}>
        <Text style={styles.versionText}>FishingCoef v1.0.0</Text>
        <Text style={styles.versionSub}>
          Clone open-source de Fishing Point • Calculs locaux sans API
        </Text>
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
    paddingBottom: 40,
  },
  heading: {
    color:        colors.textPrimary,
    fontSize:     22,
    fontWeight:   '800',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color:        colors.textPrimary,
    fontSize:     17,
    fontWeight:   '700',
    marginBottom: 10,
  },
  bodyText: {
    color:      colors.textSecond,
    fontSize:   13,
    lineHeight: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius:    12,
    padding:         12,
    marginBottom:    8,
  },
  cardTitle: {
    color:        colors.textPrimary,
    fontSize:     14,
    fontWeight:   '600',
    marginBottom:  4,
  },
  cardBody: {
    color:      colors.textSecond,
    fontSize:   12,
    lineHeight: 18,
  },
  phaseGrid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:             8,
  },
  phaseItem: {
    width:           '22%',
    backgroundColor: colors.bgCard,
    borderRadius:    10,
    padding:          8,
    alignItems:      'center',
    gap:              3,
  },
  phaseEmoji: { fontSize: 22 },
  phaseName: {
    color:     colors.textSecond,
    fontSize:  9,
    textAlign: 'center',
  },
  phaseScore: {
    color:    colors.orange,
    fontSize: 9,
  },
  infoRow: {
    backgroundColor: colors.bgCard,
    borderRadius:    8,
    padding:         10,
    marginBottom:    6,
  },
  infoLabel: {
    color:      colors.textPrimary,
    fontSize:   13,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    color:    colors.textSecond,
    fontSize: 12,
  },
  versionBlock: {
    alignItems:     'center',
    marginTop:      16,
    paddingTop:     16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap:             4,
  },
  versionText: {
    color:      colors.textMuted,
    fontSize:   13,
    fontWeight: '600',
  },
  versionSub: {
    color:    colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});
