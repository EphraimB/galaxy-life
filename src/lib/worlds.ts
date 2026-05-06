export type WorldType = 'space' | 'planetary_surface' | 'atmospheric';

export interface LightingConfig {
  ambientColor: string;
  ambientIntensity: number;
  directionalColor: string;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
}

export interface AtmosphereConfig {
  hasAtmosphere: boolean;
  color: string;
  density: number;
}

export interface TerrainConfig {
  groundColor: string;
  padColor: string;
}

export interface WorldDefinition {
  id: string;
  name: string;
  type: WorldType;
  skyColor: string;
  lighting: LightingConfig;
  atmosphere: AtmosphereConfig;
  terrain?: TerrainConfig;
}

export const WORLDS: Record<string, WorldDefinition> = {
  earth: {
    id: 'earth',
    name: 'Earth',
    type: 'atmospheric',
    skyColor: '#87CEEB',
    lighting: {
      ambientColor: '#ffffff',
      ambientIntensity: 0.5,
      directionalColor: '#ffffff',
      directionalIntensity: 1.5,
      directionalPosition: [100, 100, -50],
    },
    atmosphere: {
      hasAtmosphere: true,
      color: '#87CEEB',
      density: 1.0,
    },
    terrain: {
      groundColor: '#333333',
      padColor: '#3b82f6',
    }
  },
  moon: {
    id: 'moon',
    name: 'The Moon',
    type: 'planetary_surface',
    skyColor: '#000000',
    lighting: {
      ambientColor: '#ffffff',
      ambientIntensity: 0.1,
      directionalColor: '#ffffff',
      directionalIntensity: 2.0,
      directionalPosition: [50, 20, -100], // Harsh angle
    },
    atmosphere: {
      hasAtmosphere: false,
      color: '#000000',
      density: 0,
    },
    terrain: {
      groundColor: '#555555',
      padColor: '#ffffff',
    }
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    type: 'atmospheric',
    skyColor: '#c1440e',
    lighting: {
      ambientColor: '#fca5a5',
      ambientIntensity: 0.3,
      directionalColor: '#ffedd5',
      directionalIntensity: 1.5,
      directionalPosition: [80, 40, -60],
    },
    atmosphere: {
      hasAtmosphere: true,
      color: '#c1440e',
      density: 0.8,
    },
    terrain: {
      groundColor: '#b04325',
      padColor: '#f97316',
    }
  },
  space: {
    id: 'space',
    name: 'Deep Space',
    type: 'space',
    skyColor: '#000000',
    lighting: {
      ambientColor: '#ffffff',
      ambientIntensity: 0.05,
      directionalColor: '#e0f2fe',
      directionalIntensity: 1.0,
      directionalPosition: [100, 100, -100],
    },
    atmosphere: {
      hasAtmosphere: false,
      color: '#000000',
      density: 0,
    }
  }
};
