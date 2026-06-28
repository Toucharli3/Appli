/**
 * Circular gauge displaying the main fishing score (0–100).
 * Drawn with pure React Native Views (no SVG dependency).
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, scoreColor } from '../theme/colors';

interface Props {
  score: number;
  rating: string;
  size?: number;
}

export default function ScoreGauge({ score, rating, size = 220 }: Props) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const color = scoreColor(score);
  const strokeWidth = size * 0.07;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // We draw the arc using border + clip tricks via rotate transforms on View segments
  // Split into 36 segments of 10° each to simulate a stroke-dasharray arc
  const segments = 36;
  const degreesPerSegment = 300 / segments; // 300° total arc (leave 60° gap at bottom)
  const startAngle = 120; // degrees — start at bottom-left

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Track ring */}
      {Array.from({ length: segments }).map((_, i) => {
        const angle = startAngle + i * degreesPerSegment;
        const filled = i / segments <= score / 100;
        return (
          <View
            key={i}
            style={[
              styles.segment,
              {
                width:  strokeWidth * 0.7,
                height: strokeWidth * 0.7,
                borderRadius: strokeWidth * 0.35,
                backgroundColor: filled ? color : colors.bgCardLight,
                transform: [
                  { translateX: (size / 2 - strokeWidth / 2) * Math.cos((angle * Math.PI) / 180) },
                  { translateY: (size / 2 - strokeWidth / 2) * Math.sin((angle * Math.PI) / 180) },
                ],
                opacity: filled ? 1 : 0.3,
              },
            ]}
          />
        );
      })}

      {/* Inner content */}
      <View style={styles.inner} pointerEvents="none">
        <Text style={[styles.scoreText, { color }]}>{score}</Text>
        <Text style={styles.scoreLabel}>/ 100</Text>
        <Text style={[styles.ratingText, { color }]}>{rating}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position:  'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    position: 'absolute',
  },
  inner: {
    position:       'absolute',
    alignItems:     'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize:   62,
    fontWeight: '800',
    lineHeight: 68,
  },
  scoreLabel: {
    fontSize:   16,
    color:      colors.textSecond,
    marginTop:  -4,
  },
  ratingText: {
    fontSize:   15,
    fontWeight: '700',
    marginTop:   8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
