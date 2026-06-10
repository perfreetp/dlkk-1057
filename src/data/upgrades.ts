export interface UpgradeEffect {
  speed?: number;
  oxygen?: number;
  battery?: number;
  armRange?: number;
  armSpeed?: number;
  sonarRange?: number;
  sonarAccuracy?: number;
  hull?: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  costs: number[];
  effects: UpgradeEffect[];
}

export const UPGRADES: Upgrade[] = [
  {
    id: 'engine',
    name: '引擎',
    description: '提升潜水器的移动速度',
    maxLevel: 5,
    costs: [50, 100, 200, 400, 800],
    effects: [
      { speed: 1.0 },
      { speed: 1.2 },
      { speed: 1.4 },
      { speed: 1.6 },
      { speed: 2.0 },
    ],
  },
  {
    id: 'oxygenTank',
    name: '氧气罐',
    description: '提升氧气容量，延长水下作业时间',
    maxLevel: 5,
    costs: [50, 100, 200, 400, 800],
    effects: [
      { oxygen: 100 },
      { oxygen: 130 },
      { oxygen: 160 },
      { oxygen: 200 },
      { oxygen: 250 },
    ],
  },
  {
    id: 'battery',
    name: '电池',
    description: '提升电量容量，支持更多设备运行',
    maxLevel: 5,
    costs: [50, 100, 200, 400, 800],
    effects: [
      { battery: 100 },
      { battery: 130 },
      { battery: 160 },
      { battery: 200 },
      { battery: 250 },
    ],
  },
  {
    id: 'mechanicalArm',
    name: '机械臂',
    description: '提升采集速度和范围',
    maxLevel: 5,
    costs: [50, 100, 200, 400, 800],
    effects: [
      { armRange: 50, armSpeed: 1.0 },
      { armRange: 60, armSpeed: 1.2 },
      { armRange: 70, armSpeed: 1.4 },
      { armRange: 85, armSpeed: 1.6 },
      { armRange: 100, armSpeed: 2.0 },
    ],
  },
  {
    id: 'sonar',
    name: '声呐',
    description: '提升扫描范围和精度',
    maxLevel: 5,
    costs: [50, 100, 200, 400, 800],
    effects: [
      { sonarRange: 200, sonarAccuracy: 1.0 },
      { sonarRange: 250, sonarAccuracy: 1.2 },
      { sonarRange: 320, sonarAccuracy: 1.4 },
      { sonarRange: 400, sonarAccuracy: 1.6 },
      { sonarRange: 500, sonarAccuracy: 2.0 },
    ],
  },
  {
    id: 'armor',
    name: '装甲',
    description: '提升外壳耐久度，抵御深海压力和碰撞',
    maxLevel: 5,
    costs: [50, 100, 200, 400, 800],
    effects: [
      { hull: 100 },
      { hull: 130 },
      { hull: 170 },
      { hull: 220 },
      { hull: 300 },
    ],
  },
];
