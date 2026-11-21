// Twin Worlds — Spot the Difference: game orchestration.
// Owns the state machine (menu → playing → level done / game over / win),
// the timer, scoring, hints and the per-frame render of both panels.
// Scene art lives in scenes.js, difference data in differences.js,
// sounds in audio.js, DOM painting in ui.js, input wiring in input.js.

import { LEVELS, SCENE_W, SCENE_H } from './differences.js';
import { paintScene } from './scenes.js';
import { SoundEngine } from './audio.js';
import {
  updateHud, showOverlay, hideOverlays, toast, flashPanels,
  setMuteLabel, showLevelDone, showGameOver, showWin,
} from './ui.js';
import { attachInput } from './input.js';

const HINT_COST_SECONDS = 5;
const WRONG_COST_SECONDS = 5;
const HINTS_PER_LEVEL = 3;
const COMBO_STEP = 25;

const leftCanvas = document.getElementById('canvas-left');
const rightCanvas = document.getElementById('canvas-right');
const leftCtx = leftCanvas.getContext('2d');
const rightCtx = rightCanvas.getContext('2d');

// Offscreen panels: painted once per level, blitted every frame.
const offLeft = document.createElement('canvas');
const offRight = document.createElement('canvas');
offLeft.width = offRight.width = SCENE_W;
offLeft.height = offRight.height = SCENE_H;

const sound = new SoundEngine();

const state = {
  levels: LEVELS,
  levelIndex: 0,
  status: 'menu', // menu | playing | levelDone | over | win
  found: new Set(),
  remaining: LEVELS[0].diffs.length,
  totalFound: 0,
  score: 0,
  combo: 0,
  timeLeft: LEVELS[0].time,
  hintsLeft: HINTS_PER_LEVEL,
  hintTarget: null, // { diff, until }
  wrongFlash: null, // { x, y, until }
  lastTickSecond: -1,
};

function paintPanels() {
  paintScene(offLeft.getContext('2d'), state.levelIndex, 0);
  paintScene(offRight.getContext('2d'), state.levelIndex, 1);
}

function setupLevel(index, keepScore) {
  state.levelIndex = index;
  state.found = new Set();
  const level = LEVELS[index];
  state.remaining = level.diffs.length;
  state.timeLeft = level.time;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.combo = 0;
  state.hintTarget = null;
  state.wrongFlash = null;
  if (!keepScore) {
    state.score = 0;
    state.totalFound = 0;
  }
  state.status = 'playing';
  paintPanels();
  updateHud(state);
}

function startGame() {
  const params = new URLSearchParams(window.location.search);
  const startLevel = Math.min(
    Math.max(parseInt(params.get('level') || '1', 10) - 1, 0),
    LEVELS.length - 1,
  );
  setupLevel(startLevel, false);
  hideOverlays();
  sound.ensure();
  sound.start();
  // Screenshot helper: ?demo=found3 pre-marks the first N differences as
  // found, through the same code path as a real click (markers + counter).
  const demoFound = parseInt(params.get('demo')?.replace('found', '') || '0', 10);
  if (demoFound > 0) {
    LEVELS[startLevel].diffs.slice(0, demoFound).forEach((diff) => {
      state.found.add(diff.key);
      state.remaining -= 1;
      state.totalFound += 1;
      state.score += 100;
    });
    updateHud(state);
  }
}

function markFound(diff) {
  state.found.add(diff.key);
  state.remaining -= 1;
  state.totalFound += 1;
  state.combo += 1;
  const gained = 100 + (state.combo - 1) * COMBO_STEP;
  state.score += gained;
  sound.found();
  flashPanels();
  toast(`✅ ${diff.label}! +${gained}${state.combo > 1 ? ` (kombo x${state.combo})` : ''}`);
  updateHud(state);
  if (state.remaining === 0) finishLevel();
}

function finishLevel() {
  const bonus = Math.round(state.timeLeft) * 5;
  state.score += bonus;
  updateHud(state);
  if (state.levelIndex === LEVELS.length - 1) {
    state.status = 'win';
    sound.win();
    showWin(state);
    return;
  }
  state.status = 'levelDone';
  sound.levelClear();
  showLevelDone(state, bonus);
}

function onSceneClick(point) {
  if (state.status !== 'playing') return;
  sound.ensure();
  const level = LEVELS[state.levelIndex];
  const hit = level.diffs.find((diff) => {
    if (state.found.has(diff.key)) return false;
    const dx = point.x - diff.x;
    const dy = point.y - diff.y;
    return Math.hypot(dx, dy) <= diff.r + 6;
  });
  if (hit) {
    markFound(hit);
    return;
  }
  state.combo = 0;
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_COST_SECONDS);
  state.wrongFlash = { x: point.x, y: point.y, until: performance.now() + 650 };
  sound.wrong();
  toast(`❌ Bukan itu! −${WRONG_COST_SECONDS} detik`, true);
  updateHud(state);
}

function onHint() {
  if (state.status !== 'playing') return;
  if (state.hintsLeft <= 0) {
    toast('Hint habis di level ini!', true);
    return;
  }
  sound.ensure();
  const level = LEVELS[state.levelIndex];
  const left = level.diffs.filter((d) => !state.found.has(d.key));
  if (left.length === 0) return;
  const pick = left[Math.floor(Math.random() * left.length)];
  state.hintsLeft -= 1;
  state.timeLeft = Math.max(0, state.timeLeft - HINT_COST_SECONDS);
  state.hintTarget = { diff: pick, until: performance.now() + 1700 };
  sound.hint();
  toast(`💡 Hint: lihat sekitar sini… (−${HINT_COST_SECONDS} dtk)`);
  updateHud(state);
}

function onMute() {
  sound.ensure();
  sound.setMuted(!sound.muted);
  setMuteLabel(sound.muted);
}

function onRestart() {
  if (state.status === 'menu') return;
  setupLevel(state.levelIndex, true);
  hideOverlays();
  toast('Level diulang — semoga berhasil!');
}

function onStartKey() {
  if (state.status === 'menu') startGame();
  else if (state.status === 'levelDone') nextLevel();
  else if (state.status === 'over') {
    setupLevel(state.levelIndex, true);
    hideOverlays();
  } else if (state.status === 'win') {
    setupLevel(0, false);
    hideOverlays();
  }
}

function nextLevel() {
  setupLevel(state.levelIndex + 1, true);
  hideOverlays();
  sound.click();
}

function drawMarker(ctx, diff, now) {
  const pulse = 1 + Math.sin(now / 180) * 0.06;
  ctx.save();
  ctx.strokeStyle = '#2fd673';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, diff.r * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, (diff.r - 5) * pulse, 0, Math.PI * 2);
  ctx.stroke();
  // Check mark.
  ctx.strokeStyle = '#2fd673';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(diff.x - 11, diff.y);
  ctx.lineTo(diff.x - 3, diff.y + 9);
  ctx.lineTo(diff.x + 12, diff.y - 9);
  ctx.stroke();
  ctx.restore();
}

function render(now) {
  leftCtx.drawImage(offLeft, 0, 0);
  rightCtx.drawImage(offRight, 0, 0);
  const level = LEVELS[state.levelIndex];
  level.diffs.forEach((diff) => {
    if (!state.found.has(diff.key)) return;
    drawMarker(leftCtx, diff, now);
    drawMarker(rightCtx, diff, now);
  });
  if (state.hintTarget && now < state.hintTarget.until) {
    const age = 1 - (state.hintTarget.until - now) / 1700;
    const alpha = 0.35 + 0.65 * Math.abs(Math.sin(age * Math.PI * 3));
    [leftCtx, rightCtx].forEach((ctx) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ffcf4d';
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(state.hintTarget.diff.x, state.hintTarget.diff.y, state.hintTarget.diff.r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  } else if (state.hintTarget) {
    state.hintTarget = null;
  }
  if (state.wrongFlash && now < state.wrongFlash.until) {
    const alpha = (state.wrongFlash.until - now) / 650;
    [leftCtx, rightCtx].forEach((ctx) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ff5d6c';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const f = state.wrongFlash;
      ctx.beginPath();
      ctx.moveTo(f.x - 12, f.y - 12);
      ctx.lineTo(f.x + 12, f.y + 12);
      ctx.moveTo(f.x + 12, f.y - 12);
      ctx.lineTo(f.x - 12, f.y + 12);
      ctx.stroke();
      ctx.restore();
    });
  } else if (state.wrongFlash) {
    state.wrongFlash = null;
  }
}

let lastFrame = performance.now();

function loop(now) {
  const dt = Math.min(0.25, (now - lastFrame) / 1000);
  lastFrame = now;
  if (state.status === 'playing') {
    state.timeLeft -= dt;
    const whole = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 10 && whole !== state.lastTickSecond && state.timeLeft > 0) {
      state.lastTickSecond = whole;
      sound.tick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.status = 'over';
      sound.wrong();
      updateHud(state);
      showGameOver(state);
    } else {
      updateHud(state);
    }
  }
  render(now);
  requestAnimationFrame(loop);
}

// ---- Wire it up ------------------------------------------------------------
paintPanels();
updateHud(state);
showOverlay('overlay-start');

attachInput({
  canvases: [leftCanvas, rightCanvas],
  onSceneClick,
  onHint,
  onMute,
  onRestart,
  onStart: onStartKey,
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('next-btn').addEventListener('click', nextLevel);
document.getElementById('retry-btn').addEventListener('click', () => {
  setupLevel(state.levelIndex, true);
  hideOverlays();
});
document.getElementById('again-btn').addEventListener('click', () => {
  setupLevel(0, false);
  hideOverlays();
});
document.getElementById('hint-btn').addEventListener('click', onHint);
document.getElementById('mute-btn').addEventListener('click', onMute);
document.getElementById('restart-btn').addEventListener('click', onRestart);

// Auto-start when opened with ?demo=… so screenshots show live play.
if (new URLSearchParams(window.location.search).has('demo')) {
  startGame();
}

requestAnimationFrame(loop);
