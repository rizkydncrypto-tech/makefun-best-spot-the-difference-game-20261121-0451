// Procedural scene painters for Twin Worlds.
// Every scene is drawn from scratch with Canvas 2D primitives — no image
// assets, no downloads. paintScene(ctx, level, variant) draws one panel:
// variant 0 is the original, variant 1 is the changed twin. Each difference
// is drawn (or hidden / recoloured) by its key from differences.js, so the
// two panels line up pixel for pixel except for the planted differences.

import { SCENE_W, SCENE_H, LEVELS, diffByKey } from './differences.js';

function sky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
}

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function cloud(ctx, x, y, scale = 1) {
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
  ctx.arc(x + 22 * scale, y + 4 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.arc(x - 22 * scale, y + 5 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.arc(x + 6 * scale, y - 10 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function flower(ctx, x, y, petal) {
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 22);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    circle(ctx, x + Math.cos(a) * 10, y + Math.sin(a) * 10, 7, petal);
  }
  circle(ctx, x, y, 7, '#ffcf4d');
}

function pine(ctx, x, y, s = 1) {
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(x - 4 * s, y, 8 * s, 16 * s);
  ctx.fillStyle = '#1b5e20';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x - (34 - i * 8) * s, y - i * 22 * s);
    ctx.lineTo(x, y - (34 + i * 22) * s);
    ctx.lineTo(x + (34 - i * 8) * s, y - i * 22 * s);
    ctx.closePath();
    ctx.fill();
  }
}

function fish(ctx, x, y, s, body, facingRight) {
  ctx.save();
  ctx.translate(x, y);
  if (!facingRight) ctx.scale(-1, 1);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26 * s, 14 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-22 * s, 0);
  ctx.lineTo(-36 * s, -12 * s);
  ctx.lineTo(-36 * s, 12 * s);
  ctx.closePath();
  ctx.fill();
  circle(ctx, 12 * s, -3 * s, 3.5 * s, '#10243e');
  ctx.restore();
}

// ---- Level 1: Sunny Garden -------------------------------------------------
function paintGarden(ctx, level, variant) {
  sky(ctx, '#7ec8f7', '#dff3ff');
  // Sun with rays.
  ctx.strokeStyle = '#ffb300';
  ctx.lineWidth = 5;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(80 + Math.cos(a) * 42, 70 + Math.sin(a) * 42);
    ctx.lineTo(80 + Math.cos(a) * 54, 70 + Math.sin(a) * 54);
    ctx.stroke();
  }
  circle(ctx, 80, 70, 34, '#ffd54f');
  cloud(ctx, 200, 60, 1);
  cloud(ctx, 380, 45, 0.8);
  if (variant === 0) {
    const d = diffByKey(level, 'cloud');
    cloud(ctx, d.x, d.y, 0.9);
  }
  // Rolling hills.
  ellipse(ctx, 130, 430, 260, 90, '#7ec850');
  ellipse(ctx, 460, 440, 280, 100, '#5da83c');
  // Tree.
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(102, 210, 16, 80);
  circle(ctx, 110, 190, 34, '#2e7d32');
  circle(ctx, 82, 212, 24, '#388e3c');
  circle(ctx, 138, 212, 24, '#43a047');
  // House.
  ctx.fillStyle = '#fff3e0';
  ctx.fillRect(350, 220, 120, 84);
  ctx.fillStyle = '#e65100';
  ctx.beginPath();
  ctx.moveTo(340, 222);
  ctx.lineTo(410, 168);
  ctx.lineTo(480, 222);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(398, 258, 24, 46);
  ctx.fillStyle = '#5aa9ff';
  ctx.fillRect(366, 240, 26, 26);
  if (variant === 0) {
    const d = diffByKey(level, 'window');
    ctx.fillRect(d.x - 13, d.y - 13, 26, 26);
  }
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(366, 240, 26, 26);
  // Flowers along the grass.
  const flowerXs = [90, 150, 210, 270, 330];
  flowerXs.forEach((fx) => {
    const petal = fx === 150 && variant === 1 ? '#9c6bff' : '#ef5350';
    flower(ctx, fx, 352, petal);
  });
  // Butterfly (variant 0 only).
  if (variant === 0) {
    const d = diffByKey(level, 'butterfly');
    ctx.fillStyle = '#ab47bc';
    ellipse(ctx, d.x - 10, d.y, 11, 15, '#ab47bc');
    ellipse(ctx, d.x + 10, d.y, 11, 15, '#ce93d8');
    ctx.fillStyle = '#4a148c';
    ctx.fillRect(d.x - 2, d.y - 12, 4, 24);
  }
  // Bird (variant 0 only).
  if (variant === 0) {
    const d = diffByKey(level, 'bird');
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(d.x - 14, d.y);
    ctx.quadraticCurveTo(d.x - 6, d.y - 10, d.x, d.y);
    ctx.quadraticCurveTo(d.x + 6, d.y - 10, d.x + 14, d.y);
    ctx.stroke();
  }
}

// ---- Level 2: Night Camp ---------------------------------------------------
function paintCamp(ctx, level, variant) {
  sky(ctx, '#0d1233', '#27407a');
  // Stars.
  const stars = [
    [120, 50], [180, 30], [260, 70], [340, 40],
    [430, 110], [90, 120], [520, 60], [300, 26],
  ];
  ctx.fillStyle = '#fff9c4';
  stars.forEach(([sx, sy]) => {
    if (variant === 1 && sx === 120 && sy === 50) return; // missing star
    ctx.beginPath();
    ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,249,196,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx - 8, sy);
    ctx.lineTo(sx + 8, sy);
    ctx.moveTo(sx, sy - 8);
    ctx.lineTo(sx, sy + 8);
    ctx.stroke();
  });
  // Moon with one crater (variant 0 only).
  circle(ctx, 470, 70, 30, '#fff8dc');
  if (variant === 0) {
    const d = diffByKey(level, 'crater');
    circle(ctx, d.x, d.y, 7, '#e8dcb0');
    circle(ctx, 482, 82, 5, '#e8dcb0');
  }
  // Ground.
  ellipse(ctx, 280, 440, 340, 90, '#1c3a24');
  // Pines.
  pine(ctx, 60, 250, 1.1);
  pine(ctx, 505, 255, 0.95);
  // Tent with a little flag (variant 0 only).
  ctx.fillStyle = '#ff7043';
  ctx.beginPath();
  ctx.moveTo(210, 320);
  ctx.lineTo(280, 210);
  ctx.lineTo(350, 320);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5d4037';
  ctx.beginPath();
  ctx.moveTo(262, 320);
  ctx.lineTo(280, 272);
  ctx.lineTo(298, 320);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8d6e63';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(280, 210);
  ctx.lineTo(280, 168);
  ctx.stroke();
  if (variant === 0) {
    ctx.fillStyle = '#ffcf4d';
    ctx.beginPath();
    ctx.moveTo(280, 168);
    ctx.lineTo(304, 176);
    ctx.lineTo(280, 186);
    ctx.closePath();
    ctx.fill();
  }
  // Lantern on a pole: glow colour changes between variants.
  ctx.strokeStyle = '#8d6e63';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(385, 150);
  ctx.lineTo(385, 168);
  ctx.stroke();
  const glow = variant === 0 ? '#ffd54f' : '#69f0ae';
  circle(ctx, 385, 180, 16, glow);
  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = 3;
  ctx.strokeRect(375, 168, 20, 24);
  // Owl on a branch: eyes open (variant 0) or shut (variant 1).
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(408, 168);
  ctx.lineTo(452, 168);
  ctx.stroke();
  ellipse(ctx, 430, 150, 15, 19, '#8d6e63');
  ctx.fillStyle = '#fff';
  if (variant === 0) {
    circle(ctx, 424, 146, 5, '#fff');
    circle(ctx, 436, 146, 5, '#fff');
    circle(ctx, 424, 146, 2.5, '#212121');
    circle(ctx, 436, 146, 2.5, '#212121');
  } else {
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(419, 146);
    ctx.lineTo(429, 146);
    ctx.moveTo(431, 146);
    ctx.lineTo(441, 146);
    ctx.stroke();
  }
  // Campfire: big flame (variant 0) or small flame (variant 1).
  ctx.strokeStyle = '#6d4c41';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(128, 312);
  ctx.lineTo(172, 300);
  ctx.moveTo(172, 312);
  ctx.lineTo(128, 300);
  ctx.stroke();
  const flameR = variant === 0 ? 26 : 14;
  circle(ctx, 150, 288, flameR, '#ff9800');
  circle(ctx, 150, 294, flameR * 0.6, '#ffeb3b');
  // Backpack (variant 0 only).
  if (variant === 0) {
    const d = diffByKey(level, 'backpack');
    ctx.fillStyle = '#7e57c2';
    ctx.beginPath();
    ctx.arc(d.x, d.y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(d.x - 24, d.y - 6, 48, 12);
    ctx.fillStyle = '#5e35b1';
    ctx.fillRect(d.x - 10, d.y - 24, 20, 12);
  }
  // Marshmallow stick (same in both panels).
  ctx.strokeStyle = '#8d6e63';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(196, 330);
  ctx.lineTo(224, 296);
  ctx.stroke();
  circle(ctx, 226, 294, 7, '#fff8e1');
}

// ---- Level 3: Coral Reef ---------------------------------------------------
function paintReef(ctx, level, variant) {
  sky(ctx, '#0277bd', '#4fc3f7');
  // Sun rays through the water.
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(120 + i * 120, 0);
    ctx.lineTo(170 + i * 120, 0);
    ctx.lineTo(90 + i * 120, 400);
    ctx.lineTo(20 + i * 120, 400);
    ctx.closePath();
    ctx.fill();
  }
  // Sandy floor.
  ellipse(ctx, 280, 430, 360, 80, '#ffe0a3');
  // Pink branching coral (one branch missing in variant 1).
  ctx.strokeStyle = '#ec407a';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(80, 380);
  ctx.lineTo(80, 310);
  ctx.moveTo(80, 340);
  ctx.lineTo(56, 300);
  ctx.moveTo(80, 330);
  ctx.lineTo(104, 296);
  ctx.stroke();
  if (variant === 0) {
    ctx.beginPath();
    ctx.moveTo(80, 312);
    ctx.lineTo(96, 272);
    ctx.stroke();
  }
  // Orange coral and purple coral.
  ctx.strokeStyle = '#fb8c00';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(450, 380);
  ctx.lineTo(450, 322);
  ctx.moveTo(450, 348);
  ctx.lineTo(428, 316);
  ctx.moveTo(450, 340);
  ctx.lineTo(472, 312);
  ctx.stroke();
  ctx.strokeStyle = '#7e57c2';
  ctx.beginPath();
  ctx.moveTo(300, 380);
  ctx.lineTo(300, 330);
  ctx.moveTo(300, 352);
  ctx.lineTo(282, 326);
  ctx.stroke();
  // Seaweed: tall (variant 0) or short (variant 1).
  const weedTop = variant === 0 ? 240 : 282;
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(520, 380);
  ctx.quadraticCurveTo(536, 320, 520, weedTop);
  ctx.stroke();
  // Yellow fish with a stripe.
  fish(ctx, 150, 120, 1, '#ffca28', true);
  ctx.strokeStyle = '#f57f17';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(142, 108);
  ctx.lineTo(142, 132);
  ctx.stroke();
  // Blue fish: faces right (variant 0) or left (variant 1).
  fish(ctx, 350, 100, 1, '#42a5f5', variant === 0);
  // Clownfish: white stripe in variant 0 only.
  fish(ctx, 250, 200, 0.9, '#ff7043', true);
  if (variant === 0) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(244, 188);
    ctx.lineTo(244, 212);
    ctx.stroke();
  }
  // Octopus: four tentacles (variant 0) or three (variant 1).
  circle(ctx, 480, 180, 22, '#ba68c8');
  ctx.strokeStyle = '#ba68c8';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  const tentacles = variant === 0 ? 4 : 3;
  for (let i = 0; i < tentacles; i++) {
    const tx = 466 + i * 9;
    ctx.beginPath();
    ctx.moveTo(tx, 198);
    ctx.quadraticCurveTo(tx + 4, 218, tx - 2, 232);
    ctx.stroke();
  }
  circle(ctx, 474, 176, 3, '#212121');
  circle(ctx, 488, 176, 3, '#212121');
  // Turtle: shell spot in variant 0 only.
  ellipse(ctx, 120, 220, 30, 20, '#66bb6a');
  circle(ctx, 148, 216, 9, '#66bb6a');
  ctx.fillStyle = '#2e7d32';
  ctx.beginPath();
  ctx.ellipse(120, 220, 22, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  if (variant === 0) {
    circle(ctx, 120, 220, 5, '#a5d6a7');
  }
  // Bubbles: one missing in variant 1.
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  const bubbles = [[300, 80], [180, 60], [420, 140], [240, 40]];
  bubbles.forEach(([bx, by], i) => {
    if (variant === 1 && i === 0) return;
    ctx.beginPath();
    ctx.arc(bx, by, 7, 0, Math.PI * 2);
    ctx.stroke();
  });
  // Starfish (variant 0 only).
  if (variant === 0) {
    const d = diffByKey(level, 'starfish');
    ctx.fillStyle = '#ff8a65';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
      const px = d.x + Math.cos(a) * 18;
      const py = d.y + Math.sin(a) * 18;
      ctx.lineTo(px, py);
      ctx.lineTo(d.x + Math.cos(a + Math.PI / 5) * 7, d.y + Math.sin(a + Math.PI / 5) * 7);
    }
    ctx.closePath();
    ctx.fill();
  }
  // Shell: pink (variant 0) or blue (variant 1).
  ctx.fillStyle = variant === 0 ? '#f48fb1' : '#64b5f6';
  ctx.beginPath();
  ctx.arc(400, 365, 18, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  // Treasure chest: gem red (variant 0) or green (variant 1).
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(312, 330, 40, 26);
  ctx.fillStyle = '#a1887f';
  ctx.fillRect(312, 322, 40, 12);
  ctx.fillStyle = variant === 0 ? '#e53935' : '#43a047';
  ctx.beginPath();
  ctx.moveTo(332, 330);
  ctx.lineTo(340, 338);
  ctx.lineTo(332, 346);
  ctx.lineTo(324, 338);
  ctx.closePath();
  ctx.fill();
}

// ---- Entry point -----------------------------------------------------------
const PAINTERS = [paintGarden, paintCamp, paintReef];

function vignette(ctx) {
  const g = ctx.createRadialGradient(
    SCENE_W / 2, SCENE_H / 2, SCENE_H * 0.45,
    SCENE_W / 2, SCENE_H / 2, SCENE_H * 0.95,
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
}

export function paintScene(ctx, levelIndex, variant) {
  const level = LEVELS[levelIndex % LEVELS.length];
  const painter = PAINTERS[levelIndex % PAINTERS.length];
  ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  painter(ctx, level, variant);
  vignette(ctx);
}
