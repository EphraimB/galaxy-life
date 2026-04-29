export interface PlanetConfig {
  id: string;
  name: string;
  gravityMultiplier: number;
  yearLengthMultiplier: number; // 1 Earth year = 1.0
  skyColor: string;
  groundColor: string;
  padColor: string;
}

export const PLANETS: Record<string, PlanetConfig> = {
  earth: {
    id: 'earth',
    name: 'Earth',
    gravityMultiplier: 1.0,
    yearLengthMultiplier: 1.0,
    skyColor: '#87CEEB',
    groundColor: '#333333', // Launch pad
    padColor: '#3b82f6',
  },
  moon: {
    id: 'moon',
    name: 'The Moon',
    gravityMultiplier: 0.166,
    yearLengthMultiplier: 13.379, // A lunar orbit (month) is ~27.3 days. 365.25 / 27.3 = 13.379 Moon "years" per Earth year
    skyColor: '#000000',
    groundColor: '#555555', // Dusty grey
    padColor: '#ffffff',
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    gravityMultiplier: 0.376,
    yearLengthMultiplier: 0.531, // 1 Mars Year = 1.88 Earth Years. So age is 1 / 1.88
    skyColor: '#c1440e', // Rusty red sky
    groundColor: '#b04325', // Rusty ground
    padColor: '#f97316',
  }
};
