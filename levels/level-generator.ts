import { Position, TileType } from '../types';

/**
 * Dibuja un marco de rocas (WALL) alrededor de un grid existente.
 * La función modifica el grid que se le pasa como argumento.
 * @param grid El grid en el que se dibujará el marco.
 */
function dibujarMarco(grid: TileType[][]): void {
  if (grid.length === 0 || grid[0].length === 0) return;
  const alto = grid.length;
  const ancho = grid[0].length;
  
  for (let i = 0; i < alto; i++) {
    grid[i][0] = TileType.WALL;
    grid[i][ancho - 1] = TileType.WALL;
  }
  for (let j = 0; j < ancho; j++) {
    grid[0][j] = TileType.WALL;
    grid[alto - 1][j] = TileType.WALL;
  }
}

/**
 * Crea la estructura base de un nivel con un número específico de salas,
 * siguiendo las reglas de la "Plantilla-Niveles".
 *
 * @param numeroSalas El número de salas que tendrá el nivel.
 * @returns Una matriz 2D de TileType que representa el grid del nivel.
 */
export function crearPlantillaNivel(numeroSalas: number): TileType[][] {
  const ANCHO_SALA = 20;
  const ALTO_SALA = 14;

  const altoTotal = (ALTO_SALA * numeroSalas) + (numeroSalas - 1);
  const anchoTotal = ANCHO_SALA;

  // 1. Iniciar grid con suelo (ConstanteCero (0,0) es la esquina superior izquierda)
  const grid: TileType[][] = Array(altoTotal)
    .fill(0)
    .map(() => Array(anchoTotal).fill(TileType.FLOOR));

  // 2. Construir marco exterior de rocas
  dibujarMarco(grid);
  
  // 3. Construir divisiones de salas y Puertas-Sala
  for (let s = 1; s < numeroSalas; s++) {
    const filaDivisoria = (s * (ALTO_SALA + 1)) - 1;
    
    // Crear la pared divisoria
    for (let j = 1; j < anchoTotal - 1; j++) {
      grid[filaDivisoria][j] = TileType.WALL;
    }
    
    // Las puertas son de 2 casillas para ser compatibles con el renderizador.
    // La puerta entre la sala 3 y 2 es de tipo 1, la de 2 y 1 es de tipo 2.
    const doorType = s === (numeroSalas - 1) ? TileType.DOOR_STAGE_1 : TileType.DOOR_STAGE_2; 
    grid[filaDivisoria][9] = doorType;
    grid[filaDivisoria][10] = doorType;
  }
  
  // 4. Ubicar la Puerta-Nivel (Meta/GOAL)
  // Se ubica en la sala final (la de más arriba), en la fila 0, columna 10.
  grid[0][10] = TileType.GOAL;

  return grid;
}


// --- Pentomino Definitions ---
const PENTOMINOS = {
  F: [[1, 0], [2, 0], [0, 1], [1, 1]],
  I: [[0, 0], [1, 0], [2, 0], [3, 0]],
  L: [[0, 0], [1, 0], [2, 0], [0, 1]],
  P: [[0, 0], [1, 0], [0, 1], [1, 1]],
  N: [[1, 0], [2, 0], [0, 1], [1, 1]],
  T: [[0, 0], [1, 0], [2, 0], [1, 1]],
  U: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
  V: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
  W: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],
  X: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
  Y: [[1, 0], [0, 1], [1, 1], [1, 2], [1, 3]],
  Z: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]],
};

// --- Puzzle Generation Logic ---
type PentominoShape = number[][];

function rotate(shape: PentominoShape): PentominoShape {
  const newShape: PentominoShape = [];
  for (const p of shape) {
    newShape.push([-p[1], p[0]]);
  }
  return newShape.map(([r, c]) => [r - Math.min(...newShape.map(p => p[0])), c - Math.min(...newShape.map(p => p[1]))]);
}

function flip(shape: PentominoShape): PentominoShape {
  const newShape: PentominoShape = [];
  for (const p of shape) {
    newShape.push([-p[0], p[1]]);
  }
  return newShape.map(([r, c]) => [r - Math.min(...newShape.map(p => p[0])), c - Math.min(...newShape.map(p => p[1]))]);
}

function getTransformations(shape: PentominoShape): PentominoShape[] {
  const transformations = new Set<string>();
  let currentShape = shape;
  for (let i = 0; i < 4; i++) {
    const sortedShape = [...currentShape].sort((a,b) => a[0] - b[0] || a[1] - b[1]);
    transformations.add(JSON.stringify(sortedShape));
    const flippedShape = [...flip(currentShape)].sort((a,b) => a[0] - b[0] || a[1] - b[1]);
    transformations.add(JSON.stringify(flippedShape));
    currentShape = rotate(currentShape);
  }
  return Array.from(transformations).map(s => JSON.parse(s));
}

function floodFill(grid: TileType[][], startRow: number, startCol: number, roomBounds: { top: number, bottom: number, left: number, right: number }): number {
    if (grid[startRow][startCol] !== TileType.FLOOR) return 0;

    const queue: [number, number][] = [[startRow, startCol]];
    const visited = new Set<string>([`${startRow},${startCol}`]);
    let count = 0;

    while (queue.length > 0) {
        const [row, col] = queue.shift()!;
        count++;

        const neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of neighbors) {
            const newRow = row + dr;
            const newCol = col + dc;
            const key = `${newRow},${newCol}`;

            if (newRow >= roomBounds.top && newRow < roomBounds.bottom &&
                newCol >= roomBounds.left && newCol < roomBounds.right &&
                grid[newRow]?.[newCol] === TileType.FLOOR && !visited.has(key)) {
                visited.add(key);
                queue.push([newRow, newCol]);
            }
        }
    }
    return count;
}


/**
 * Crea un puzzle de rocas dentro de una sala específica de un nivel.
 * No colocará rocas en las posiciones excluidas.
 *
 * @param grid El grid actual del nivel a modificar.
 * @param salaIndex El índice de la sala a rellenar (0 para la primera sala, etc.).
 * @param excludedPositions Un array de posiciones que deben permanecer como FLOOR.
 * @returns El grid modificado con el puzzle de rocas.
 */
export function crearPuzzle(
  grid: TileType[][],
  salaIndex: number,
  excludedPositions: Position[] = []
): TileType[][] {
  const ANCHO_SALA = 20;
  const ALTO_SALA = 14;
  const newGrid = grid.map(row => [...row]); // Deep copy

  const salaTop = salaIndex * (ALTO_SALA + 1);
  const roomBounds = { top: salaTop + 1, bottom: salaTop + ALTO_SALA, left: 1, right: ANCHO_SALA - 1 };

  const excludedSet = new Set(excludedPositions.map(p => `${p.row},${p.col}`));

  const pentominoKeys = ['F', 'I', 'L', 'N', 'P', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const selectedKeys: string[] = [];
  while(selectedKeys.length < 4) {
      const randomKey = pentominoKeys[Math.floor(Math.random() * pentominoKeys.length)];
      if (!selectedKeys.includes(randomKey)) {
          selectedKeys.push(randomKey);
      }
  }

  let totalEmptySpaces = 0;
  for (let r = roomBounds.top; r < roomBounds.bottom; r++) {
      for (let c = roomBounds.left; c < roomBounds.right; c++) {
          if (newGrid[r][c] === TileType.FLOOR && !excludedSet.has(`${r},${c}`)) {
              totalEmptySpaces++;
          }
      }
  }

  for (const key of selectedKeys) {
      // @ts-ignore
      const baseShape = [[0, 0], ...PENTOMINOS[key]];
      const transformations = getTransformations(baseShape);
      const shape = transformations[Math.floor(Math.random() * transformations.length)];

      let placed = false;
      for (let attempts = 0; attempts < 150 && !placed; attempts++) {
          const row = roomBounds.top + Math.floor(Math.random() * (ALTO_SALA - 5));
          const col = roomBounds.left + Math.floor(Math.random() * (ANCHO_SALA - 6));

          let isValid = true;
          const pointsToPlace: {r: number, c: number}[] = [];

          for (const [dr, dc] of shape) {
            const r = row + dr;
            const c = col + dc;
            pointsToPlace.push({ r, c });

            if (r < roomBounds.top || r >= roomBounds.bottom ||
                c < roomBounds.left || c >= roomBounds.right ||
                newGrid[r]?.[c] !== TileType.FLOOR ||
                excludedSet.has(`${r},${c}`)) { // Check against excluded positions
                isValid = false;
                break;
            }
          }

          if (isValid) {
              pointsToPlace.forEach(p => newGrid[p.r][p.c] = TileType.WALL);

              let firstEmpty: {r: number, c: number} | null = null;
              for (let r = roomBounds.top; r < roomBounds.bottom; r++) {
                  for (let c = roomBounds.left; c < roomBounds.right; c++) {
                      if (newGrid[r][c] === TileType.FLOOR) {
                          firstEmpty = {r, c};
                          break;
                      }
                  }
                  if (firstEmpty) break;
              }
              
              const currentEmptySpaces = totalEmptySpaces - shape.length;
              if (firstEmpty) {
                  const reachableSpaces = floodFill(newGrid, firstEmpty.r, firstEmpty.c, roomBounds);
                  if (reachableSpaces >= currentEmptySpaces - 2) { // Allow for some unreachable spaces
                      placed = true;
                      totalEmptySpaces = currentEmptySpaces;
                  }
              } else if (currentEmptySpaces === 0) {
                  placed = true;
              }

              if (!placed) {
                  pointsToPlace.forEach(p => newGrid[p.r][p.c] = TileType.FLOOR);
              }
          }
      }
  }

  return newGrid;
}
