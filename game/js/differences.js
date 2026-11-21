// Difference data for Twin Worlds: one entry per level.
// A difference has a stable `key` (scenes.js draws it by key), a position in
// scene coordinates (560 x 400), a click radius and a label shown when found.
// Coordinates here are the single source of truth: painters read the same
// values, so a marker always lands exactly on the thing that changed.

export const SCENE_W = 560;
export const SCENE_H = 400;

export const LEVELS = [
  {
    id: 'garden',
    name: 'Taman Matahari',
    english: 'Sunny Garden',
    time: 120,
    blurb: 'Taman yang cerah — 5 perbedaan tersembunyi.',
    diffs: [
      { key: 'cloud',     x: 472, y: 88,  r: 32, label: 'Awan hilang' },
      { key: 'butterfly', x: 252, y: 148, r: 26, label: 'Kupu-kupu hilang' },
      { key: 'bird',      x: 305, y: 92,  r: 24, label: 'Burung hilang' },
      { key: 'window',    x: 412, y: 252, r: 24, label: 'Jendela hilang' },
      { key: 'flower',    x: 150, y: 352, r: 24, label: 'Warna bunga berubah' },
    ],
  },
  {
    id: 'camp',
    name: 'Kemah Malam',
    english: 'Night Camp',
    time: 150,
    blurb: 'Kemah di bawah bintang — 7 perbedaan tersembunyi.',
    diffs: [
      { key: 'star',     x: 120, y: 50,  r: 22, label: 'Bintang hilang' },
      { key: 'crater',   x: 458, y: 62,  r: 24, label: 'Kawah bulan hilang' },
      { key: 'flag',     x: 282, y: 178, r: 24, label: 'Bendera tenda hilang' },
      { key: 'owl-eyes', x: 430, y: 150, r: 26, label: 'Mata burung hantu tertutup' },
      { key: 'lantern',  x: 385, y: 180, r: 26, label: 'Warna lentera berubah' },
      { key: 'flame',    x: 150, y: 288, r: 30, label: 'Api unggun mengecil' },
      { key: 'backpack', x: 350, y: 322, r: 28, label: 'Ransel hilang' },
    ],
  },
  {
    id: 'reef',
    name: 'Terumbu Karang',
    english: 'Coral Reef',
    time: 180,
    blurb: 'Terumbu karang — 10 perbedaan tersembunyi.',
    diffs: [
      { key: 'bubble',   x: 300, y: 80,  r: 22, label: 'Gelembung hilang' },
      { key: 'starfish', x: 200, y: 360, r: 26, label: 'Bintang laut hilang' },
      { key: 'shell',    x: 400, y: 365, r: 24, label: 'Warna kerang berubah' },
      { key: 'octopus',  x: 492, y: 196, r: 26, label: 'Tentakel gurita hilang' },
      { key: 'turtle',   x: 120, y: 220, r: 26, label: 'Bintik tempurung hilang' },
      { key: 'clown',    x: 250, y: 200, r: 26, label: 'Garis ikan badut hilang' },
      { key: 'seaweed',  x: 520, y: 300, r: 28, label: 'Rumput laut memendek' },
      { key: 'chest',    x: 330, y: 340, r: 26, label: 'Permata peti berubah' },
      { key: 'bluefish', x: 350, y: 100, r: 28, label: 'Ikan biru berbalik arah' },
      { key: 'coral',    x: 96,  y: 272, r: 26, label: 'Cabang karang hilang' },
    ],
  },
];

export function totalDifferences() {
  return LEVELS.reduce((sum, level) => sum + level.diffs.length, 0);
}

export const TOTAL_LEVELS = LEVELS.length;

export function levelById(id) {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0];
}

export function diffByKey(level, key) {
  return level.diffs.find((d) => d.key === key);
}
