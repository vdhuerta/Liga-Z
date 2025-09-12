import type { LevelData, Position } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel, crearPuzzle } from './level-generator';

const { WALL, FLOOR, INVERTER } = TileType;

// --- Nivel 1-3: El Cruce Invertido (Reconstrucción Procedural) ---

// 1. Generar la estructura base del nivel con 3 salas.
let grid = crearPlantillaNivel(3);

// 2. Aplicar un puzzle procedural a la Sala 1 (abajo, índice 2).
grid = crearPuzzle(grid, 2);


// 3. Reconstruir manualmente las cámaras de inversores en la Sala 2 (medio).
const sala2Top = 15;
const chamberTopRow = sala2Top + 4; // Fila 19

// --- Cámara Izquierda ---
const leftChamber = {
  wallTop: chamberTopRow,
  wallBottom: chamberTopRow + 5, // Fila 24
  wallLeft: 2,
  wallRight: 7,
};
// Paredes horizontales
for (let c = leftChamber.wallLeft; c <= leftChamber.wallRight; c++) {
  grid[leftChamber.wallTop][c] = WALL;
  grid[leftChamber.wallBottom][c] = WALL;
}
// Paredes verticales
for (let r = leftChamber.wallTop + 1; r < leftChamber.wallBottom; r++) {
  grid[r][leftChamber.wallLeft] = WALL;
  grid[r][leftChamber.wallRight] = WALL;
}
// Entrada e Inversor (Izquierda)
grid[chamberTopRow + 1][3] = FLOOR;
grid[leftChamber.wallBottom][4] = INVERTER;

// --- Cámara Derecha ---
const rightChamber = {
  wallTop: chamberTopRow,
  wallBottom: chamberTopRow + 5, // Fila 24
  wallLeft: 12,
  wallRight: 17,
};
// Paredes horizontales
for (let c = rightChamber.wallLeft; c <= rightChamber.wallRight; c++) {
  grid[rightChamber.wallTop][c] = WALL;
  grid[rightChamber.wallBottom][c] = WALL;
}
// Paredes verticales
for (let r = rightChamber.wallTop + 1; r < rightChamber.wallBottom; r++) {
  grid[r][rightChamber.wallLeft] = WALL;
  grid[r][rightChamber.wallRight] = WALL;
}
// Entrada e Inversor (Derecha)
grid[chamberTopRow + 2][rightChamber.wallLeft + 1] = FLOOR;
grid[chamberTopRow + 2][rightChamber.wallLeft] = INVERTER;

// 4. Implementar "El Sacrificio Necesario" en la Sala 3 (arriba).
const sala3Top = 0;
// Crear un pasillo estrecho en el centro.
for (let r = sala3Top + 4; r <= sala3Top + 10; r++) {
    grid[r][9] = WALL;
    grid[r][11] = WALL;
}
// Colocar el Inversor al final del pasillo.
grid[sala3Top + 2][10] = INVERTER;

// 5. Función para encontrar posiciones seguras.
function encontrarPosicionesSeguras(
  currentGrid: TileType[][],
  salaIndex: number,
  cantidad: number,
  ocupadas: Position[] = []
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
      if (currentGrid[r][c] === TileType.FLOOR && !setOcupadas.has(`${r},${c}`)) {
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

// 6. Reposicionar jugador y cubos de la Sala 1.
const playerStart = encontrarPosicionesSeguras(grid, 2, 1)[0] || { row: 42, col: 10 };
let posicionesOcupadas = [playerStart];

const posCubo21 = encontrarPosicionesSeguras(grid, 2, 1, posicionesOcupadas)[0] || { row: 40, col: 4 };
posicionesOcupadas.push(posCubo21);
const posCubo22 = encontrarPosicionesSeguras(grid, 2, 1, posicionesOcupadas)[0] || { row: 40, col: 15 };

// 7. Exportar la configuración final del nivel.
export const LEVEL_1_3: LevelData = {
  title: "Episodio 1: El Cruce Invertido",
  shortTitle: "E1 - Nivel 3",
  grid,
  playerStart,
  cubes: [
    // Etapa 1 (Sala 1 - Abajo)
    { id: 21, type: 'lava', value: 4, position: posCubo21 },
    { id: 22, type: 'ice', value: -4, position: posCubo22 },
    
    // Etapa 2 - Cámaras
    { id: 23, type: 'lava', value: 3, position: { row: 20, col: 5 } },
    { id: 24, type: 'lava', value: 5, position: { row: 22, col: 4 } },
    { id: 25, type: 'lava', value: 7, position: { row: 23, col: 6 } },
    
    { id: 26, type: 'ice', value: -3, position: { row: 20, col: 15 } },
    { id: 27, type: 'ice', value: -5, position: { row: 22, col: 14 } },
    { id: 28, type: 'ice', value: -7, position: { row: 23, col: 16 } },

    // Etapa 3 - Sala del Sacrificio
    // Puzzle principal
    { id: 29, type: 'lava', value: 9, position: { row: 12, col: 5 } },
    { id: 30, type: 'lava', value: 9, position: { row: 12, col: 15 } },
    // Puzzle de "sacrificio" que bloquea el pasillo
    { id: 31, type: 'lava', value: 2, position: { row: 8, col: 10 } },
    { id: 32, type: 'ice', value: -2, position: { row: 7, col: 10 } },
  ],
  objectives: {
    1: "OBJETIVO: Despeja el par inicial para acceder a las cámaras de prueba.",
    2: "OBJETIVO: Usa las Máquinas Inversoras para crear los pares opuestos y despejar ambas cámaras.",
    3: "OBJETIVO: Despeja el pasillo para acceder al Inversor y resolver el puzzle final.",
  },
};