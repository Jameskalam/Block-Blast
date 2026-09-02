import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// -----------------------------------------------------------------------------
// Tiny runtime WAV synthesizer.
//
// React Native has no Web Audio oscillator, and we don't want to ship binary
// sound assets. Instead we synthesize short PCM tones in JS, wrap them in a WAV
// header, and write them to the cache directory as real .wav files that expo-av
// loads by file:// URI. The clips are tiny (a few KB) and written once, then
// reused on later launches.
// -----------------------------------------------------------------------------

const SAMPLE_RATE = 22050;
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Manual base64 encoder (RN has no btoa on binary buffers).
function base64FromBytes(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? B64[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < bytes.length ? B64[b2 & 63] : '=';
  }
  return out;
}

// Build a base64 mono 16-bit WAV payload from float samples (-1..1).
function wavBase64(samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buffer = new Uint8Array(44 + dataSize);
  const view = new DataView(buffer.buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // audio format = PCM
  view.setUint16(22, 1, true); // channels = mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return base64FromBytes(buffer);
}

// A single note: frequency sweep from f0->f1 over `dur` seconds with an
// attack/decay envelope. `type` picks a simple waveform.
function tone({ f0, f1 = f0, dur, type = 'sine', vol = 0.5, attack = 0.005 }) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  const attackSamples = Math.max(1, Math.floor(attack * SAMPLE_RATE));

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const prog = i / n;
    const freq = f0 + (f1 - f0) * prog;
    const phase = 2 * Math.PI * freq * t;

    let wave;
    if (type === 'square') wave = Math.sin(phase) >= 0 ? 1 : -1;
    else if (type === 'triangle') wave = (2 / Math.PI) * Math.asin(Math.sin(phase));
    else if (type === 'saw') wave = 2 * (t * freq - Math.floor(0.5 + t * freq));
    else wave = Math.sin(phase);

    // Envelope: short linear attack, then exponential decay that ALWAYS reaches
    // zero by the final sample. Anything that ends mid-amplitude produces an
    // audible click, which is what the previous formula did.
    let env;
    if (i < attackSamples) {
      env = i / attackSamples;
    } else {
      const d = (i - attackSamples) / Math.max(1, n - attackSamples); // 0..1
      env = Math.exp(-4 * d) * (1 - d); // decays smoothly to exactly 0 at d=1
    }
    out[i] = wave * env * vol;
  }
  return out;
}

// Concatenate several tone segments (optionally with gaps) into one clip.
function sequence(segments) {
  let total = 0;
  segments.forEach((s) => (total += s.length));
  const out = new Float32Array(total);
  let pos = 0;
  segments.forEach((s) => {
    out.set(s, pos);
    pos += s.length;
  });
  return out;
}

function silence(dur) {
  return new Float32Array(Math.floor(SAMPLE_RATE * dur));
}

// Mix two equal-length (or padded) sample arrays for a fuller chord.
function mix(a, b) {
  const n = Math.max(a.length, b.length);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = (a[i] || 0) + (b[i] || 0);
  return out;
}

class SoundEngine {
  constructor() {
    this.muted = false;
    this.sounds = {}; // name -> Audio.Sound
    this.ready = false;
    this._initPromise = null;
  }

  // Synthesize every clip, write it to the cache directory as a real .wav, and
  // preload it. Files (not `data:` URIs) because Android's ExoPlayer -- which
  // backs expo-av -- does not reliably play data URIs, which is why the sounds
  // were silent before.
  async init() {
    if (this.ready || this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
        });

        const dir = `${FileSystem.cacheDirectory}bb-sfx/`;
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});

        const clips = this._buildClips();
        await Promise.all(
          Object.entries(clips).map(async ([name, samples]) => {
            const uri = `${dir}${name}.wav`;
            const info = await FileSystem.getInfoAsync(uri);
            if (!info.exists) {
              await FileSystem.writeAsStringAsync(uri, wavBase64(samples), {
                encoding: FileSystem.EncodingType.Base64,
              });
            }
            const { sound } = await Audio.Sound.createAsync({ uri }, { volume: 1.0 });
            this.sounds[name] = sound;
          })
        );
        this.ready = true;
      } catch (e) {
        // Audio is a nice-to-have; haptics still fire if this fails.
        this.ready = false;
      }
    })();

    return this._initPromise;
  }

  // Define the actual sound design for each game event.
  _buildClips() {
    return {
      // Light UI tap when picking up a piece.
      pop: tone({ f0: 660, f1: 880, dur: 0.08, type: 'triangle', vol: 0.35 }),

      // Satisfying "click-in" when a shape is placed on the board.
      place: sequence([
        tone({ f0: 523, f1: 784, dur: 0.09, type: 'triangle', vol: 0.45 }),
        tone({ f0: 784, dur: 0.06, type: 'sine', vol: 0.4 }),
      ]),

      // Bright explosive sweep when a line is cleared.
      blast: mix(
        tone({ f0: 880, f1: 1760, dur: 0.28, type: 'saw', vol: 0.3 }),
        tone({ f0: 440, f1: 990, dur: 0.28, type: 'square', vol: 0.18 })
      ),

      // Rising 3-note arpeggio for combos.
      combo: sequence([
        tone({ f0: 659, dur: 0.09, type: 'triangle', vol: 0.4 }),
        tone({ f0: 830, dur: 0.09, type: 'triangle', vol: 0.4 }),
        tone({ f0: 988, dur: 0.14, type: 'triangle', vol: 0.45 }),
      ]),

      // Happy 4-note fanfare for reaching a new stage / reward.
      reward: sequence([
        tone({ f0: 523, dur: 0.1, type: 'triangle', vol: 0.45 }),
        tone({ f0: 659, dur: 0.1, type: 'triangle', vol: 0.45 }),
        tone({ f0: 784, dur: 0.1, type: 'triangle', vol: 0.45 }),
        tone({ f0: 1047, dur: 0.22, type: 'triangle', vol: 0.5 }),
      ]),

      // Descending "aww" for game over.
      loss: sequence([
        tone({ f0: 440, dur: 0.16, type: 'triangle', vol: 0.4 }),
        tone({ f0: 349, dur: 0.16, type: 'triangle', vol: 0.4 }),
        tone({ f0: 262, dur: 0.3, type: 'triangle', vol: 0.4 }),
      ]),
    };
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  async _play(name, rate = 1.0) {
    if (this.muted) return;
    // A sound may be triggered before preloading finished (e.g. the very first
    // tap). Wait for init rather than dropping the effect silently.
    if (!this.ready) {
      try {
        await this.init();
      } catch (e) {
        return;
      }
      if (this.muted) return;
    }
    const sound = this.sounds[name];
    if (!sound) return;
    try {
      // Rewind then play so rapid repeats (fast placements) always retrigger.
      await sound.setStatusAsync({
        shouldPlay: true,
        positionMillis: 0,
        rate,
        shouldCorrectPitch: false,
      });
    } catch (e) {
      // ignore playback errors
    }
  }

  _impact(style) {
    if (this.muted) return;
    Haptics.impactAsync(style).catch(() => {});
  }

  _notify(type) {
    if (this.muted) return;
    Haptics.notificationAsync(type).catch(() => {});
  }

  _pulses(count, style, spacingMs = 90) {
    if (this.muted) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (this.muted) return;
        Haptics.impactAsync(style).catch(() => {});
      }, i * spacingMs);
    }
  }

  // ---- Public API (unchanged signatures) ----------------------------------

  playPopSound() {
    this._play('pop');
    this._impact(Haptics.ImpactFeedbackStyle.Light);
  }

  // Sound when a shape is successfully fitted onto the board.
  playPlaceSound() {
    this._play('place');
    this._impact(Haptics.ImpactFeedbackStyle.Medium);
  }

  // Sound when a full row/column is cleared. Pitches up for bigger clears.
  playBlastSound(linesCleared = 1) {
    const rate = 1 + Math.min(linesCleared - 1, 3) * 0.12;
    this._play('blast', rate);
    const count = Math.min(Math.max(linesCleared, 1), 4);
    this._pulses(count, Haptics.ImpactFeedbackStyle.Heavy, 70);
  }

  playComboChime(comboCount = 1) {
    const rate = 1 + Math.min(comboCount - 1, 4) * 0.08;
    this._play('combo', rate);
    const count = Math.min(comboCount + 1, 4);
    this._pulses(count, Haptics.ImpactFeedbackStyle.Medium, 80);
  }

  playLossSound() {
    this._play('loss');
    this._notify(Haptics.NotificationFeedbackType.Error);
  }

  playRewardSound() {
    this._play('reward');
    this._notify(Haptics.NotificationFeedbackType.Success);
  }
}

export const soundEngine = new SoundEngine();
