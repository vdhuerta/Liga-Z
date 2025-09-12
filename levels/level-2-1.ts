import type { LevelData, Cube, Position } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel, crearPuzzle } from './level-generator';

const { SLOT_NEG, SLOT_POS, FLOOR } = TileType;

// --- Nivel 2-1: La Recta Numérica Centrada y Progresiva ---

// 1. Generar la estructura base del nivel con 3 salas.
let grid = crearPlantillaNivel(3);

// 2. Rellenar CADA sala con un puzzle de rocas aleatorio ANTES de colocar la recta.
grid = crearPuzzle(grid, 0); // Sala de arriba
grid = crearPuzzle(grid, 1); // Sala del medio
grid = crearPuzzle(grid, 2); // Sala de abajo

// 3. Función para despejar un área y colocar las rectas numéricas CENTRADAS.
function crearRectaNumericaCentrada(
  g: TileType[][],
  salaIndex: number,
  pares: number
): { centroY: number; centroX: number } {
  const ALTO_SALA = 14;
  const ANCHO_SALA = 20;
  const centroY = (salaIndex * (ALTO_SALA + 1)) + Math.floor(ALTO_SALA / 2); // Correct calculation
  const centroX = Math.floor(ANCHO_SALA / 2);

  const anchoTotal = (pares * 2) + 1; // 2 casillas por par + cero
  const startX = centroX - pares;

  // Despejar el área para la recta numérica
  for (let c = startX; c < startX + anchoTotal; c++) {
    if (g[centroY]?.[c]) {
        g[centroY][c] = FLOOR;
    }
  }
  
  // Colocar casillas
  for (let i = 0; i < pares; i++) {
    g[centroY][startX + i] = SLOT_NEG; // Negativos a la izquierda
    g[centroY][startX + pares + 1 + i] = SLOT_POS; // Positivos a la derecha
  }
  
  return { centroY, centroX };
}

// Crear las rectas con dificultad progresiva y guardar sus centros
const centroSala1 = crearRectaNumericaCentrada(grid, 2, 1); // Sala 1 (abajo): 1 par -> Fila 37
const centroSala2 = crearRectaNumericaCentrada(grid, 1, 2); // Sala 2 (medio): 2 pares -> Fila 22
const centroSala3 = crearRectaNumericaCentrada(grid, 0, 3); // Sala 3 (arriba): 3 pares -> Fila 7

// 4. Función para encontrar posiciones seguras para los cubos (evitando la recta).
function encontrarPosicionesSeguras(
  salaIndex: number,
  cantidad: number,
  ocupadas: Position[] = [],
  filaExcluida: number
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
    if (r === filaExcluida) continue; // No colocar cubos en la fila de la recta
    for (let c = limites.left; c < limites.right; c++) {
      if (grid[r][c] === TileType.FLOOR && !setOcupadas.has(`${r},${c}`)) {
        posicionesDisponibles.push({ row: r, col: c });
      }
    }
  }

  // Barajar
  for (let i = posicionesDisponibles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posicionesDisponibles[i], posicionesDisponibles[j]] = [posicionesDisponibles[j], posicionesDisponibles[i]];
  }

  return posicionesDisponibles.slice(0, cantidad);
}

// 5. Definir y colocar los cubos.
const playerStart = { row: 42, col: 10 };
let posicionesOcupadas = [playerStart];
const cubos: Omit<Cube, 'status'>[] = [];

// Sala 1 (abajo)
const cubosSala1 = [{ id: 101, type: 'ice', value: -1 }, { id: 102, type: 'lava', value: 1 }] as const;
const posSala1 = encontrarPosicionesSeguras(2, cubosSala1.length, posicionesOcupadas, centroSala1.centroY);
cubosSala1.forEach((c, i) => cubos.push({ ...c, position: posSala1[i] || {row: 35, col: 5+i*5} }));
posicionesOcupadas.push(...posSala1);
cubos.push({ id: 100, type: 'ice', value: 0, position: { row: centroSala1.centroY, col: centroSala1.centroX } }); // CERO fijo en Fila 37

// Sala 2 (medio)
const cubosSala2 = [
    { id: 103, type: 'ice', value: -4 }, { id: 104, type: 'ice', value: -2 },
    { id: 105, type: 'lava', value: 2 }, { id: 106, type: 'lava', value: 4 }
] as const;
const posSala2 = encontrarPosicionesSeguras(1, cubosSala2.length, posicionesOcupadas, centroSala2.centroY);
cubosSala2.forEach((c, i) => cubos.push({ ...c, position: posSala2[i] || {row: 20, col: 3+i*3} }));
posicionesOcupadas.push(...posSala2);
cubos.push({ id: 200, type: 'ice', value: 0, position: { row: centroSala2.centroY, col: centroSala2.centroX } }); // CERO fijo en Fila 22

// Sala 3 (arriba)
const cubosSala3 = [
    { id: 107, type: 'ice', value: -7 }, { id: 108, type: 'ice', value: -5 }, { id: 109, type: 'ice', value: -3 },
    { id: 110, type: 'lava', value: 3 }, { id: 111, type: 'lava', value: 5 }, { id: 112, type: 'lava', value: 7 }
] as const;
const posSala3 = encontrarPosicionesSeguras(0, cubosSala3.length, posicionesOcupadas, centroSala3.centroY);
cubosSala3.forEach((c, i) => cubos.push({ ...c, position: posSala3[i] || {row: 5, col: 2+i*2} }));
posicionesOcupadas.push(...posSala3);
cubos.push({ id: 300, type: 'ice', value: 0, position: { row: centroSala3.centroY, col: centroSala3.centroX } }); // CERO fijo en Fila 7

export const LEVEL_2_1: LevelData = {
  title: "Episodio 2: La Recta Numérica",
  shortTitle: "E2 - Nivel 1",
  grid,
  playerStart,
  cubes: cubos,
  objectives: {
    1: "OBJETIVO: El Cero es el centro. Ordena los números en las casillas correctas.",
    2: "OBJETIVO: Izquierda para negativos, derecha para positivos. ¡Ordénalos!",
    3: "OBJETIVO: ¡Demuestra tu maestría final y alcanza la meta!",
  },
};