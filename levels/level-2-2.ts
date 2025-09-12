import type { LevelData, Position, Cube, CubeType } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel, crearPuzzle } from './level-generator';

const { WALL, FLOOR, GOAL, COMPARISON_GT, COMPARISON_LT, COMPARISON_EQ, COMPARISON_SLOT_A, COMPARISON_SLOT_B, SCANNER_PLATE, DOOR_STAGE_3 } = TileType;

// 1. Crear la estructura base del nivel con 3 salas.
let grid = crearPlantillaNivel(3);

// 2. Rellenar CADA sala con un puzzle de rocas aleatorio ANTES de colocar los objetos.
grid = crearPuzzle(grid, 0); // Sala de arriba
grid = crearPuzzle(grid, 1); // Sala del medio
grid = crearPuzzle(grid, 2); // Sala de abajo

// 3. Modificar la sala final para tener una puerta lógica HORIZONTAL antes de la meta.
grid[0][10] = GOAL; // La meta está en la plantilla, se mantiene

// Crear muro horizontal que protege la meta
for (let c = 1; c < 19; c++) {
    grid[2][c] = WALL;
}
// Crear puerta horizontal en el centro del muro
grid[2][9] = DOOR_STAGE_3;
grid[2][10] = DOOR_STAGE_3;


// 4. Helper para encontrar posiciones seguras.
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

// Helper para colocar las estaciones de comparación
function placeComparisonStation(g: TileType[][], y: number, x: number, operator: TileType): { slot_a: Position, slot_b: Position } {
    const slot_a_pos = { row: y, col: x - 1 };
    const operator_pos = { row: y, col: x };
    const slot_b_pos = { row: y, col: x + 1 };
    
    g[slot_a_pos.row][slot_a_pos.col] = COMPARISON_SLOT_A;
    g[operator_pos.row][operator_pos.col] = operator;
    g[slot_b_pos.row][slot_b_pos.col] = COMPARISON_SLOT_B;
    
    return { slot_a: slot_a_pos, slot_b: slot_b_pos };
}


// 5. Colocar entidades y definir logicLinks
let posicionesOcupadas: Position[] = [];
const playerStart = encontrarPosicionesSeguras(2, 1, [], grid)[0] || { row: 42, col: 10 };
posicionesOcupadas.push(playerStart);

const logicLinks: NonNullable<LevelData['logicLinks']> = [];
const cubes: Omit<Cube, 'status'>[] = [];
let cubeIdCounter = 320;

// --- SALA 1 (Abajo, salaIndex 2): 1 estación, 4 cubos ---
const scannerS1 = encontrarPosicionesSeguras(2, 1, posicionesOcupadas, grid)[0] || { row: 35, col: 10 };
grid[scannerS1.row][scannerS1.col] = SCANNER_PLATE;
posicionesOcupadas.push(scannerS1);

const station_S1_Gt = placeComparisonStation(grid, 37, 10, COMPARISON_GT);
logicLinks.push({ id: 's1_gt', operator: 'gt', slot_a_pos: station_S1_Gt.slot_a, slot_b_pos: station_S1_Gt.slot_b });
posicionesOcupadas.push(station_S1_Gt.slot_a, { row: 37, col: 10 }, station_S1_Gt.slot_b);

const cubeDefsS1: { type: CubeType; value: number }[] = [
    { type: 'lava', value: 5 }, { type: 'ice', value: -2 }, { type: 'lava', value: 1 }, { type: 'ice', value: -8 },
];
const cubePosS1 = encontrarPosicionesSeguras(2, cubeDefsS1.length, posicionesOcupadas, grid);
cubeDefsS1.forEach((def, i) => {
    cubes.push({ ...def, id: cubeIdCounter++, isMemory: true, position: cubePosS1[i] });
    posicionesOcupadas.push(cubePosS1[i]);
});


// --- SALA 2 (Medio, salaIndex 1): 2 estaciones, 6 cubos ---
const scannerS2 = encontrarPosicionesSeguras(1, 1, posicionesOcupadas, grid)[0] || { row: 20, col: 10 };
grid[scannerS2.row][scannerS2.col] = SCANNER_PLATE;
posicionesOcupadas.push(scannerS2);

const station_S2_Lt = placeComparisonStation(grid, 22, 6, COMPARISON_LT);
logicLinks.push({ id: 's2_lt', operator: 'lt', slot_a_pos: station_S2_Lt.slot_a, slot_b_pos: station_S2_Lt.slot_b });
posicionesOcupadas.push(station_S2_Lt.slot_a, { row: 22, col: 6 }, station_S2_Lt.slot_b);

const station_S2_Eq = placeComparisonStation(grid, 22, 14, COMPARISON_EQ);
logicLinks.push({ id: 's2_eq', operator: 'eq', slot_a_pos: station_S2_Eq.slot_a, slot_b_pos: station_S2_Eq.slot_b });
posicionesOcupadas.push(station_S2_Eq.slot_a, { row: 22, col: 14 }, station_S2_Eq.slot_b);

const cubeDefsS2: { type: CubeType; value: number }[] = [
    { type: 'lava', value: 6 }, { type: 'lava', value: 6 }, { type: 'ice', value: -9 }, { type: 'lava', value: 3 }, { type: 'ice', value: -4 }, { type: 'ice', value: -1 },
];
const cubePosS2 = encontrarPosicionesSeguras(1, cubeDefsS2.length, posicionesOcupadas, grid);
cubeDefsS2.forEach((def, i) => {
    cubes.push({ ...def, id: cubeIdCounter++, isMemory: true, position: cubePosS2[i] });
    posicionesOcupadas.push(cubePosS2[i]);
});


// --- SALA 3 (Arriba, salaIndex 0): 3 estaciones, 8 cubos ---
const scannerS3 = encontrarPosicionesSeguras(0, 1, posicionesOcupadas, grid)[0] || { row: 5, col: 10 };
grid[scannerS3.row][scannerS3.col] = SCANNER_PLATE;
posicionesOcupadas.push(scannerS3);

const station_S3_Gt = placeComparisonStation(grid, 7, 4, COMPARISON_GT);
logicLinks.push({ id: 's3_gt', operator: 'gt', slot_a_pos: station_S3_Gt.slot_a, slot_b_pos: station_S3_Gt.slot_b });
posicionesOcupadas.push(station_S3_Gt.slot_a, { row: 7, col: 4 }, station_S3_Gt.slot_b);

const station_S3_Lt = placeComparisonStation(grid, 7, 10, COMPARISON_LT);
logicLinks.push({ id: 's3_lt', operator: 'lt', slot_a_pos: station_S3_Lt.slot_a, slot_b_pos: station_S3_Lt.slot_b });
posicionesOcupadas.push(station_S3_Lt.slot_a, { row: 7, col: 10 }, station_S3_Lt.slot_b);

const station_S3_Eq = placeComparisonStation(grid, 7, 16, COMPARISON_EQ);
logicLinks.push({ id: 's3_eq', operator: 'eq', slot_a_pos: station_S3_Eq.slot_a, slot_b_pos: station_S3_Eq.slot_b });
posicionesOcupadas.push(station_S3_Eq.slot_a, { row: 7, col: 16 }, station_S3_Eq.slot_b);

const cubeDefsS3: { type: CubeType; value: number }[] = [
    { type: 'lava', value: 10 }, { type: 'ice', value: -10 }, { type: 'lava', value: 7 }, { type: 'ice', value: -7 }, { type: 'lava', value: 2 }, { type: 'ice', value: -2 }, { type: 'lava', value: 4 }, { type: 'ice', value: -5 },
];
const cubePosS3 = encontrarPosicionesSeguras(0, cubeDefsS3.length, posicionesOcupadas, grid);
cubeDefsS3.forEach((def, i) => {
    cubes.push({ ...def, id: cubeIdCounter++, isMemory: true, position: cubePosS3[i] });
});

export const LEVEL_2_2: LevelData = {
    title: "Episodio 2: El Desafío de la Memoria",
    shortTitle: "E2 - Nivel 2",
    grid,
    playerStart,
    cubes,
    logicLinks,
    objectives: {
        1: "OBJETIVO: Resuelve la comparación (>) para abrir la primera puerta.",
        2: "OBJETIVO: Resuelve las comparaciones (<, =) para abrir la segunda puerta.",
        3: "OBJETIVO: Resuelve las tres comparaciones finales para alcanzar la meta.",
    },
};