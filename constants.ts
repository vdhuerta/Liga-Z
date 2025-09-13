
import type { LevelData } from './types';
import { TileType } from './types';

export const VIEWPORT_HEIGHT_TILES = 14;
export const VIEWPORT_WIDTH_TILES = 20;

export const calculateTileSize = (isTouchDevice: boolean) => {
  const availableHeight = window.innerHeight;
  const availableWidth = window.innerWidth;

  let contentHeight = availableHeight;
  let contentWidth = availableWidth;

  // Detect mobile phones by screen width to apply specific UI spacing.
  const isMobilePhone = availableWidth < 768;

  // Se reserva espacio para la UI de la app (cabecera/pie) y la UI del navegador (barra de direcciones).
  // Se reduce el espacio en móviles para agrandar el área de juego.
  const VERTICAL_UI_SPACE_PX = isMobilePhone ? 100 : 210; 
  const HORIZONTAL_UI_SPACE_PX = isMobilePhone ? 16 : 64; 
  contentHeight -= VERTICAL_UI_SPACE_PX;
  contentWidth -= HORIZONTAL_UI_SPACE_PX;

  const tileSizeFromHeight = contentHeight / VIEWPORT_HEIGHT_TILES;
  const tileSizeFromWidth = contentWidth / VIEWPORT_WIDTH_TILES;
  
  // Se elige el tamaño de tile más pequeño y se asegura un mínimo para evitar errores.
  return Math.max(10, Math.min(tileSizeFromHeight, tileSizeFromWidth));
};


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