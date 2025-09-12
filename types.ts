export enum TileType {
  FLOOR = 'F',
  WALL = 'W',
  GOAL = 'G',
  DOOR_STAGE_1 = 'D1',
  DOOR_STAGE_2 = 'D2',
  SLOT_POS = 'SP',
  SLOT_NEG = 'SN',
  INVERTER = 'I',
  // Nuevos tipos para el Episodio 1, Nivel 4
  PLATE_ABS = 'PA',
  DOOR_ABS = 'DA',
  // Nuevos tipos para el Episodio 3
  COMPARISON_GT = 'CGT', // Mayor que >
  COMPARISON_LT = 'CLT', // Menor que <
  COMPARISON_EQ = 'CEQ', // Igual que =
  COMPARISON_SLOT_A = 'CSA',
  COMPARISON_SLOT_B = 'CSB',
  LOGIC_GATE = 'LG', // Puerta principal del nivel 3
  SECRET_CHAMBER_GATE = 'SCG', // Puerta de la cámara secreta
  DOOR_STAGE_3 = 'D3', // Puerta de progreso final de Nivel 3
  // Episodio 3, Nivel 2
  BALANCE_SLOT_A = 'BSA',
  BALANCE_SLOT_B = 'BSB',
  MOBILE_PLATFORM = 'MP',
  BALANCE_DOOR = 'BD',
  KEY = 'K',
  SCANNER_PLATE = 'SC',
  // Episodio 2, Nivel 3 - Entorno Reactivo
  EMITTER = 'EM',
  // Episodio 2, Nivel 4 - Sintetizador
  SYNTH_SLOT_A = 'SSA',
  SYNTH_SLOT_B = 'SSB',
  SYNTH_CORE = 'SCOR',
  SYNTH_OUTPUT = 'SOUT',
  // Episodio 3, Nivel 2 - Bóveda de Unidades
  DISPENSER_LAVA = 'DL',
  DISPENSER_ICE = 'DI',
  NUMERIC_DEPOSIT = 'ND',
  // Episodio 3, Nivel 3 - Calibradores Lógicos
  LOGIC_CALIBRATOR = 'LC',
  MASS_CONVERTER = 'MC',
  // Episodio 3, Nivel 4 - Ensamblador
  ASSEMBLER_PLATE = 'APL',
}

export type Position = {
  row: number;
  col: number;
};

export type CubeType = 'ice' | 'lava';

export type CubeStatus = 'active' | 'evaporating';

export interface Cube {
  id: number;
  type: CubeType;
  value: number;
  position: Position;
  status: CubeStatus;
  isMemory?: boolean;
}

export interface Prize {
  id: number;
  position: Position;
  status: 'active' | 'collected';
}

export interface Key {
  id: number;
  position: Position;
  status: 'active' | 'collected';
}

export interface InteractiveRock {
  id: number;
  path: Position[]; // The full path of the rock, from its first landing spot.
  status: 'flying' | 'landed'; // To know when it becomes a solid obstacle.
}

export interface Fireball {
  id: number;
  col: number;
  y: number; // pixel position for smooth animation
  soundPlayed?: boolean;
}

export type AssemblerGoalType = 'row_sum' | 'col_sum' | 'total_sum' | 'row_parity' | 'col_parity' | 'total_parity' | 'cube_count';
export type AssemblerCondition = 'gt' | 'lt' | 'eq' | 'even' | 'odd';

export interface AssemblerGoal {
  type: AssemblerGoalType;
  condition: AssemblerCondition;
  value: number; // For sum/count goals
  // For row/col goals, this indicates which one. 0-indexed.
  // For 'row_sum' or 'row_parity', 0 is top row, 1 is bottom.
  // For 'col_sum' or 'col_parity', it's the column index.
  index?: number;
  description: string;
}

export interface AssemblerData {
  id: string; // e.g., 'sala1', 'sala2', 'sala3'
  positions: Position[]; // All 10 plate positions
  goals: AssemblerGoal[];
  controlsDoor: 1 | 2 | 3;
}

export interface LevelData {
  grid: TileType[][];
  playerStart: Position;
  cubes: Omit<Cube, 'status'>[];
  objectives: {
    [key: number]: string;
  };
  title: string;
  shortTitle: string;
  // Propiedades opcionales para mecánicas específicas
  prizes?: Omit<Prize, 'status'>[];
  key?: Omit<Key, 'status'>;
  logicLinks?: {
    id: string;
    operator: 'gt' | 'lt' | 'eq';
    slot_a_pos: Position;
    slot_b_pos: Position;
  }[];
  absoluteLinks?: {
    value: number;
    plate_pos: Position;
    door_pos: Position[];
  }[];
  synthesizers?: {
    id: string;
    slot_a: Position;
    slot_b: Position;
    core: Position;
    output: Position;
  }[];
  numericDeposits?: {
    id: string;
    positions: Position[];
    target: number;
    controlsDoor: 1 | 2 | 3;
  }[];
  logicCalibrators?: {
    id: string;
    positions: Position[];
    operator: 'gt' | 'lt' | 'eq';
    target: number;
    controlsDoor: 1 | 2 | 3;
  }[];
  assemblers?: AssemblerData[];
  secretChamberGate?: Position;
  balancePlatforms?: { a: Position; b: Position; };
  balanceFulcrum?: Position;
  balanceDoor?: Position;
  mobilePlatform?: Position;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface EvaporationEffectData {
  id: number;
  position: Position;
}

export interface HeartbreakEffectData {
  id: number;
  position: Position;
}