import type { LevelData, Position, Cube, CubeType } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel, crearPuzzle } from './level-generator';

const { FLOOR, GOAL, COMPARISON_GT, COMPARISON_LT, COMPARISON_EQ, COMPARISON_SLOT_A, COMPARISON_SLOT_B, EMITTER } = TileType;

// --- Nivel 2-3: El Entorno Radioactivo (Rediseño) ---

// 1. Crear la estructura base del nivel.
let grid = crearPlantillaNivel(3);

// 2. Definir posiciones para todas las estaciones de comparación.
const station_S1_Gt_core = { row: 37, col: 10 };
const station_S2_Lt_core = { row: 22, col: 6 };
const station_S2_Eq_core = { row: 22, col: 14 };
const station_S3_Gt_core = { row: 7, col: 4 };
const station_S3_Lt_core = { row: 7, col: 10 };
const station_S3_Eq_core = { row: 7, col: 16 };
const door1Pos = [{ row: 29, col: 9 }, { row: 29, col: 10 }];
const door2Pos = [{ row: 14, col: 9 }, { row: 14, col: 10 }];

// 3. Definir zonas de exclusión para que no se generen rocas.
const getStationExclusions = (core: Position): Position[] => [
    { row: core.row, col: core.col - 1 }, // slot_a
    core,
    { row: core.row, col: core.col + 1 }, // slot_b
    // Accessibility space
    { row: core.row - 1, col: core.col - 1 },
    { row: core.row - 1, col: core.col },
    { row: core.row - 1, col: core.col + 1 },
    { row: core.row + 1, col: core.col - 1 },
    { row: core.row + 1, col: core.col },
    { row: core.row + 1, col: core.col + 1 },
];

const allExclusions = [
    ...getStationExclusions(station_S1_Gt_core),
    ...getStationExclusions(station_S2_Lt_core),
    ...getStationExclusions(station_S2_Eq_core),
    ...getStationExclusions(station_S3_Gt_core),
    ...getStationExclusions(station_S3_Lt_core),
    ...getStationExclusions(station_S3_Eq_core),
    ...door1Pos, ...door2Pos,
    { row: 0, col: 10 }, // Goal
];

// 4. Generar puzzles de rocas, respetando las exclusiones.
const getExclusionsForRoom = (salaIndex: number) => {
    const ALTO_SALA = 14;
    const salaTop = salaIndex * (ALTO_SALA + 1);
    const salaBottom = salaTop + ALTO_SALA + 1;
    return allExclusions.filter(p => p.row >= salaTop && p.row < salaBottom);
};

grid = crearPuzzle(grid, 2, getExclusionsForRoom(2));
grid = crearPuzzle(grid, 1, getExclusionsForRoom(1));
grid = crearPuzzle(grid, 0, getExclusionsForRoom(0));

// 5. Colocar las estaciones en el grid.
const placeComparisonStation = (g: TileType[][], core: Position, operator: TileType) => {
    g[core.row][core.col - 1] = COMPARISON_SLOT_A;
    g[core.row][core.col] = operator;
    g[core.row][core.col + 1] = COMPARISON_SLOT_B;
    return { slot_a: { row: core.row, col: core.col - 1 }, slot_b: { row: core.row, col: core.col + 1 } };
};

const station_S1_Gt = placeComparisonStation(grid, station_S1_Gt_core, COMPARISON_GT);
const station_S2_Lt = placeComparisonStation(grid, station_S2_Lt_core, COMPARISON_LT);
const station_S2_Eq = placeComparisonStation(grid, station_S2_Eq_core, COMPARISON_EQ);
const station_S3_Gt = placeComparisonStation(grid, station_S3_Gt_core, COMPARISON_GT);
const station_S3_Lt = placeComparisonStation(grid, station_S3_Lt_core, COMPARISON_LT);
const station_S3_Eq = placeComparisonStation(grid, station_S3_Eq_core, COMPARISON_EQ);

// 6. Colocar emisores en las paredes.
grid[37][0] = EMITTER; grid[37][19] = EMITTER;
grid[22][0] = EMITTER; grid[22][19] = EMITTER;
grid[7][0] = EMITTER; grid[7][19] = EMITTER;

// 7. Definir los logicLinks.
const logicLinks: NonNullable<LevelData['logicLinks']> = [
    { id: 's1_gt', operator: 'gt', slot_a_pos: station_S1_Gt.slot_a, slot_b_pos: station_S1_Gt.slot_b },
    { id: 's2_lt', operator: 'lt', slot_a_pos: station_S2_Lt.slot_a, slot_b_pos: station_S2_Lt.slot_b },
    { id: 's2_eq', operator: 'eq', slot_a_pos: station_S2_Eq.slot_a, slot_b_pos: station_S2_Eq.slot_b },
    { id: 's3_gt', operator: 'gt', slot_a_pos: station_S3_Gt.slot_a, slot_b_pos: station_S3_Gt.slot_b },
    { id: 's3_lt', operator: 'lt', slot_a_pos: station_S3_Lt.slot_a, slot_b_pos: station_S3_Lt.slot_b },
    { id: 's3_eq', operator: 'eq', slot_a_pos: station_S3_Eq.slot_a, slot_b_pos: station_S3_Eq.slot_b },
];

// 8. Colocar jugador y cubos en posiciones seguras.
let posicionesOcupadas: Position[] = [];
const playerStart = encontrarPosicionesSeguras(2, 1, [], grid)[0] || { row: 42, col: 10 };
posicionesOcupadas.push(playerStart);
const cubes: Omit<Cube, 'status'>[] = [];
let cubeIdCounter = 400;

// Helper para encontrar posiciones seguras
function encontrarPosicionesSeguras(
    salaIndex: number,
    cantidad: number,
    ocupadas: Position[] = [],
    gridRef: TileType[][],
): Position[] {
    const ALTO_SALA = 14;
    const ANCHO_SALA = 20;
    const salaTop = salaIndex * (ALTO_SALA + 1);
    const limites = {
        top: salaTop + 1, bottom: salaTop + ALTO_SALA,
        left: 1, right: ANCHO_SALA - 1,
    };
    const posicionesDisponibles: Position[] = [];
    const setOcupadas = new Set(ocupadas.map(p => `${p.row},${p.col}`));

    for (let r = limites.top; r < limites.bottom; r++) {
        for (let c = limites.left; c < limites.right; c++) {
            if (gridRef[r][c] === FLOOR && !setOcupadas.has(`${r},${c}`)) {
                posicionesDisponibles.push({ row: r, col: c });
            }
        }
    }

    for (let i = posicionesDisponibles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [posicionesDisponibles[i], posicionesDisponibles[j]] = [posicionesDisponibles[j], posicionesDisponibles[i]];
    }
    return posicionesDisponibles.slice(0, cantidad);
}

const cubeDefsS1: { type: CubeType; value: number }[] = [{ type: 'lava', value: 5 }, { type: 'ice', value: -2 }];
const cubePosS1 = encontrarPosicionesSeguras(2, cubeDefsS1.length, posicionesOcupadas, grid);
cubeDefsS1.forEach((def, i) => {
    const pos = cubePosS1[i] || { row: 35, col: 5 + i * 10 };
    cubes.push({ ...def, id: cubeIdCounter++, position: pos });
    posicionesOcupadas.push(pos);
});

const cubeDefsS2: { type: CubeType; value: number }[] = [{ type: 'lava', value: 6 }, { type: 'lava', value: 6 }, { type: 'ice', value: -9 }, { type: 'lava', value: 3 }];
const cubePosS2 = encontrarPosicionesSeguras(1, cubeDefsS2.length, posicionesOcupadas, grid);
cubeDefsS2.forEach((def, i) => {
    const pos = cubePosS2[i] || { row: 20, col: 3 + i * 5 };
    cubes.push({ ...def, id: cubeIdCounter++, position: pos });
    posicionesOcupadas.push(pos);
});

const cubeDefsS3: { type: CubeType; value: number }[] = [{ type: 'lava', value: 10 }, { type: 'ice', value: -10 }, { type: 'lava', value: 7 }, { type: 'ice', value: -7 }, { type: 'lava', value: 4 }, { type: 'lava', value: 4 }];
const cubePosS3 = encontrarPosicionesSeguras(0, cubeDefsS3.length, posicionesOcupadas, grid);
cubeDefsS3.forEach((def, i) => {
    const pos = cubePosS3[i] || { row: 5, col: 2 + i * 3 };
    cubes.push({ ...def, id: cubeIdCounter++, position: pos });
});

export const LEVEL_2_3: LevelData = {
    title: "Episodio 2: El Entorno Radioactivo",
    shortTitle: "E2 - Nivel 3",
    grid,
    playerStart,
    cubes,
    logicLinks,
    objectives: {
        1: "OBJETIVO: ¡Esquiva la lluvia radioactiva! Resuelve el puzzle (>) para abrir la primera puerta.",
        2: "OBJETIVO: ¡La radiación aumenta! Resuelve las comparaciones (<, =) para avanzar.",
        3: "OBJETIVO: ¡Fusión nuclear inminente! Resuelve los 3 puzzles (>, <, =) para escapar.",
    },
};
