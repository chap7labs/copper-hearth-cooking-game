// Original Web Audio API procedural bistro sound & rhythm engine for Copper Hearth.

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
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  function unlock() {
    const audioCtx = ensureContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    if (!grooveTimer) {
      grooveTimer = window.setInterval(tickGroove, 420);
    }
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

  function tickGroove() {
    if (muted || !ctx || ctx.state !== 'running') return;
    const bassNotes = [130.81, 164.81, 196.0, 146.83];
    const note = bassNotes[grooveStep % bassNotes.length];
    if (grooveStep % 2 === 0) {
      tone(note, 0.24, 'triangle', 0.022);
    } else {
      noiseBurst(0.05, 3200, 0.012);
    }
    grooveStep += 1;
  }

  function playPick() {
    tone(420, 0.07, 'sine', 0.055);
  }

  function playChop() {
    tone(145, 0.08, 'triangle', 0.09);
    noiseBurst(0.06, 1700, 0.07);
  }

  function playSizzleStart() {
    noiseBurst(0.24, 2800, 0.065);
    tone(220, 0.09, 'sine', 0.04);
  }

  function playPerfectChime() {
    tone(659.25, 0.16, 'triangle', 0.065, 0);
    tone(987.77, 0.22, 'sine', 0.065, 0.06);
  }

  function playPlate() {
    tone(523.25, 0.09, 'sine', 0.055, 0);
    tone(659.25, 0.11, 'sine', 0.045, 0.04);
  }

  function playBellServe(combo = 1) {
    const pitchBoost = Math.min(4, Math.max(0, combo - 1)) * 45;
    tone(1046.5 + pitchBoost, 0.36, 'sine', 0.09, 0);
    tone(1567.98 + pitchBoost, 0.28, 'triangle', 0.045, 0.02);
    tone(783.99, 0.22, 'triangle', 0.055, 0.09);
  }

  function playNewTicket() {
    noiseBurst(0.04, 2400, 0.025);
    tone(587.33, 0.08, 'sine', 0.035, 0.02);
  }

  function playTrash() {
    tone(130, 0.12, 'sawtooth', 0.045);
  }

  function playError() {
    tone(165, 0.12, 'square', 0.035);
  }

  function playShiftComplete() {
    tone(523.25, 0.18, 'triangle', 0.07, 0);
    tone(659.25, 0.18, 'triangle', 0.07, 0.09);
    tone(783.99, 0.22, 'triangle', 0.07, 0.18);
    tone(987.77, 0.38, 'sine', 0.08, 0.28);
  }

  function setMuted(next) {
    muted = Boolean(next);
  }

  function isMuted() {
    return muted;
  }

  return {
    unlock,
    setMuted,
    isMuted,
    playPick,
    playChop,
    playSizzleStart,
    playPerfectChime,
    playPlate,
    playBellServe,
    playNewTicket,
    playTrash,
    playError,
    playShiftComplete,
  };
}
