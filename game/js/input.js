// Pointer + keyboard input for Twin Worlds.
// Converts a click on either panel canvas into scene coordinates and hands
// it to the game; keyboard shortcuts are plain keydown handlers.

import { SCENE_W, SCENE_H } from './differences.js';

export function scenePointFromEvent(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * SCENE_W;
  const y = ((event.clientY - rect.top) / rect.height) * SCENE_H;
  return { x, y };
}

export function attachInput({ canvases, onSceneClick, onHint, onMute, onRestart, onStart }) {
  canvases.forEach((canvas) => {
    // pointerdown (not click) so a find registers the instant the player
    // presses, and touch screens work the same way as the mouse.
    canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      onSceneClick(scenePointFromEvent(event, canvas));
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') onHint();
    else if (key === 'm') onMute();
    else if (key === 'r') onRestart();
    else if (key === 'enter') onStart();
  });
}
