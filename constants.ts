import type { LevelData } from './types';
import { TileType } from './types';

export const TILE_SIZE = 40; // in pixels

// Todas las definiciones de niveles han sido movidas a archivos individuales
// en la nueva carpeta /levels.

export const LEVEL_SOLUTIONS: Record<number, Record<string, number>> = {
  4: { // Corresponde al índice 4 de LEVELS (LEVEL_2_1) - AHORA PROCEDURAL Y CORREGIDO
    // Sala 1 (abajo) - 1 par, Fila 37
    '37-9': -1, '37-11': 1,
    // Sala 2 (medio) - 2 pares, Fila 22
    '22-8': -4, '22-9': -2, '22-11': 2, '22-12': 4,
    // Sala 3 (arriba) - 3 pares, Fila 7
    '7-7': -7, '7-8': -5, '7-9': -3, '7-11': 3, '7-12': 5, '7-13': 7,
  }
};