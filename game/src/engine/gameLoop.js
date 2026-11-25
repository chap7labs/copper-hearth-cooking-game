// Fixed-timestep simulation loop and screen state machine for Yuzu & Hinoki.

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAYING = 'playing';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_SUMMARY = 'summary';

const MAX_FRAME_DT = 0.25;

export function createGameLoop({ onUpdate, onRender, step = 1 / 60 }) {
  let screen = SCREEN_TITLE;
  let running = false;
  let rafId = 0;
  let lastTime = 0;
  let accumulator = 0;
  let clock = 0;

  function setScreen(next) {
    screen = next;
    accumulator = 0;
  }

  function getScreen() {
    return screen;
  }

  function getClock() {
    return clock;
  }

  function tick(now) {
    if (!running) return;
    rafId = requestAnimationFrame(tick);
    const frameDt = Math.min(Math.max(0, (now - lastTime) / 1000), MAX_FRAME_DT);
    lastTime = now;
    clock += frameDt;

    if (screen === SCREEN_PLAYING) {
      accumulator += frameDt;
      while (accumulator >= step && screen === SCREEN_PLAYING) {
        onUpdate(step, clock);
        accumulator -= step;
      }
    } else {
      accumulator = 0;
    }

    onRender(screen, clock);
  }

  function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  return {
    start,
    stop,
    setScreen,
    getScreen,
    getClock,
  };
}
