import type { LevelData, Position, Cube } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel, crearPuzzle } from './level-generator';

// --- Nivel 1-1: Reconstrucción Procedural ---

// 1. Generar la estructura base del nivel con 3 salas.
const plantilla = crearPlantillaNivel(3);

// 2. Rellenar cada sala con un puzzle de rocas aleatorio.
// Se aplica la función `crearPuzzle` a cada una de las 3 salas (0=arriba, 1=medio, 2=abajo).
const grid = [0, 1, 2].reduce((currentGrid, salaIndex) => {
  // FIX: The `crearPuzzle` function is designed to work on a single room, but the entire grid was being passed.
  // This has been corrected to apply the puzzle to each room sequentially.
  return crearPuzzle(currentGrid, salaIndex);
}, plantilla);

// 3. Función para encontrar posiciones seguras (suelo) para entidades.
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

  // Barajar las posiciones para que la colocación sea aleatoria.
  for (let i = posicionesDisponibles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posicionesDisponibles[i], posicionesDisponibles[j]] = [posicionesDisponibles[j], posicionesDisponibles[i]];
  }

  return posicionesDisponibles.slice(0, cantidad);
}

// 4. Colocar al jugador en una posición segura en la sala de inicio (índice 2).
const playerStart = encontrarPosicionesSeguras(grid, 2, 1)[0] || { row: 42, col: 10 };

// 5. Definir y colocar los cubos en sus respectivas salas.
const defsCubos: { salaIndex: number, def: Omit<Cube, 'position' | 'status'> }[] = [
  // Sala 1 (abajo, salaIndex 2): 2 pares
  { salaIndex: 2, def: { id: 1, type: 'lava', value: 2 } },
  { salaIndex: 2, def: { id: 2, type: 'ice', value: -2 } },
  { salaIndex: 2, def: { id: 3, type: 'lava', value: 4 } },
  { salaIndex: 2, def: { id: 4, type: 'ice', value: -4 } },
  
  // Sala 2 (medio, salaIndex 1): 3 pares
  { salaIndex: 1, def: { id: 5, type: 'lava', value: 3 } },
  { salaIndex: 1, def: { id: 6, type: 'ice', value: -3 } },
  { salaIndex: 1, def: { id: 7, type: 'lava', value: 5 } },
  { salaIndex: 1, def: { id: 8, type: 'ice', value: -5 } },
  { salaIndex: 1, def: { id: 9, type: 'lava', value: 1 } },
  { salaIndex: 1, def: { id: 10, type: 'ice', value: -1 } },
  
  // Sala 3 (arriba, salaIndex 0): 5 pares
  { salaIndex: 0, def: { id: 11, type: 'ice', value: -6 } },
  { salaIndex: 0, def: { id: 12, type: 'lava', value: 6 } },
  { salaIndex: 0, def: { id: 13, type: 'ice', value: -7 } },
  { salaIndex: 0, def: { id: 14, type: 'lava', value: 7 } },
  { salaIndex: 0, def: { id: 15, type: 'ice', value: -8 } },
  { salaIndex: 0, def: { id: 16, type: 'lava', value: 8 } },
  { salaIndex: 0, def: { id: 17, type: 'ice', value: -9 } },
  { salaIndex: 0, def: { id: 18, type: 'lava', value: 9 } },
  { salaIndex: 0, def: { id: 19, type: 'ice', value: -10 } },
  { salaIndex: 0, def: { id: 20, type: 'lava', value: 10 } },
];

const cubes = defsCubos.reduce((acc, { salaIndex, def }) => {
  const ocupadas = [playerStart, ...acc.map(c => c.position)];
  const posicion = encontrarPosicionesSeguras(grid, salaIndex, 1, ocupadas)[0];
  // Fallback por si no se encuentra un lugar (improbable).
  const posicionSegura = posicion || { row: salaIndex * 15 + 3, col: 3 + def.id }; 
  acc.push({ ...def, position: posicionSegura });
  return acc;
}, [] as Omit<Cube, 'status'>[]);

// 6. Exportar la configuración final del nivel.
export const LEVEL_1_1: LevelData = {
  title: "Episodio 1: La Cuna de ZETA",
  shortTitle: "E1 - Nivel 1",
  grid,
  playerStart,
  cubes,
  objectives: {
    1: "OBJETIVO: Despeja los pares [+2/-2] y [+4/-4] para abrir la primera puerta.",
    2: "OBJETIVO: Neutraliza los pares [+3/-3], [+5/-5] y [+1/-1] para desbloquear el siguiente sector.",
    3: "OBJETIVO: ¡Desafío final! Elimina los 5 pares restantes y alcanza la meta.",
  },
};
