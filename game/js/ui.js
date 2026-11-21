// HUD and overlay helpers for Twin Worlds. main.js owns the game state;
// this module only reads it and paints the DOM, so the two never tangle.

import { totalDifferences } from './differences.js';

const $ = (id) => document.getElementById(id);

export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function updateHud(state) {
  const level = state.levels[state.levelIndex];
  $('level-name').textContent = `${state.levelIndex + 1} · ${level.name}`;
  $('remaining').textContent = String(state.remaining);
  $('score').textContent = String(state.score);
  $('hints-left').textContent = String(state.hintsLeft);
  $('timer-text').textContent = formatTime(state.timeLeft);
  const fill = $('timer-fill');
  const pct = Math.max(0, (state.timeLeft / level.time) * 100);
  fill.style.width = `${pct}%`;
  fill.classList.toggle('low', state.timeLeft <= 10);
  $('hint-btn').disabled = state.status !== 'playing' || state.hintsLeft <= 0;
  const progress = $('progress');
  if (progress) {
    progress.innerHTML =
      `Level <strong>${state.levelIndex + 1} dari ${state.levels.length}</strong>` +
      ` &middot; <strong>${state.totalFound} dari ${totalDifferences()}</strong> perbedaan ditemukan`;
  }
}

export function showOverlay(id) {
  ['overlay-start', 'overlay-level', 'overlay-over', 'overlay-win'].forEach((oid) => {
    $(oid).classList.toggle('hidden', oid !== id);
  });
}

export function hideOverlays() {
  ['overlay-start', 'overlay-level', 'overlay-over', 'overlay-win'].forEach((oid) => {
    $(oid).classList.add('hidden');
  });
}

let toastTimer = 0;

export function toast(message, bad = false) {
  const el = $('toast');
  el.textContent = message;
  el.classList.toggle('bad', bad);
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 1800);
}

export function flashPanels() {
  ['panel-left', 'panel-right'].forEach((id) => {
    const el = $(id);
    el.classList.remove('found-flash');
    void el.offsetWidth; // restart the CSS animation
    el.classList.add('found-flash');
  });
}

export function setMuteLabel(muted) {
  $('mute-btn').innerHTML = muted
    ? '🔇 Senyap <kbd>M</kbd>'
    : '🔊 Suara <kbd>M</kbd>';
}

export function showLevelDone(state, bonus) {
  const level = state.levels[state.levelIndex];
  $('level-done-title').textContent = `Level ${state.levelIndex + 1} Selesai! 🎉`;
  $('level-done-text').innerHTML =
    `Kamu menemukan semua <strong>${level.diffs.length} perbedaan</strong> di <strong>${level.name}</strong>.` +
    `<br>Bonus waktu: <strong>+${bonus}</strong> poin. Skor: <strong>${state.score}</strong>.`;
  showOverlay('overlay-level');
}

export function showGameOver(state) {
  const level = state.levels[state.levelIndex];
  const found = level.diffs.length - state.remaining;
  $('over-text').innerHTML =
    `Waktu habis di <strong>${level.name}</strong> — kamu menemukan <strong>${found} dari ${level.diffs.length}</strong> perbedaan.` +
    `<br>Skor: <strong>${state.score}</strong>. Coba lagi, matamu hampir sampai!`;
  showOverlay('overlay-over');
}

export function showWin(state) {
  $('win-text').innerHTML =
    `Skor akhir: <strong>${state.score}</strong> &middot; semua <strong>22 perbedaan</strong> ditemukan!`;
  showOverlay('overlay-win');
}
