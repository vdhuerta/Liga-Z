
import type { LevelData, Position, Cube } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel, crearPuzzle } from './level-generator';

// --- Nivel 1-2: El Dilema de los Gemelos (Reforzado) ---

// 1. Generar la estructura base del nivel con 3 salas.
const plantilla = crearPlantillaNivel(3);

// 2. Rellenar cada sala con un puzzle de rocas aleatorio.
const gridConPuzzle = [0, 1, 2].reduce((currentGrid, salaIndex) => {
  return crearPuzzle(currentGrid, salaIndex);
}, plantilla);

// 3. Función para encontrar posiciones seguras.
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

// 4. Colocar entidades y crear el grid final.
let posicionesOcupadas: Position[] = [];
const grid = gridConPuzzle.map(row => [...row]); // Clonar para modificar.

// Jugador en la sala de inicio (índice 2).
const playerStart = encontrarPosicionesSeguras(grid, 2, 1, posicionesOcupadas)[0] || { row: 42, col: 10 };
posicionesOcupadas.push(playerStart);

// Máquina Inversora en la sala 2 (índice 1).
const posInversorSala2 = encontrarPosicionesSeguras(grid, 1, 1, posicionesOcupadas)[0] || { row: 22, col: 10 };
posicionesOcupadas.push(posInversorSala2);
grid[posInversorSala2.row][posInversorSala2.col] = TileType.INVERTER;

// Máquina Inversora en la sala 3 (índice 0).
const posInversorSala3 = encontrarPosicionesSeguras(grid, 0, 1, posicionesOcupadas)[0] || { row: 7, col: 10 };
posicionesOcupadas.push(posInversorSala3);
grid[posInversorSala3.row][posInversorSala3.col] = TileType.INVERTER;


// 5. Definir y colocar los cubos.
const defsCubos: { salaIndex: number, def: Omit<Cube, 'position' | 'status'> }[] = [
  // Sala 1 (abajo, salaIndex 2): 1 par simple para empezar
  { salaIndex: 2, def: { id: 11, type: 'lava', value: 2 } },
  { salaIndex: 2, def: { id: 12, type: 'ice', value: -2 } },
  
  // Sala 2 (medio, salaIndex 1): 2 pares de gemelos + Inversora
  { salaIndex: 1, def: { id: 13, type: 'lava', value: 3 } },
  { salaIndex: 1, def: { id: 14, type: 'lava', value: 3 } },
  { salaIndex: 1, def: { id: 15, type: 'ice', value: -5 } },
  { salaIndex: 1, def: { id: 16, type: 'ice', value: -5 } },

  // Sala 3 (arriba, salaIndex 0): 4 pares de gemelos + Inversora
  { salaIndex: 0, def: { id: 17, type: 'lava', value: 6 } },
  { salaIndex: 0, def: { id: 18, type: 'lava', value: 6 } },
  { salaIndex: 0, def: { id: 19, type: 'ice', value: -7 } },
  { salaIndex: 0, def: { id: 20, type: 'ice', value: -7 } },
  { salaIndex: 0, def: { id: 21, type: 'lava', value: 8 } },
  { salaIndex: 0, def: { id: 22, type: 'lava', value: 8 } },
  { salaIndex: 0, def: { id: 23, type: 'ice', value: -9 } },
  { salaIndex: 0, def: { id: 24, type: 'ice', value: -9 } },
];

const cubes = defsCubos.reduce((acc, { salaIndex, def }) => {
  const posicion = encontrarPosicionesSeguras(grid, salaIndex, 1, posicionesOcupadas)[0];
  const posicionSegura = posicion || { row: salaIndex * 15 + 3, col: 3 + acc.length }; 
  
  posicionesOcupadas.push(posicionSegura);
  
  acc.push({ ...def, position: posicionSegura });
  return acc;
}, [] as Omit<Cube, 'status'>[]);

// 6. Exportar la configuración final del nivel.
export const LEVEL_1_2: LevelData = {
  title: "Episodio 1: El Dilema de los Gemelos",
  shortTitle: "E1 - Nivel 2",
  grid,
  playerStart,
  cubes,
  objectives: {
    1: "OBJETIVO: Despeja el par inicial para abrir la primera puerta.",
    2: "OBJETIVO: Usa la Inversora para neutralizar los 2 pares de gemelos.",
    3: "OBJETIVO: ¡Demuestra tu maestría! Usa la Inversora con los 4 pares de gemelos y alcanza la meta.",
  },
};
