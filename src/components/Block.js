import React from 'react';
import { View } from 'react-native';

// -----------------------------------------------------------------------------
// One chunky 3D block.
//
// The 3D look comes from stacking two faces rather than faking it with borders:
// a dark "base" fills the cell, and a lit "top face" sits on it inset from the
// bottom, so the base peeks out as an extruded lip. Highlights and a shine dot
// finish the glossy candy look.
//
// Shared by the board, the tray and the dragged piece so all three match.
// -----------------------------------------------------------------------------

// Clamp + parse a #rrggbb string into [r,g,b].
function parseHex(hex) {
  const h = String(hex || '#888888').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return [136, 136, 136];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// amount > 0 lightens toward white, < 0 darkens toward black.
export function shade(hex, amount) {
  const [r, g, b] = parseHex(hex);
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const mix = (c) => Math.round(c + (t - c) * p);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export default function Block({ color, radius = 8, depthRatio = 0.2 }) {
  const base = shade(color, -0.42); // extruded side/bottom wall
  const top = color;
  const lip = `${Math.round(depthRatio * 100)}%`;

  // alignSelf: 'stretch' so a parent using alignItems:'center' can't collapse us
  // to zero width (all our children are absolutely positioned, so we have no
  // intrinsic size of our own).
  return (
    <View style={{ flex: 1, alignSelf: 'stretch' }}>
      {/* Dark base = the block's thickness */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: base,
          borderRadius: radius,
        }}
      />
      {/* Lit top face, inset from the bottom so the base shows as a lip */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: lip,
          backgroundColor: top,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: shade(color, 0.35),
          overflow: 'hidden',
        }}
      >
        {/* Bright upper band (light from above) */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '52%',
            backgroundColor: 'rgba(255,255,255,0.28)',
          }}
        />
        {/* Soft inner shadow along the bottom of the top face */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '20%',
            backgroundColor: 'rgba(0,0,0,0.14)',
          }}
        />
        {/* Right-edge shading for roundness */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: '14%',
            backgroundColor: 'rgba(0,0,0,0.10)',
          }}
        />
        {/* Glossy shine dot */}
        <View
          style={{
            position: 'absolute',
            top: '14%',
            left: '15%',
            width: '26%',
            height: '20%',
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderRadius: radius,
          }}
        />
      </View>
    </View>
  );
}
