
import type { LevelData, Position, Cube } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel } from './level-generator';

const { ASSEMBLER_PLATE, DISPENSER_LAVA, DISPENSER_ICE, MASS_CONVERTER } = TileType;

// --- E3 - Nivel 4: El Ensamblador de Enteros ---

// 1. Crear la estructura base del nivel con 3 salas.
let grid = crearPlantillaNivel(3);

// 2. Definir las posiciones de los elementos interactivos y las zonas de puzzle.
const sala1_plates: Position[] = [];
for (let r = 36; r <= 37; r++) for (let c = 8; c <= 12; c++) sala1_plates.push({ row: r, col: c });

const sala2_plates: Position[] = [];
for (let r = 21; r <= 22; r++) for (let c = 8; c <= 12; c++) sala2_plates.push({ row: r, col: c });

const sala3_plates: Position[] = [];
for (let r = 6; r <= 7; r++) for (let c = 8; c <= 12; c++) sala3_plates.push({ row: r, col: c });

// 3. (Eliminado) No se generan puzzles de rocas en este nivel para tener un espacio abierto.

// 4. Colocar los elementos interactivos en el grid.
// Sala 1
grid[37][0] = DISPENSER_LAVA;
grid[37][19] = DISPENSER_ICE;
sala1_plates.forEach(p => grid[p.row][p.col] = ASSEMBLER_PLATE);

// Sala 2
grid[22][0] = DISPENSER_LAVA;
grid[22][19] = DISPENSER_ICE;
sala2_plates.forEach(p => grid[p.row][p.col] = ASSEMBLER_PLATE);

// Sala 3
grid[12][0] = DISPENSER_LAVA;
grid[12][19] = DISPENSER_ICE;
grid[10][10] = MASS_CONVERTER;
sala3_plates.forEach(p => grid[p.row][p.col] = ASSEMBLER_PLATE);

// 5. Definir la lógica del ensamblador para cada sala.
const assemblers: NonNullable<LevelData['assemblers']> = [
    {
        id: 'sala1',
        positions: sala1_plates,
        controlsDoor: 1,
        goals: [
            { type: 'cube_count', condition: 'eq', value: 3, description: 'Cubos Usados' },
            { type: 'total_sum', condition: 'eq', value: -1, description: 'Suma Total' },
        ],
    },
    {
        id: 'sala2',
        positions: sala2_plates,
        controlsDoor: 2,
        goals: [
            { type: 'cube_count', condition: 'gt', value: 4, description: 'Cubos Usados' },
            { type: 'row_parity', index: 0, condition: 'odd', value: 0, description: 'Fila Superior' },
            { type: 'col_parity', index: 2, condition: 'even', value: 0, description: 'Columna 3' },
            { type: 'total_sum', condition: 'eq', value: -5, description: 'Suma Total' },
        ],
    },
    {
        id: 'sala3_final',
        positions: sala3_plates,
        controlsDoor: 3,
        goals: [
            { type: 'cube_count', condition: 'eq', value: 8, description: 'Cubos Usados' },
            { type: 'row_sum', index: 0, condition: 'eq', value: -2, description: 'Fila Superior' },
            { type: 'row_sum', index: 1, condition: 'eq', value: -4, description: 'Fila Inferior' },
            { type: 'col_sum', index: 0, condition: 'gt', value: 0, description: 'Columna 1' },
            { type: 'col_sum', index: 4, condition: 'lt', value: 0, description: 'Columna 5' },
            { type: 'total_sum', condition: 'eq', value: -6, description: 'Suma Total' },
        ],
    },
];

export const LEVEL_3_4: LevelData = {
    title: "Episodio 3: El Ensamblador de Enteros",
    shortTitle: "E3 - Nivel 4",
    grid,
    playerStart: { row: 42, col: 10 },
    cubes: [],
    assemblers,
    objectives: {
        1: "OBJETIVO: Satisface las 2 condiciones del Ensamblador para abrir la puerta.",
        2: "OBJETIVO: ¡Más complejo! Cumple las 4 condiciones para desbloquear la sala final.",
        3: "OBJETIVO FINAL: Resuelve el puzzle de 6 condiciones para ganar el juego.",
    },
};