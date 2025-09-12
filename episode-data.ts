import { LEVELS } from './levels';

export interface Episode {
  name: string;
  shortName: string;
  startLevelIndex: number;
  levelCount: number;
  color: 'blue' | 'green' | 'red' | 'gray' | 'purple';
}

export const EPISODES: Episode[] = [
  {
    name: 'Episodio 1: La Cuna de ZETA',
    shortName: 'Episodio 1',
    startLevelIndex: 0,
    levelCount: 4,
    color: 'blue',
  },
  {
    name: 'Episodio 2: La Recta Numérica',
    shortName: 'Episodio 2',
    startLevelIndex: 4,
    levelCount: 4,
    color: 'green',
  },
  {
    name: 'Episodio 3: Puzzles de Lógica',
    shortName: 'Episodio 3',
    startLevelIndex: 8,
    levelCount: 4,
    color: 'red',
  },
];

// Helper function to find episode info for a given level index
export function getEpisodeForLevel(levelIndex: number): Episode | undefined {
    return EPISODES.find(ep => levelIndex >= ep.startLevelIndex && levelIndex < ep.startLevelIndex + ep.levelCount);
}

// Helper function to find the next level index, handling episode transitions
export function getNextLevelIndex(currentLevelIndex: number): number | null {
    const currentEpisode = getEpisodeForLevel(currentLevelIndex);
    if (!currentEpisode) return null;

    const lastLevelOfCurrentEpisode = currentEpisode.startLevelIndex + currentEpisode.levelCount - 1;

    // If it's not the last level of the episode, just increment
    if (currentLevelIndex < lastLevelOfCurrentEpisode) {
        return currentLevelIndex + 1;
    }

    // If it is the last level, find the next episode
    const currentEpisodeIndex = EPISODES.findIndex(ep => ep.startLevelIndex === currentEpisode.startLevelIndex);
    const nextEpisode = EPISODES[currentEpisodeIndex + 1];

    if (nextEpisode) {
        return nextEpisode.startLevelIndex;
    }

    // This is the last level of the last episode
    return null;
}
