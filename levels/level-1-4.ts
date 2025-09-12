import type { LevelData, Position } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel, crearPuzzle } from './level-generator';

// Helper function to find safe (floor) positions for entities.
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

  // Shuffle available positions for random placement.
  for (let i = posicionesDisponibles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posicionesDisponibles[i], posicionesDisponibles[j]] = [posicionesDisponibles[j], posicionesDisponibles[i]];
  }

  return posicionesDisponibles.slice(0, cantidad);
}

// 1. Generate the base level structure with 3 rooms.
let grid = crearPlantillaNivel(3);

// 2. Change generated doors to Absolute Value doors.
const door1Pos = [{ row: 29, col: 9 }, { row: 29, col: 10 }];
grid[door1Pos[0].row][door1Pos[0].col] = TileType.DOOR_ABS;
grid[door1Pos[1].row][door1Pos[1].col] = TileType.DOOR_ABS;

const door2Pos = [{ row: 14, col: 9 }, { row: 14, col: 10 }];
grid[door2Pos[0].row][door2Pos[0].col] = TileType.DOOR_ABS;
grid[door2Pos[1].row][door2Pos[1].col] = TileType.DOOR_ABS;

// 3. Add a third Absolute Value door to protect the goal.
const door3Pos = [{ row: 1, col: 9 }, { row: 1, col: 10 }];
grid[door3Pos[0].row][door3Pos[0].col] = TileType.DOOR_ABS;
grid[door3Pos[1].row][door3Pos[1].col] = TileType.DOOR_ABS;
// Also add walls around it to make it a proper gate
grid[1][8] = TileType.WALL;
grid[1][11] = TileType.WALL;

// 4. Fill each room with a random rock puzzle.
grid = crearPuzzle(grid, 0); // Top room
grid = crearPuzzle(grid, 1); // Middle room
grid = crearPuzzle(grid, 2); // Bottom room

let posicionesOcupadas: Position[] = [];

// 5. Place entities for Room 1 (Bottom, salaIndex 2)
const playerStart = encontrarPosicionesSeguras(grid, 2, 1, posicionesOcupadas)[0] || { row: 42, col: 10 };
posicionesOcupadas.push(playerStart);

const plate1Pos = encontrarPosicionesSeguras(grid, 2, 1, posicionesOcupadas)[0] || { row: 35, col: 10 };
grid[plate1Pos.row][plate1Pos.col] = TileType.PLATE_ABS;
posicionesOcupadas.push(plate1Pos);

const cube_p1_1_pos = encontrarPosicionesSeguras(grid, 2, 1, posicionesOcupadas)[0] || { row: 40, col: 5 };
posicionesOcupadas.push(cube_p1_1_pos);
const cube_p1_2_pos = encontrarPosicionesSeguras(grid, 2, 1, posicionesOcupadas)[0] || { row: 40, col: 15 };
posicionesOcupadas.push(cube_p1_2_pos);

// 6. Place entities for Room 2 (Middle, salaIndex 1)
const plate2_A_Pos = encontrarPosicionesSeguras(grid, 1, 1, posicionesOcupadas)[0] || { row: 22, col: 5 };
grid[plate2_A_Pos.row][plate2_A_Pos.col] = TileType.PLATE_ABS;
posicionesOcupadas.push(plate2_A_Pos);

const plate2_B_Pos = encontrarPosicionesSeguras(grid, 1, 1, posicionesOcupadas)[0] || { row: 22, col: 15 };
grid[plate2_B_Pos.row][plate2_B_Pos.col] = TileType.PLATE_ABS;
posicionesOcupadas.push(plate2_B_Pos);

const cube_p2_1_pos = encontrarPosicionesSeguras(grid, 1, 1, posicionesOcupadas)[0] || { row: 18, col: 3 };
posicionesOcupadas.push(cube_p2_1_pos);
const cube_p2_2_pos = encontrarPosicionesSeguras(grid, 1, 1, posicionesOcupadas)[0] || { row: 18, col: 8 };
posicionesOcupadas.push(cube_p2_2_pos);
const cube_p2_3_pos = encontrarPosicionesSeguras(grid, 1, 1, posicionesOcupadas)[0] || { row: 18, col: 12 };
posicionesOcupadas.push(cube_p2_3_pos);
const cube_p2_4_pos = encontrarPosicionesSeguras(grid, 1, 1, posicionesOcupadas)[0] || { row: 18, col: 17 };
posicionesOcupadas.push(cube_p2_4_pos);

// 7. Place entities for Room 3 (Top, salaIndex 0)
const plate3_A_Pos = encontrarPosicionesSeguras(grid, 0, 1, posicionesOcupadas)[0] || { row: 7, col: 3 };
grid[plate3_A_Pos.row][plate3_A_Pos.col] = TileType.PLATE_ABS;
posicionesOcupadas.push(plate3_A_Pos);

const plate3_B_Pos = encontrarPosicionesSeguras(grid, 0, 1, posicionesOcupadas)[0] || { row: 7, col: 10 };
grid[plate3_B_Pos.row][plate3_B_Pos.col] = TileType.PLATE_ABS;
posicionesOcupadas.push(plate3_B_Pos);

const plate3_C_Pos = encontrarPosicionesSeguras(grid, 0, 1, posicionesOcupadas)[0] || { row: 7, col: 17 };
grid[plate3_C_Pos.row][plate3_C_Pos.col] = TileType.PLATE_ABS;
posicionesOcupadas.push(plate3_C_Pos);

const cube_p3_1_pos = encontrarPosicionesSeguras(grid, 0, 1, posicionesOcupadas)[0] || { row: 12, col: 2 };
posicionesOcupadas.push(cube_p3_1_pos);
const cube_p3_2_pos = encontrarPosicionesSeguras(grid, 0, 1, posicionesOcupadas)[0] || { row: 12, col: 5 };
posicionesOcupadas.push(cube_p3_2_pos);
const cube_p3_3_pos = encontrarPosicionesSeguras(grid, 0, 1, posicionesOcupadas)[0] || { row: 12, col: 8 };
posicionesOcupadas.push(cube_p3_3_pos);
const cube_p3_4_pos = encontrarPosicionesSeguras(grid, 0, 1, posicionesOcupadas)[0] || { row: 12, col: 11 };
posicionesOcupadas.push(cube_p3_4_pos);
const cube_p3_5_pos = encontrarPosicionesSeguras(grid, 0, 1, posicionesOcupadas)[0] || { row: 12, col: 14 };
posicionesOcupadas.push(cube_p3_5_pos);
const cube_p3_6_pos = encontrarPosicionesSeguras(grid, 0, 1, posicionesOcupadas)[0] || { row: 12, col: 17 };
posicionesOcupadas.push(cube_p3_6_pos);


// 8. Export the final level data.
export const LEVEL_1_4: LevelData = {
  title: "Episodio 1: La Presión Absoluta",
  shortTitle: "E1 - Nivel 4",
  grid,
  playerStart,
  cubes: [
    // Room 1 Cubes
    { id: 401, type: 'lava', value: 2, position: cube_p1_1_pos },
    { id: 402, type: 'ice', value: -2, position: cube_p1_2_pos },
    // Room 2 Cubes
    { id: 403, type: 'lava', value: 4, position: cube_p2_1_pos },
    { id: 404, type: 'ice', value: -4, position: cube_p2_2_pos },
    { id: 405, type: 'lava', value: 6, position: cube_p2_3_pos },
    { id: 406, type: 'ice', value: -6, position: cube_p2_4_pos },
    // Room 3 Cubes
    { id: 407, type: 'lava', value: 1, position: cube_p3_1_pos },
    { id: 408, type: 'ice', value: -1, position: cube_p3_2_pos },
    { id: 409, type: 'lava', value: 3, position: cube_p3_3_pos },
    { id: 410, type: 'ice', value: -3, position: cube_p3_4_pos },
    { id: 411, type: 'lava', value: 5, position: cube_p3_5_pos },
    { id: 412, type: 'ice', value: -5, position: cube_p3_6_pos },
  ],
  absoluteLinks: [
    // Room 1 -> Door 1
    { value: 2, plate_pos: plate1Pos, door_pos: door1Pos },
    // Room 2 -> Door 2
    { value: 4, plate_pos: plate2_A_Pos, door_pos: door2Pos },
    { value: 6, plate_pos: plate2_B_Pos, door_pos: door2Pos },
    // Room 3 -> Door 3 (Goal)
    { value: 1, plate_pos: plate3_A_Pos, door_pos: door3Pos },
    { value: 3, plate_pos: plate3_B_Pos, door_pos: door3Pos },
    { value: 5, plate_pos: plate3_C_Pos, door_pos: door3Pos },
  ],
  objectives: {
    1: "OBJETIVO: Usa un cubo de valor |2| para abrir la primera puerta.",
    2: "OBJETIVO: Activa AMBAS placas con |4| y |6| para proceder.",
    3: "OBJETIVO: ¡Desafío final! Activa las TRES placas para alcanzar la meta.",
  },
};