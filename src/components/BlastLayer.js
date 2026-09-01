import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Easing } from 'react-native';

const DEFAULT_COLORS = ['#ff3b3b', '#ff7a00', '#ffd000', '#ffffff'];

/**
 * Renders a set of short-lived particle bursts. Each burst re-fires whenever it
 * appears in the list (keyed by its id), then cleans itself up visually by
 * fading out. Used both for line-clear "blasts" and invalid-drop sparks.
 *
 * @param {{ id:number, x:number, y:number, colors?:string[], shards?:number, spread?:number }[]} blasts
 */
export default function BlastLayer({ blasts }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {(blasts || []).map((b) => (
        <Burst
          key={b.id}
          x={b.x}
          y={b.y}
          colors={b.colors || DEFAULT_COLORS}
          shardCount={b.shards || 10}
          spread={b.spread || 48}
        />
      ))}
    </View>
  );
}

function Burst({ x, y, colors, shardCount, spread }) {
  const shards = useRef(
    Array.from({ length: shardCount }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / shardCount + Math.random() * 0.4;
      const distance = spread * (0.6 + Math.random() * 0.7);
      return {
        progress: new Animated.Value(0),
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: 6 + Math.random() * 7,
        color: colors[i % colors.length],
      };
    })
  ).current;

  useEffect(() => {
    Animated.stagger(
      8,
      shards.map((s) =>
        Animated.timing(s.progress, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [shards]);

  return (
    <>
      {shards.map((s, i) => {
        const translateX = s.progress.interpolate({ inputRange: [0, 1], outputRange: [0, s.dx] });
        const translateY = s.progress.interpolate({ inputRange: [0, 1], outputRange: [0, s.dy] });
        const opacity = s.progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.85, 0] });
        const scale = s.progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.1, 0.5] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: x - s.size / 2,
              top: y - s.size / 2,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              backgroundColor: s.color,
              opacity,
              transform: [{ translateX }, { translateY }, { scale }],
            }}
          />
        );
      })}
    </>
  );
}
