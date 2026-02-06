import type { DeviceKind, DeviceSize } from '../types';

export interface DeviceDef {
  kind: DeviceKind;
  size: DeviceSize;
  name: string;
  /** 填充色 */
  color: string;
  /** 是否为供电桩（提供电力范围） */
  isPowerSource?: boolean;
  /** 供电范围半径（格子数，仅供电桩） */
  powerRange?: number;
}

/** 解析尺寸 "2x2" -> [2,2] */
export function parseSize(size: DeviceSize): [number, number] {
  const [w, h] = size.split('x').map(Number);
  return [w, h];
}

export const DEVICE_DEFS: Record<DeviceKind, DeviceDef> = {
  power_station: {
    kind: 'power_station',
    size: '2x2',
    name: '供电桩',
    color: '#87CEEB', // 天蓝
    isPowerSource: true,
    powerRange: 5, // 12x12 范围：从中心向左5格、向右6格，共12格（实际用 leftRange=5, rightRange=6）
  },
  heat_pool: {
    kind: 'heat_pool',
    size: '2x2',
    name: '热能池',
    color: '#ADD8E6', // 浅蓝
  },
  refinery: {
    kind: 'refinery',
    size: '3x3',
    name: '精炼炉',
    color: '#FFB6C1', // 粉红
  },
  crusher: {
    kind: 'crusher',
    size: '3x3',
    name: '粉碎机',
    color: '#C0C0C0', // 银
  },
  parts_machine: {
    kind: 'parts_machine',
    size: '3x3',
    name: '配件机',
    color: '#FFD700', // 黄
  },
  shaping_machine: {
    kind: 'shaping_machine',
    size: '3x3',
    name: '塑形机',
    color: '#4169E1', // 蓝
  },
  equipment_origin: {
    kind: 'equipment_origin',
    size: '4x6',
    name: '装备原件机',
    color: '#DC143C', // 红
  },
  filler: {
    kind: 'filler',
    size: '4x6',
    name: '灌装机',
    color: '#FFF44F', // 柠檬黄
  },
  packager: {
    kind: 'packager',
    size: '4x6',
    name: '封装机',
    color: '#6B8E23', // 橄榄
  },
  grinder: {
    kind: 'grinder',
    size: '4x6',
    name: '研磨机',
    color: '#800080', // 紫
  },
  disassembler: {
    kind: 'disassembler',
    size: '4x6',
    name: '拆解机',
    color: '#FF8C00', // 橘
  },
  seed_collector: {
    kind: 'seed_collector',
    size: '6x6',
    name: '采种机',
    color: '#00CED1', // 青
  },
  planter: {
    kind: 'planter',
    size: '6x6',
    name: '种植机',
    color: '#8B4513', // 棕
  },
  reactor: {
    kind: 'reactor',
    size: '6x6',
    name: '反应池',
    color: '#FF00FF', // 品红
  },
  furnace: {
    kind: 'furnace',
    size: '6x6',
    name: '天有洪炉',
    color: '#6B8E23', // 橄榄
  },
};

/** 2x2 设备列表（工具栏用） */
export const DEVICES_2X2: DeviceKind[] = ['power_station', 'heat_pool'];

/** 3x3 设备列表 */
export const DEVICES_3X3: DeviceKind[] = [
  'refinery',
  'crusher',
  'parts_machine',
  'shaping_machine',
];

/** 4x6 设备列表 */
export const DEVICES_4X6: DeviceKind[] = [
  'equipment_origin',
  'filler',
  'packager',
  'grinder',
  'disassembler',
];

/** 6x6 设备列表 */
export const DEVICES_6X6: DeviceKind[] = [
  'seed_collector',
  'planter',
  'reactor',
  'furnace',
];
