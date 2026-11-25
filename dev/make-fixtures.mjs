/**
 * Generates deterministic synthetic Beat Saber fixture zips into test-data/synthetic/.
 * Run: node dev/make-fixtures.mjs
 * See test-data/README.md for what each fixture exercises.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AdmZip = require('adm-zip');

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(REPO_ROOT, 'test-data', 'synthetic');
const AUDIO_PATH = path.join(
  REPO_ROOT,
  'game/template-world/BlockSaberResourcepack/assets/blocksaber/sounds/custom/end_sound.ogg',
);
const COVER_PATH = path.join(REPO_ROOT, 'public/media/block-saber-logo.png');

const AUDIO = fs.readFileSync(AUDIO_PATH);
const COVER = fs.readFileSync(COVER_PATH);

const SPREAD = [];
for (const color of [0, 1]) {
  for (let cut = 0; cut < 9; cut++) {
    SPREAD.push({
      time: 4 + SPREAD.length * 0.5,
      line: SPREAD.length % 4,
      layer: Math.floor(SPREAD.length / 9),
      color,
      cut,
    });
  }
}

const BOMB_NOTE = { time: 40, line: 1, layer: 1 };

const WALLS = [
  { time: 60, duration: 1.5, line: 0, width: 1, type: 0 },
  { time: 62, duration: 0.5, line: 1, width: 1, type: 1 },
  { time: 64, duration: 2.25, line: 2, width: 2, type: 0 },
  { time: 66, duration: 1.75, line: 0, width: 2, type: 2 },
];

const LIGHT_EVENTS = [
  { time: 8, type: 1, value: 1 },
  { time: 12, type: 1, value: 0 },
  { time: 16, type: 9, value: 3 },
  { time: 20, type: 9, value: 0 },
];

function writeZip(name, files) {
  const zip = new AdmZip();
  for (const [entryName, data] of Object.entries(files)) {
    zip.addFile(entryName, Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data, null, 2)));
  }
  zip.writeZip(path.join(OUT_DIR, name));
  console.log('wrote', path.relative(REPO_ROOT, path.join(OUT_DIR, name)));
}

function v2Info(extra = {}) {
  return {
    _version: '2.1.0',
    _songName: 'Synthetic v2',
    _songSubName: 'generator fixture',
    _songAuthorName: 'make-fixtures',
    _levelAuthorName: 'make-fixtures',
    _beatsPerMinute: 120,
    _shuffle: 0.5,
    _shufflePeriod: 0.5,
    _previewStartTime: 0,
    _previewDuration: 10,
    _songFilename: 'song.egg',
    _coverImageFilename: 'cover.png',
    _environmentName: 'DefaultEnvironment',
    _allDirectionsEnvironmentName: 'GlassDesertEnvironment',
    _environmentNames: ['DefaultEnvironment'],
    _timeOffset: 0.5,
    _customData: {},
    _difficultyBeatmapSets: [
      {
        _beatmapCharacteristicName: 'Standard',
        _difficultyBeatmaps: [
          {
            _difficulty: 'Easy',
            _difficultyRank: 3,
            _beatmapFilename: 'EasyStandard.dat',
            _noteJumpMovementSpeed: 12,
            _noteJumpStartBeatOffset: 0,
            _customData: {},
          },
          {
            _difficulty: 'Expert',
            _difficultyRank: 5,
            _beatmapFilename: 'ExpertStandard.dat',
            _noteJumpMovementSpeed: 16,
            _noteJumpStartBeatOffset: 0,
            _customData: {},
          },
        ],
      },
    ],
    ...extra,
  };
}

function v2Beatmap() {
  return {
    _version: '2.2.0',
    _events: LIGHT_EVENTS.map((e) => ({ _time: e.time, _type: e.type, _value: e.value, _float: 0 })),
    _notes: [
      ...SPREAD.map((n) => ({
        _time: n.time,
        _lineIndex: n.line,
        _lineLayer: n.layer,
        _type: n.color,
        _cutDirection: n.cut,
        _offset: 0,
        _customData: {},
      })),
      {
        _time: BOMB_NOTE.time,
        _lineIndex: BOMB_NOTE.line,
        _lineLayer: BOMB_NOTE.layer,
        _type: 3,
        _cutDirection: 8,
        _offset: 0,
        _customData: {},
      },
    ],
    _obstacles: WALLS.map((w) => ({
      _time: w.time,
      _duration: w.duration,
      _lineIndex: w.line,
      _type: w.type,
      _width: w.width,
      _customData: {},
    })),
    _waypoints: [],
    _customData: {},
  };
}

function v3Info(characteristicSets, extra = {}) {
  return {
    version: '3.6.0',
    songName: 'Synthetic v3',
    songSubName: 'generator fixture',
    songAuthorName: 'make-fixtures',
    levelAuthorName: 'make-fixtures',
    bpm: 120,
    previewStartTime: 0,
    previewDuration: 10,
    songFilename: 'song.egg',
    coverImageFilename: 'cover.png',
    environmentNames: ['DefaultEnvironment'],
    allDirectionsEnvironmentName: 'GlassDesertEnvironment',
    requirements: [],
    suggestions: [],
    customData: { offset: 0.25 },
    difficultyBeatmapSets: characteristicSets.map(([characteristic, difficulties]) => ({
      beatmapCharacteristicName: characteristic,
      difficultyBeatmaps: difficulties.map((difficulty) => ({
        difficulty,
        difficultyRank: 5,
        beatmapFilename: `${difficulty}${characteristic}.dat`,
        noteJumpMovementSpeed: 16,
        noteJumpStartBeatOffset: 0,
        customData: {},
      })),
    })),
    ...extra,
  };
}

function v3Beatmap(bpmEvents = []) {
  return {
    version: '3.3.0',
    bpmEvents,
    rotationEvents: [],
    colorNotes: SPREAD.map((n) => ({ b: n.time, x: n.line, y: n.layer, c: n.color, d: n.cut, dn: 0, a: 0 })),
    bombNotes: [{ b: BOMB_NOTE.time, x: BOMB_NOTE.line, y: BOMB_NOTE.layer }],
    obstacles: WALLS.map((w) => ({
      b: w.time,
      d: w.duration,
      x: w.line,
      y: w.type === 2 ? 3 : 0,
      w: w.width,
      h: w.type === 0 ? 3 : 2,
    })),
    sliders: [{ c: 0, b: 50, x: 1, y: 0, d: 1, mu: 1, tb: 51, tx: 2, ty: 0, tc: 0, tmu: 1, m: 0 }],
    burstSliders: [{ c: 1, b: 54, x: 2, y: 1, d: 1, tb: 54.5, tx: 2, ty: 1, sc: 3, s: 0.5 }],
    basicBeatmapEvents: LIGHT_EVENTS.map((e) => ({ b: e.time, et: e.type, i: e.value, f: 1 })),
    colorBoostBeatmapEvents: [],
    introBeatmapEvents: [],
    waypoints: [],
    basicEventTypesWithKeywords: {},
    useNormalEventsAsCompatibleEvents: false,
  };
}

function v4Info() {
  return {
    version: '4.0.0',
    song: { title: 'Synthetic v4', author: 'make-fixtures' },
    beatmapAuthor: 'make-fixtures',
    environmentNames: ['DefaultEnvironment'],
    colorSchemes: [],
    audio: {
      songFilename: 'song.egg',
      songDuration: 12,
      songSampleStartFrom: 0,
      songSampleDuration: 10,
      bpm: 120,
      coverImageFilename: 'cover.png',
    },
    songPreviewFilename: 'song.egg',
    coverImageFilename: 'cover.png',
    difficultyBeatmaps: [
      {
        characteristic: 'Standard',
        difficulty: 'Expert',
        beatmapAuthors: { mappers: ['make-fixtures'], lighters: ['make-fixtures'] },
        environmentNameIdx: 0,
        beatmapColorSchemeIdx: -1,
        noteJumpMovementSpeed: 16,
        noteJumpStartBeatOffset: 0,
        beatmapDataFilename: 'ExpertStandard.dat',
        lightshowDataFilename: 'ExpertStandard.lightshow.dat',
      },
    ],
  };
}

function v4Beatmap() {
  return {
    version: '4.1.0',
    colorNotes: SPREAD.map((n, i) => ({ b: n.time, r: 0, i })),
    colorNotesData: SPREAD.map((n) => ({ x: n.line, y: n.layer, c: n.color, d: n.cut, a: 0 })),
    bombNotes: [{ b: BOMB_NOTE.time, r: 0, i: 0 }],
    bombNotesData: [{ x: BOMB_NOTE.line, y: BOMB_NOTE.layer }],
    arcs: [],
    arcsData: [],
    chains: [],
    chainsData: [],
    obstacles: WALLS.map((w, i) => ({ b: w.time, r: 0, i })),
    obstaclesData: WALLS.map((w) => ({
      x: w.line,
      y: w.type === 2 ? 3 : 0,
      d: w.duration,
      w: w.width,
      h: w.type === 0 ? 3 : 2,
    })),
    njsEvents: [],
    njsEventData: [],
  };
}

function v4Lightshow() {
  return {
    version: '2.0.0',
    basicEvents: LIGHT_EVENTS.map((e, i) => ({ b: e.time, i: e.value, i2: e.value, et: 0, es: 0, er: 0, id: i % 2 })),
    basicEventsData: [{ b: true }, { b: false }],
    colorBoostEvents: [],
    colorBoostEventsData: [],
    waypoints: [],
    waypointsData: [],
    indexFilters: [],
    eventBoxGroups: [],
    lightColorEventBoxes: [],
    lightColorEvents: [],
    lightRotationEventBoxes: [],
    lightRotationEvents: [],
    lightTranslationEventBoxes: [],
    lightTranslationEvents: [],
    fxEventBoxes: [],
    floatFxEvents: [],
    basicEventTypesWithKeywords: {},
    useNormalEventsAsCompatibleEvents: true,
  };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const shared = { 'cover.png': COVER, 'song.egg': AUDIO };

writeZip('syn-v2-basic.zip', {
  'Info.dat': v2Info(),
  'EasyStandard.dat': v2Beatmap(),
  'ExpertStandard.dat': v2Beatmap(),
  ...shared,
});

writeZip('syn-v3-bpm.zip', {
  'Info.dat': v3Info([['Standard', ['Easy', 'Expert']]], { bpm: 120 }),
  'EasyStandard.dat': {
    ...v3Beatmap([
      { b: 0, m: 120 },
      { b: 8, m: 180 },
    ]),
    colorNotes: [4, 8, 12, 16, 20].map((b, i) => ({ b, x: i % 4, y: 0, c: i % 2, d: 8, dn: 0, a: 0 })),
    bombNotes: [],
    obstacles: [],
    sliders: [],
    burstSliders: [],
  },
  'ExpertStandard.dat': v3Beatmap(),
  ...shared,
});

writeZip('syn-v3-basic.zip', {
  'Info.dat': v3Info([['Standard', ['Easy', 'Expert']]]),
  'EasyStandard.dat': v3Beatmap(),
  'ExpertStandard.dat': v3Beatmap(),
  ...shared,
});

writeZip('syn-v3-two-characteristics.zip', {
  'Info.dat': v3Info([
    ['Standard', ['Expert']],
    ['Lawless', ['Expert']],
  ]),
  'ExpertStandard.dat': v3Beatmap(),
  'ExpertLawless.dat': v3Beatmap(),
  ...shared,
});

writeZip('syn-v4-basic.zip', {
  'Info.dat': v4Info(),
  'ExpertStandard.dat': v4Beatmap(),
  'ExpertStandard.lightshow.dat': v4Lightshow(),
  ...shared,
});

writeZip('syn-info-lowercase.zip', {
  'info.dat': v2Info({ _songName: 'Synthetic lowercase info.dat' }),
  'EasyStandard.dat': v2Beatmap(),
  'ExpertStandard.dat': v2Beatmap(),
  ...shared,
});
