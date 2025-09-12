import type { LevelData, Position, Cube } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel, crearPuzzle } from './level-generator';

const { PLATE_ABS, DOOR_ABS, SYNTH_SLOT_A, SYNTH_CORE, SYNTH_SLOT_B, SYNTH_OUTPUT, EMITTER, WALL } = TileType;

// --- Nivel 2-4: El Sintetizador de Enteros (Revisado) ---

// 1. Generate the base level structure.
let grid = crearPlantillaNivel(3);

// 2. Define positions for ALL static interactive elements.
// Room 1 (Bottom)
const synth1_core = { row: 37, col: 10 };
const plate1Pos = { row: 32, col: 10 };
const door1Pos = [{ row: 29, col: 9 }, { row: 29, col: 10 }];

// Room 2 (Middle)
const synth2_core = { row: 22, col: 10 };
const plate2Pos = { row: 17, col: 10 };
const door2Pos = [{ row: 14, col: 9 }, { row: 14, col: 10 }];

// Room 3 (Top) - FINAL CHALLENGE
const synth3_core = { row: 7, col: 6 };
const synth4_core = { row: 7, col: 14 };
const plate3_A_pos = { row: 4, col: 8 };
const plate3_B_pos = { row: 4, col: 12 };
const door3_pos = [{ row: 1, col: 9 }, { row: 1, col: 10 }];
grid[1][8] = WALL;
grid[1][11] = WALL;

// 3. Define exclusion zones for all elements.
const getSynthExclusions = (core: Position): Position[] => [
  { row: core.row, col: core.col - 1 }, { row: core.row, col: core.col + 1 }, core,
  { row: core.row + 1, col: core.col },
  { row: core.row + 1, col: core.col - 1 }, { row: core.row + 1, col: core.col + 1 },
  { row: core.row + 2, col: core.col },
  { row: core.row - 1, col: core.col - 1 }, { row: core.row - 1, col: core.col + 1 },
];

const getPlateExclusions = (plate: Position): Position[] => [
  plate,
  { row: plate.row - 1, col: plate.col }, { row: plate.row + 1, col: plate.col },
  { row: plate.row, col: plate.col - 1 }, { row: plate.row, col: plate.col + 1 },
];

const allExclusions = [
  ...getSynthExclusions(synth1_core), ...getPlateExclusions(plate1Pos),
  ...getSynthExclusions(synth2_core), ...getPlateExclusions(plate2Pos),
  ...getSynthExclusions(synth3_core), ...getSynthExclusions(synth4_core),
  ...getPlateExclusions(plate3_A_pos), ...getPlateExclusions(plate3_B_pos),
  ...door1Pos, ...door2Pos, ...door3_pos,
  { row: 1, col: 8 }, { row: 1, col: 11 }, // Walls around final door
  { row: 0, col: 10 }, // Goal
];

// 4. Generate procedural rock puzzles, respecting the exclusion zones.
const getExclusionsForRoom = (salaIndex: number) => {
    const ALTO_SALA = 14;
    const salaTop = salaIndex * (ALTO_SALA + 1);
    const salaBottom = salaTop + ALTO_SALA + 1;
    return allExclusions.filter(p => p.row >= salaTop && p.row < salaBottom);
};

grid = crearPuzzle(grid, 2, getExclusionsForRoom(2)); // Room 1
grid = crearPuzzle(grid, 1, getExclusionsForRoom(1)); // Room 2
grid = crearPuzzle(grid, 0, getExclusionsForRoom(0)); // Room 3 (final)

// 5. Place the interactive elements onto the grid.
const placeSynthesizer = (g: TileType[][], core: Position) => {
  g[core.row][core.col - 1] = SYNTH_SLOT_A; g[core.row][core.col] = SYNTH_CORE;
  g[core.row][core.col + 1] = SYNTH_SLOT_B; g[core.row + 1][core.col] = SYNTH_OUTPUT;
  return {
    slot_a: { row: core.row, col: core.col - 1 }, core,
    slot_b: { row: core.row, col: core.col + 1 }, output: { row: core.row + 1, col: core.col },
  };
};

const synth1Pos = placeSynthesizer(grid, synth1_core);
grid[plate1Pos.row][plate1Pos.col] = PLATE_ABS;
door1Pos.forEach(p => grid[p.row][p.col] = DOOR_ABS);

const synth2Pos = placeSynthesizer(grid, synth2_core);
grid[plate2Pos.row][plate2Pos.col] = PLATE_ABS;
door2Pos.forEach(p => grid[p.row][p.col] = DOOR_ABS);

const synth3Pos = placeSynthesizer(grid, synth3_core);
const synth4Pos = placeSynthesizer(grid, synth4_core);
grid[plate3_A_pos.row][plate3_A_pos.col] = PLATE_ABS;
grid[plate3_B_pos.row][plate3_B_pos.col] = PLATE_ABS;
door3_pos.forEach(p => grid[p.row][p.col] = DOOR_ABS);

// 6. Place emitters on ALL walls.
grid[37][0] = EMITTER; grid[37][19] = EMITTER;
grid[22][0] = EMITTER; grid[22][19] = EMITTER;
grid[7][0] = EMITTER; grid[7][19] = EMITTER;

// 7. Define player start and initial cubes.
const playerStart = { row: 42, col: 10 };
const cubes: Omit<Cube, 'status'>[] = [
  // Room 1 Cubes
  { id: 501, type: 'lava', value: 1, position: { row: 40, col: 4 } },
  { id: 502, type: 'lava', value: 2, position: { row: 40, col: 15 } },
  // Room 2 Cubes
  { id: 503, type: 'lava', value: 1, position: { row: 25, col: 3 } },
  { id: 504, type: 'ice', value: -4, position: { row: 25, col: 8 } },
  { id: 505, type: 'lava', value: 8, position: { row: 25, col: 16 } },
  // Room 3 (Final) Cubes
  { id: 506, type: 'lava', value: 3, position: { row: 12, col: 3 } },
  { id: 507, type: 'lava', value: 4, position: { row: 12, col: 7 } },
  { id: 508, type: 'ice', value: -4, position: { row: 12, col: 13 } },
  { id: 509, type: 'ice', value: -5, position: { row: 12, col: 17 } },
];

export const LEVEL_2_4: LevelData = {
  title: "Episodio 2: El Sintetizador de Enteros",
  shortTitle: "E2 - Nivel 4",
  grid,
  playerStart,
  cubes,
  synthesizers: [
    { id: 'synth1', ...synth1Pos },
    { id: 'synth2', ...synth2Pos },
    { id: 'synth3', ...synth3Pos },
    { id: 'synth4', ...synth4Pos },
  ],
  absoluteLinks: [
    { value: 3, plate_pos: plate1Pos, door_pos: door1Pos },
    { value: 5, plate_pos: plate2Pos, door_pos: door2Pos },
    { value: 7, plate_pos: plate3_A_pos, door_pos: door3_pos },
    { value: 9, plate_pos: plate3_B_pos, door_pos: door3_pos },
  ],
  objectives: {
    1: "OBJETIVO: Crea un cubo de valor |3| usando el Sintetizador.",
    2: "OBJETIVO: ¡Piensa en secuencia! Sintetiza un cubo de valor |5| para avanzar.",
    3: "OBJETIVO: ¡Desafío final! Resuelve los dos puzzles (|7| y |-9|) para abrir la puerta a la meta.",
  },
};