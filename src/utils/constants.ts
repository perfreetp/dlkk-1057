export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const SUBMARINE_SIZE = 40;

export const BASE_OXYGEN_CONSUMPTION_RATE = 0.5;
export const BASE_BATTERY_CONSUMPTION_RATE = 0.3;

export const LIGHT_BATTERY_COST = 0.1;
export const SONAR_BATTERY_COST = 5;
export const SONAR_COOLDOWN = 3;

export const REPAIR_BATTERY_COST = 10;
export const REPAIR_HULL_AMOUNT = 20;

export const DEPTH_PRESSURE_DAMAGE_RATE = 0.2;

export const SAMPLE_COLORS: Record<string, string> = {
  creature: '#4ade80',
  mineral: '#60a5fa',
  debris: '#fbbf24',
  artifact: '#f472b6',
};

export const HAZARD_COLORS: Record<string, string> = {
  current: '#3b82f6',
  thermal: '#ef4444',
  pressure: '#8b5cf6',
  sharp: '#f97316',
  creature: '#dc2626',
};
