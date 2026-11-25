// Scene state orchestrator: screen transitions, recipe guide modal state, and camera micro-shake feedback.

import { SCREEN_PAUSED, SCREEN_PLAYING, SCREEN_SUMMARY, SCREEN_TITLE } from './gameLoop.js';

export const SCREEN_RECIPE_GUIDE = 'recipe_guide';

export function createSceneManager(loop) {
  let guideOpen = false;
  let transitionAlpha = 0;
  let shakeIntensity = 0;
  let shakeTimer = 0;
  let shakeDuration = 0.001;

  function setScreen(next) {
    if (next === SCREEN_RECIPE_GUIDE) {
      guideOpen = true;
      return;
    }
    guideOpen = false;
    loop.setScreen(next);
    transitionAlpha = 0.35;
  }

  function getScreen() {
    return loop.getScreen();
  }

  function getActiveScene() {
    if (guideOpen) return SCREEN_RECIPE_GUIDE;
    return loop.getScreen();
  }

  function toggleGuide(force) {
    guideOpen = force === undefined ? !guideOpen : Boolean(force);
    return guideOpen;
  }

  function isGuideOpen() {
    return guideOpen;
  }

  function triggerShake(intensity = 2.5, duration = 0.16) {
    if (intensity >= shakeIntensity || shakeTimer <= 0) {
      shakeIntensity = Math.min(5, intensity);
      shakeDuration = Math.max(0.05, duration);
      shakeTimer = shakeDuration;
    }
  }

  function update(dt) {
    if (transitionAlpha > 0) {
      transitionAlpha = Math.max(0, transitionAlpha - dt * 1.8);
    }
    if (shakeTimer > 0) {
      shakeTimer = Math.max(0, shakeTimer - dt);
      if (shakeTimer === 0) shakeIntensity = 0;
    }
  }

  function getCameraOffset(clock = 0) {
    if (shakeTimer <= 0 || shakeIntensity <= 0) return { x: 0, y: 0 };
    const decay = shakeTimer / shakeDuration;
    const amp = shakeIntensity * decay;
    return {
      x: Math.sin(clock * 64) * amp,
      y: Math.cos(clock * 52) * amp * 0.75,
    };
  }

  function getTransitionAlpha() {
    return transitionAlpha;
  }

  return {
    SCREEN_TITLE,
    SCREEN_PLAYING,
    SCREEN_PAUSED,
    SCREEN_SUMMARY,
    SCREEN_RECIPE_GUIDE,
    setScreen,
    getScreen,
    getActiveScene,
    toggleGuide,
    isGuideOpen,
    triggerShake,
    update,
    getCameraOffset,
    getTransitionAlpha,
  };
}
