// Original Web Audio API procedural Kyoto koto/wood-percussion & kitchen soundscape.

export function createSoundEngine() {
  let ctx = null;
  let muted = false;
  let noiseBuffer = null;
  let grooveTimer = null;
  let grooveStep = 0;

  function ensureContext() {
    if (ctx) return ctx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    try {
      ctx = new AudioCtx();
      noiseBuffer = createNoiseBuffer(ctx);
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function createNoiseBuffer(audioCtx) {
    const length = Math.floor(audioCtx.sampleRate * 0.35);
    const buf = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function unlock() {
    const audioCtx = ensureContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    if (!grooveTimer) grooveTimer = window.setInterval(tickGroove, 450);
  }

  function tone(freq, duration, type = 'triangle', gainPeak = 0.08, delay = 0) {
    if (muted) return;
    const audioCtx = ensureContext();
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function noiseBurst(duration, filterFreq, gainPeak = 0.06) {
    if (muted) return;
    const audioCtx = ensureContext();
    if (!audioCtx || audioCtx.state !== 'running' || !noiseBuffer) return;
    const now = audioCtx.currentTime;
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.Q.setValueAtTime(1.8, now);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(gainPeak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  // Soft Kyoto Hirajoshi pentatonic pulse
  function tickGroove() {
    if (muted || !ctx || ctx.state !== 'running') return;
    const pentatonic = [220.0, 246.94, 293.66, 329.63, 440.0];
    if (grooveStep % 2 === 0) {
      tone(pentatonic[grooveStep % pentatonic.length], 0.28, 'sine', 0.018);
    } else {
      noiseBurst(0.04, 2400, 0.008);
    }
    grooveStep += 1;
  }

  return {
    unlock,
    setMuted: (next) => { muted = Boolean(next); },
    isMuted: () => muted,
    playPick: () => tone(480, 0.06, 'sine', 0.05),
    playChop: () => {
      tone(155, 0.07, 'triangle', 0.085);
      noiseBurst(0.055, 1850, 0.065);
    },
    playCookStart: (cookType) => {
      if (cookType === 'boiler') tone(260, 0.14, 'sine', 0.05);
      else noiseBurst(0.22, cookType === 'fryer' ? 3400 : 2400, 0.06);
    },
    playPerfectChime: () => {
      tone(659.25, 0.15, 'triangle', 0.065, 0);
      tone(987.77, 0.22, 'sine', 0.065, 0.055);
    },
    playPlate: () => {
      tone(587.33, 0.08, 'sine', 0.055, 0);
      tone(783.99, 0.11, 'sine', 0.045, 0.04);
    },
    playBellServe: (combo = 1) => {
      const boost = Math.min(4, Math.max(0, combo - 1)) * 45;
      tone(1046.5 + boost, 0.34, 'sine', 0.09, 0);
      tone(1567.98 + boost, 0.24, 'triangle', 0.045, 0.02);
    },
    playDash: () => noiseBurst(0.11, 1400, 0.04),
    playNewTicket: () => tone(622, 0.07, 'sine', 0.03),
    playTrash: () => tone(135, 0.11, 'sawtooth', 0.04),
    playError: () => tone(170, 0.11, 'square', 0.032),
    playShiftComplete: () => {
      tone(523.25, 0.16, 'triangle', 0.07, 0);
      tone(659.25, 0.16, 'triangle', 0.07, 0.09);
      tone(783.99, 0.2, 'triangle', 0.07, 0.18);
      tone(1046.5, 0.36, 'sine', 0.08, 0.27);
    },
  };
}
