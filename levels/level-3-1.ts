import type { LevelData, Position, Cube } from '../types';
import { TileType } from '../types';
import { crearPlantillaNivel, crearPuzzle } from './level-generator';

const {
  WALL, FLOOR, COMPARISON_GT, COMPARISON_LT, COMPARISON_EQ,
  COMPARISON_SLOT_A, COMPARISON_SLOT_B, SECRET_CHAMBER_GATE, EMITTER
} = TileType;

// 1. Crear la estructura base del nivel.
let grid = crearPlantillaNivel(3);

// 2. Definir posiciones para TODOS los elementos estáticos.
// Sala 1 (Abajo, index 2)
const station_S1_Eq_core = { row: 37, col: 10 };
const emitters_S1 = [{ row: 37, col: 0 }, { row: 37, col: 19 }];

// Sala 2 (Medio, index 1)
const chamberTop = 15 + 3; // Fila 18
const chamberBottom = 15 + 8; // Fila 23
const chamberLeft = 1;
const chamberRight = 5;
const gatePos = { row: chamberTop + 2, col: chamberRight }; // Fila 20, col 5
const station_S2_Lt_core = { row: 22, col: 7 };
const station_S2_Gt_core = { row: 22, col: 14 };
const emitters_S2 = [{ row: 22, col: 0 }, { row: 22, col: 19 }];

// Sala 3 (Arriba, index 0)
const station_S3_Eq_core = { row: 7, col: 4 };
const station_S3_Lt_core = { row: 7, col: 10 };
const station_S3_Gt_core = { row: 7, col: 16 };
const emitters_S3 = [{ row: 7, col: 0 }, { row: 7, col: 19 }];

// 3. Generar puzzles de rocas con exclusiones para cada sala.
const getStationExclusions = (core: Position): Position[] => [
    { row: core.row, col: core.col - 1 }, core, { row: core.row, col: core.col + 1 },
    { row: core.row - 1, col: core.col - 1 }, { row: core.row - 1, col: core.col }, { row: core.row - 1, col: core.col + 1 },
    { row: core.row + 1, col: core.col - 1 }, { row: core.row + 1, col: core.col }, { row: core.row + 1, col: core.col + 1 },
];
const getEmitterExclusions = (emitters: Position[]): Position[] => emitters.flatMap(e => [e, {row: e.row, col: e.col === 0 ? 1 : 18}]);

// Exclusiones y generación de puzzles por sala
const exclusionsSala1 = [...getStationExclusions(station_S1_Eq_core), ...getEmitterExclusions(emitters_S1)];
grid = crearPuzzle(grid, 2, exclusionsSala1);

const chamberExclusions: Position[] = [];
for (let r = chamberTop; r <= chamberBottom; r++) { for (let c = chamberLeft; c <= chamberRight; c++) { chamberExclusions.push({ row: r, col: c }); } }
chamberExclusions.push({row: 20, col: 6}); // Espacio de acceso a la puerta
const exclusionsSala2 = [ ...chamberExclusions, ...getStationExclusions(station_S2_Lt_core), ...getStationExclusions(station_S2_Gt_core), ...getEmitterExclusions(emitters_S2) ];
grid = crearPuzzle(grid, 1, exclusionsSala2);

const exclusionsSala3 = [ ...getStationExclusions(station_S3_Eq_core), ...getStationExclusions(station_S3_Lt_core), ...getStationExclusions(station_S3_Gt_core), ...getEmitterExclusions(emitters_S3) ];
grid = crearPuzzle(grid, 0, exclusionsSala3);

// 4. Colocar todos los elementos estáticos en el grid.
function placeComparisonStation(g: TileType[][], core: Position, operator: TileType): { slot_a: Position, slot_b: Position } {
    g[core.row][core.col - 1] = COMPARISON_SLOT_A;
    g[core.row][core.col] = operator;
    g[core.row][core.col + 1] = COMPARISON_SLOT_B;
    return { slot_a: { row: core.row, col: core.col - 1 }, slot_b: { row: core.row, col: core.col + 1 } };
}
// Colocar estaciones
const station_S1_Eq = placeComparisonStation(grid, station_S1_Eq_core, COMPARISON_EQ);
const station_S2_Lt = placeComparisonStation(grid, station_S2_Lt_core, COMPARISON_LT);
const station_S2_Gt = placeComparisonStation(grid, station_S2_Gt_core, COMPARISON_GT);
const station_S3_Eq = placeComparisonStation(grid, station_S3_Eq_core, COMPARISON_EQ);
const station_S3_Lt = placeComparisonStation(grid, station_S3_Lt_core, COMPARISON_LT);
const station_S3_Gt = placeComparisonStation(grid, station_S3_Gt_core, COMPARISON_GT);

// Colocar emisores
[...emitters_S1, ...emitters_S2, ...emitters_S3].forEach(e => grid[e.row][e.col] = EMITTER);

// Colocar cámara secreta
for (let r = chamberTop; r <= chamberBottom; r++) { for (let c = chamberLeft; c <= chamberRight; c++) { if (r === chamberTop || r === chamberBottom || c === chamberLeft || c === chamberRight) { grid[r][c] = WALL; } } }
grid[gatePos.row][gatePos.col] = SECRET_CHAMBER_GATE;
grid[gatePos.row - 1][gatePos.col] = WALL;
grid[gatePos.row + 1][gatePos.col] = WALL;

// 5. Definir logicLinks.
const logicLinks = [
    { id: 's1_eq', operator: 'eq' as const, slot_a_pos: station_S1_Eq.slot_a, slot_b_pos: station_S1_Eq.slot_b },
    { id: 's2_lt', operator: 'lt' as const, slot_a_pos: station_S2_Lt.slot_a, slot_b_pos: station_S2_Lt.slot_b },
    { id: 's2_gt', operator: 'gt' as const, slot_a_pos: station_S2_Gt.slot_a, slot_b_pos: station_S2_Gt.slot_b },
    { id: 's3_eq', operator: 'eq' as const, slot_a_pos: station_S3_Eq.slot_a, slot_b_pos: station_S3_Eq.slot_b },
    { id: 's3_lt', operator: 'lt' as const, slot_a_pos: station_S3_Lt.slot_a, slot_b_pos: station_S3_Lt.slot_b },
    { id: 's3_gt', operator: 'gt' as const, slot_a_pos: station_S3_Gt.slot_a, slot_b_pos: station_S3_Gt.slot_b },
];

// 6. Función para encontrar posiciones seguras.
function encontrarPosicionesSeguras(
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
      if (grid[r][c] === TileType.FLOOR && !setOcupadas.has(`${r},${c}`)) {
        posicionesDisponibles.push({ row: r, col: c });
      }
    }
  }

  for (let i = posicionesDisponibles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posicionesDisponibles[i], posicionesDisponibles[j]] = [posicionesDisponibles[j], posicionesDisponibles[i]];
  }
  return posicionesDisponibles.slice(0, cantidad);
}

// 7. Colocar jugador, cubos y premios.
const playerStart = { row: 42, col: 10 };
let posicionesOcupadas = [playerStart];
const cubes: Omit<Cube, 'status'>[] = [];

// Cubos Sala 1 (2 cubos)
const cubesS1Pos = encontrarPosicionesSeguras(2, 2, posicionesOcupadas);
cubes.push({ id: 301, type: 'lava', value: 3, position: cubesS1Pos[0] || {row: 32, col: 5} });
cubes.push({ id: 302, type: 'lava', value: 3, position: cubesS1Pos[1] || {row: 32, col: 15} });
posicionesOcupadas.push(...cubesS1Pos);

// Cubos Sala 2 (4 cubos)
const cubesS2Pos = encontrarPosicionesSeguras(1, 4, posicionesOcupadas);
cubes.push({ id: 303, type: 'ice', value: -4, position: cubesS2Pos[0] || {row: 17, col: 3} });
cubes.push({ id: 304, type: 'lava', value: 1, position: cubesS2Pos[1] || {row: 17, col: 8} });
cubes.push({ id: 305, type: 'lava', value: 8, position: cubesS2Pos[2] || {row: 17, col: 12} });
cubes.push({ id: 306, type: 'ice', value: -2, position: cubesS2Pos[3] || {row: 17, col: 17} });
posicionesOcupadas.push(...cubesS2Pos);

// Cubos Sala 3 (6 cubos)
const cubesS3Pos = encontrarPosicionesSeguras(0, 6, posicionesOcupadas);
cubes.push({ id: 307, type: 'lava', value: 5, position: cubesS3Pos[0] || {row: 2, col: 2} });
cubes.push({ id: 308, type: 'lava', value: 5, position: cubesS3Pos[1] || {row: 2, col: 6} });
cubes.push({ id: 309, type: 'ice', value: -7, position: cubesS3Pos[2] || {row: 2, col: 9} });
cubes.push({ id: 310, type: 'ice', value: -6, position: cubesS3Pos[3] || {row: 2, col: 11} });
cubes.push({ id: 311, type: 'lava', value: 9, position: cubesS3Pos[4] || {row: 2, col: 15} });
cubes.push({ id: 312, type: 'ice', value: -9, position: cubesS3Pos[5] || {row: 2, col: 18} });


const prizes = [
    { id: 401, position: { row: chamberTop + 1, col: chamberLeft + 1 } },
    { id: 402, position: { row: chamberTop + 2, col: chamberLeft + 2 } },
    { id: 403, position: { row: chamberBottom - 1, col: chamberLeft + 1 } },
];

// 8. Exportar los datos del nivel.
export const LEVEL_3_1: LevelData = {
  title: "Episodio 3: El Laboratorio del Orden",
  shortTitle: "E3 - Nivel 1",
  grid,
  playerStart,
  cubes,
  prizes,
  logicLinks,
  secretChamberGate: gatePos,
  objectives: {
    1: "OBJETIVO: Resuelve el acertijo (=) para abrir la primera puerta.",
    2: "OBJETIVO: ¡Cuidado con las rocas! Resuelve los acertijos (< y >) para avanzar y abrir la cámara secreta.",
    3: "OBJETIVO: Resuelve los tres acertijos finales para alcanzar la meta.",
  },
};