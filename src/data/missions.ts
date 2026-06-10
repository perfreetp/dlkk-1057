import type { SampleType } from './samples';

export type MissionType =
  | 'collect'
  | 'collectType'
  | 'reachPoint'
  | 'survive'
  | 'avoid'
  | 'find'
  | 'escort'
  | 'timedReturn'
  | 'scan'
  | 'combat';

export interface MissionObjective {
  id: string;
  type: MissionType;
  name: string;
  description: string;
  target: number;
  targetId?: string;
  targetType?: SampleType;
  reward: number;
  optional?: boolean;
}

export interface MissionTemplate {
  id: string;
  type: MissionType;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  baseReward: number;
  defaultTarget: number;
}

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: 'collectAny',
    type: 'collect',
    name: '样本采集',
    description: '采集指定数量的任意样本',
    difficulty: 1,
    baseReward: 100,
    defaultTarget: 5,
  },
  {
    id: 'collectCreature',
    type: 'collectType',
    name: '生物样本采集',
    description: '采集指定数量的生物类样本',
    difficulty: 2,
    baseReward: 150,
    defaultTarget: 3,
  },
  {
    id: 'collectMineral',
    type: 'collectType',
    name: '矿物样本采集',
    description: '采集指定数量的矿物类样本',
    difficulty: 2,
    baseReward: 150,
    defaultTarget: 3,
  },
  {
    id: 'collectDebris',
    type: 'collectType',
    name: '残骸收集',
    description: '收集指定数量的残骸类物品',
    difficulty: 2,
    baseReward: 150,
    defaultTarget: 3,
  },
  {
    id: 'collectArtifact',
    type: 'collectType',
    name: '人工制品搜寻',
    description: '寻找并收集指定数量的人工制品',
    difficulty: 4,
    baseReward: 300,
    defaultTarget: 2,
  },
  {
    id: 'collectSpecific',
    type: 'collect',
    name: '特定样本采集',
    description: '采集指定的稀有样本',
    difficulty: 4,
    baseReward: 400,
    defaultTarget: 1,
  },
  {
    id: 'reachDepth',
    type: 'reachPoint',
    name: '深度挑战',
    description: '到达指定的海底深度',
    difficulty: 2,
    baseReward: 200,
    defaultTarget: 500,
  },
  {
    id: 'reachPoint',
    type: 'reachPoint',
    name: '目标点到达',
    description: '到达指定的坐标点',
    difficulty: 2,
    baseReward: 180,
    defaultTarget: 1,
  },
  {
    id: 'surviveTime',
    type: 'survive',
    name: '生存挑战',
    description: '在危险环境中生存指定时间',
    difficulty: 3,
    baseReward: 250,
    defaultTarget: 60,
  },
  {
    id: 'avoidCreatures',
    type: 'avoid',
    name: '躲避危险',
    description: '在不接触危险生物的情况下通过区域',
    difficulty: 3,
    baseReward: 220,
    defaultTarget: 3,
  },
  {
    id: 'avoidObstacles',
    type: 'avoid',
    name: '障碍躲避',
    description: '穿越障碍区域，避免碰撞',
    difficulty: 3,
    baseReward: 200,
    defaultTarget: 5,
  },
  {
    id: 'findBeacon',
    type: 'find',
    name: '信标搜索',
    description: '寻找并定位失事信标',
    difficulty: 3,
    baseReward: 280,
    defaultTarget: 1,
  },
  {
    id: 'findShipwreck',
    type: 'find',
    name: '沉船探索',
    description: '发现并探索沉船遗迹',
    difficulty: 3,
    baseReward: 260,
    defaultTarget: 1,
  },
  {
    id: 'findHidden',
    type: 'find',
    name: '隐藏物品搜索',
    description: '寻找隐藏在海底的珍贵物品',
    difficulty: 4,
    baseReward: 350,
    defaultTarget: 1,
  },
  {
    id: 'timedReturn',
    type: 'timedReturn',
    name: '限时返航',
    description: '在限定时间内返回水面',
    difficulty: 3,
    baseReward: 300,
    defaultTarget: 120,
  },
  {
    id: 'scanArea',
    type: 'scan',
    name: '区域扫描',
    description: '使用声呐扫描指定区域',
    difficulty: 2,
    baseReward: 180,
    defaultTarget: 3,
  },
  {
    id: 'scanCreatures',
    type: 'scan',
    name: '生物扫描',
    description: '扫描并记录指定数量的生物',
    difficulty: 2,
    baseReward: 160,
    defaultTarget: 5,
  },
  {
    id: 'defeatCreatures',
    type: 'combat',
    name: '生物驱逐',
    description: '使用设备驱逐危险生物',
    difficulty: 4,
    baseReward: 350,
    defaultTarget: 3,
  },
  {
    id: 'tutorialBasic',
    type: 'collect',
    name: '基础训练',
    description: '学习基本操作，采集第一个样本',
    difficulty: 1,
    baseReward: 50,
    defaultTarget: 3,
  },
  {
    id: 'tutorialMovement',
    type: 'reachPoint',
    name: '移动训练',
    description: '练习潜水器的移动控制',
    difficulty: 1,
    baseReward: 50,
    defaultTarget: 1,
  },
];

export const createMission = (
  templateId: string,
  override?: Partial<MissionObjective>
): MissionObjective | null => {
  const template = MISSION_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return null;

  return {
    id: `${templateId}_${Date.now()}`,
    type: template.type,
    name: template.name,
    description: template.description,
    target: template.defaultTarget,
    reward: template.baseReward,
    ...override,
  };
};
