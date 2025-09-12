import type { LevelData, Position } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel, crearPuzzle } from './level-generator';

const { FLOOR, DISPENSER_LAVA, DISPENSER_ICE, NUMERIC_DEPOSIT } = TileType;

// 1. Crear la estructura base del nivel con 3 salas.
let grid = crearPlantillaNivel(3);

// 2. Definir las posiciones de los elementos interactivos ANTES de generar los puzzles
// para poder excluirlos.

// Sala 1 (abajo, índice 2) - Zona de depósito 2x5
const dispenser1_pos = { row: 37, col: 0 };
const deposit1_positions: Position[] = [];
for (let r = 36; r <= 37; r++) {
    for (let c = 8; c <= 12; c++) {
        deposit1_positions.push({ row: r, col: c });
    }
}
const exclusions1 = [dispenser1_pos, {row: 37, col: 1}, ...deposit1_positions];

// Sala 2 (medio, índice 1) - Zona de depósito 2x5
const dispenser2_pos = { row: 22, col: 19 };
const deposit2_positions: Position[] = [];
for (let r = 21; r <= 22; r++) {
    for (let c = 8; c <= 12; c++) {
        deposit2_positions.push({ row: r, col: c });
    }
}
const exclusions2 = [dispenser2_pos, {row: 22, col: 18}, ...deposit2_positions];

// Sala 3 (arriba, índice 0) - Zona de depósito 2x5
const dispenser3_lava_pos = { row: 7, col: 0 };
const dispenser3_ice_pos = { row: 7, col: 19 };
const deposit3_positions: Position[] = [];
for (let r = 6; r <= 7; r++) {
    for (let c = 8; c <= 12; c++) {
        deposit3_positions.push({ row: r, col: c });
    }
}
const exclusions3 = [
    dispenser3_lava_pos, {row: 7, col: 1}, 
    dispenser3_ice_pos, {row: 7, col: 18},
    ...deposit3_positions,
];

// 3. Generar puzzles de rocas aleatorios en cada sala, evitando las zonas interactivas.
grid = crearPuzzle(grid, 2, exclusions1);
grid = crearPuzzle(grid, 1, exclusions2);
grid = crearPuzzle(grid, 0, exclusions3);

// 4. Colocar los elementos interactivos en el grid.
grid[dispenser1_pos.row][dispenser1_pos.col] = DISPENSER_LAVA;
deposit1_positions.forEach(pos => grid[pos.row][pos.col] = NUMERIC_DEPOSIT);

grid[dispenser2_pos.row][dispenser2_pos.col] = DISPENSER_ICE;
deposit2_positions.forEach(pos => grid[pos.row][pos.col] = NUMERIC_DEPOSIT);

grid[dispenser3_lava_pos.row][dispenser3_lava_pos.col] = DISPENSER_LAVA;
grid[dispenser3_ice_pos.row][dispenser3_ice_pos.col] = DISPENSER_ICE;
deposit3_positions.forEach(pos => grid[pos.row][pos.col] = NUMERIC_DEPOSIT);

// 5. Colocar al jugador.
const playerStart = { row: 42, col: 10 };

// 6. Definir la configuración de los depósitos numéricos.
const numericDeposits: NonNullable<LevelData['numericDeposits']> = [
    { id: 'sala1', positions: deposit1_positions, target: 4, controlsDoor: 1 },
    { id: 'sala2', positions: deposit2_positions, target: -3, controlsDoor: 2 },
    { id: 'sala3', positions: deposit3_positions, target: 0, controlsDoor: 3 },
];

export const LEVEL_3_2: LevelData = {
    title: "Episodio 3: La Bóveda de Unidades",
    shortTitle: "E3 - Nivel 2",
    grid,
    playerStart,
    cubes: [], // El nivel empieza sin cubos, se generan con los dispensadores.
    numericDeposits,
    objectives: {
        1: "OBJETIVO: Usa el Dispensador de Lava para alcanzar una suma de [+4].",
        2: "OBJETIVO: Usa el Dispensador de Hielo para alcanzar una suma de [-3].",
        3: "OBJETIVO: Usa ambos dispensadores para alcanzar el equilibrio: [0].",
    },
};