import type { LevelData, Position, Cube } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel, crearPuzzle } from './level-generator';

const { FLOOR, DISPENSER_LAVA, DISPENSER_ICE, LOGIC_CALIBRATOR, MASS_CONVERTER } = TileType;

// --- E3 - Nivel 3: Los Calibradores Lógicos ---

// 1. Crear la estructura base del nivel con 3 salas.
let grid = crearPlantillaNivel(3);

// 2. Definir las posiciones de los elementos interactivos y las rutas de acceso para excluirlos de la generación de puzzles.

// --- Sala 1 (abajo, índice 2) ---
const dispenser_s1 = { row: 37, col: 0 };
const calibrator1_positions: Position[] = [];
for (let r = 36; r <= 37; r++) for (let c = 8; c <= 12; c++) calibrator1_positions.push({ row: r, col: c });

const exclusions1: Position[] = [dispenser_s1, {row: 37, col: 1}, ...calibrator1_positions];
// Ruta de acceso vertical desde la entrada al centro de la sala
for (let r = 38; r < 44; r++) exclusions1.push({ row: r, col: 10 });
// Ruta de acceso horizontal desde el centro a los lados
for (let c = 1; c < 19; c++) exclusions1.push({ row: 38, col: c });


// --- Sala 2 (medio, índice 1) ---
const dispenser_s2_lava = { row: 22, col: 0 };
const dispenser_s2_ice = { row: 22, col: 19 };
const calibrator2a_positions: Position[] = [];
for (let r = 21; r <= 22; r++) for (let c = 3; c <= 7; c++) calibrator2a_positions.push({ row: r, col: c });
const calibrator2b_positions: Position[] = [];
for (let r = 21; r <= 22; r++) for (let c = 13; c <= 17; c++) calibrator2b_positions.push({ row: r, col: c });

const exclusions2: Position[] = [
    dispenser_s2_lava, {row: 22, col: 1}, dispenser_s2_ice, {row: 22, col: 18},
    ...calibrator2a_positions, ...calibrator2b_positions
];
// Ruta de acceso vertical desde la entrada al centro de la sala
for (let r = 23; r < 29; r++) exclusions2.push({ row: r, col: 10 });
// Ruta de acceso horizontal que conecta los calibradores y dispensadores
for (let c = 1; c < 19; c++) exclusions2.push({ row: 23, col: c });


// --- Sala 3 (arriba, índice 0) ---
const converter_s3_pos = { row: 10, col: 10 };
const calibrator3a_positions: Position[] = []; // >0
for (let r = 6; r <= 7; r++) for (let c = 1; c <= 5; c++) calibrator3a_positions.push({ row: r, col: c });
const calibrator3b_positions: Position[] = []; // <0
for (let r = 6; r <= 7; r++) for (let c = 14; c <= 18; c++) calibrator3b_positions.push({ row: r, col: c });
const calibrator3c_positions: Position[] = []; // =0
for (let r = 1; r <= 2; r++) for (let c = 8; c <= 12; c++) calibrator3c_positions.push({ row: r, col: c });

const exclusions3: Position[] = [converter_s3_pos, ...calibrator3a_positions, ...calibrator3b_positions, ...calibrator3c_positions];
// Ruta de acceso vertical central
for (let r = 3; r < 14; r++) exclusions3.push({ row: r, col: 10 });
// Ruta de acceso horizontal para calibradores laterales
for (let c = 1; c < 19; c++) exclusions3.push({ row: 8, col: c });
// Ruta de acceso horizontal para el calibrador superior
for (let c = 8; c < 13; c++) exclusions3.push({ row: 3, col: c });


// 3. Generar puzzles de rocas aleatorios en cada sala, evitando las zonas interactivas.
grid = crearPuzzle(grid, 2, exclusions1);
grid = crearPuzzle(grid, 1, exclusions2);
grid = crearPuzzle(grid, 0, exclusions3);

// 4. Colocar los elementos interactivos en el grid.
grid[dispenser_s1.row][dispenser_s1.col] = DISPENSER_LAVA;
calibrator1_positions.forEach(pos => grid[pos.row][pos.col] = LOGIC_CALIBRATOR);

grid[dispenser_s2_lava.row][dispenser_s2_lava.col] = DISPENSER_LAVA;
grid[dispenser_s2_ice.row][dispenser_s2_ice.col] = DISPENSER_ICE;
calibrator2a_positions.forEach(pos => grid[pos.row][pos.col] = LOGIC_CALIBRATOR);
calibrator2b_positions.forEach(pos => grid[pos.row][pos.col] = LOGIC_CALIBRATOR);

grid[converter_s3_pos.row][converter_s3_pos.col] = MASS_CONVERTER;
calibrator3a_positions.forEach(pos => grid[pos.row][pos.col] = LOGIC_CALIBRATOR);
calibrator3b_positions.forEach(pos => grid[pos.row][pos.col] = LOGIC_CALIBRATOR);
calibrator3c_positions.forEach(pos => grid[pos.row][pos.col] = LOGIC_CALIBRATOR);

// 5. Colocar jugador y cubos iniciales.
const playerStart = { row: 42, col: 10 };
const cubes: Omit<Cube, 'status'>[] = [
    // 4 cubos iniciales para la sala 3
    { id: 601, type: 'lava', value: 1, position: { row: 12, col: 2 } },
    { id: 602, type: 'lava', value: 1, position: { row: 12, col: 3 } },
    { id: 603, type: 'lava', value: 1, position: { row: 12, col: 16 } },
    { id: 604, type: 'lava', value: 1, position: { row: 12, col: 17 } },
];

// 6. Definir la configuración de los calibradores lógicos.
const logicCalibrators: NonNullable<LevelData['logicCalibrators']> = [
    { id: 'sala1_gt3', positions: calibrator1_positions, operator: 'gt', target: 3, controlsDoor: 1 },
    { id: 'sala2_lt-4', positions: calibrator2a_positions, operator: 'lt', target: -4, controlsDoor: 2 },
    { id: 'sala2_gt1', positions: calibrator2b_positions, operator: 'gt', target: 1, controlsDoor: 2 },
    { id: 'sala3_gt0', positions: calibrator3a_positions, operator: 'gt', target: 0, controlsDoor: 3 },
    { id: 'sala3_lt0', positions: calibrator3b_positions, operator: 'lt', target: 0, controlsDoor: 3 },
    { id: 'sala3_eq0', positions: calibrator3c_positions, operator: 'eq', target: 0, controlsDoor: 3 },
];

export const LEVEL_3_3: LevelData = {
    title: "Episodio 3: Los Calibradores Lógicos",
    shortTitle: "E3 - Nivel 3",
    grid,
    playerStart,
    cubes,
    logicCalibrators,
    objectives: {
        1: "OBJETIVO: Activa el Calibrador Lógico alcanzando una suma > 3.",
        2: "OBJETIVO: Activa ambos calibradores a la vez (< -4 y > 1).",
        3: "OBJETIVO: Usa el Convertidor de Masa para resolver los 3 calibradores finales.",
    },
};
