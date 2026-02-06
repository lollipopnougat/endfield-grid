import type { GridDevice, PipelineCell, PipelineElement, Rotation } from '../types';
import { DEVICE_DEFS, parseSize } from '../constants/devices';
import type { DeviceKind, DeviceSize } from '../types';

/** 设备占用的格子 (col, row) 列表，相对左上角 (0,0)，与旋转无关（AABB） */
export function getDeviceCells(kind: DeviceKind, _rotation?: Rotation): [number, number][] {
  const def = DEVICE_DEFS[kind];
  const [w, h] = parseSize(def.size as DeviceSize);
  const cells: [number, number][] = [];
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) cells.push([c, r]);
  return cells;
}

/** 设备在网格上的绝对格子坐标列表 */
export function getDeviceOccupiedCells(device: GridDevice): [number, number][] {
  const relative = getDeviceCells(device.kind, device.rotation);
  return relative.map(([c, r]) => [device.col + c, device.row + r]);
}

/** 某格是否被任意设备占用 */
export function isCellOccupiedByDevice(
  col: number,
  row: number,
  devices: GridDevice[],
  excludeDeviceId?: string
): boolean {
  for (const d of devices) {
    if (d.id === excludeDeviceId) continue;
    const cells = getDeviceOccupiedCells(d);
    if (cells.some(([c, r]) => c === col && r === row)) return true;
  }
  return false;
}

/** 某格是否有流水线或连接元素 */
export function isCellPipelineOrElement(
  col: number,
  row: number,
  cells: PipelineCell[],
  elements: PipelineElement[]
): boolean {
  if (cells.some((p) => p.col === col && p.row === row)) return true;
  if (elements.some((e) => e.col === col && e.row === row)) return true;
  return false;
}

/** 供电桩中心格子 (2x2 取左上角+0.5 即中心) */
export function getPowerStationCenter(device: GridDevice): [number, number] {
  return [device.col + 1, device.row + 1];
}

/** 判断 (col, row) 是否在任意供电桩的供电范围内 */
export function isCellPowered(
  col: number,
  row: number,
  devices: GridDevice[]
): boolean {
  for (const d of devices) {
    const def = DEVICE_DEFS[d.kind];
    if (!def.isPowerSource || def.powerRange == null) continue;
    const range = def.powerRange;
    const [cx, cy] = getPowerStationCenter(d);
    if (
      Math.abs(col - cx) <= range &&
      Math.abs(row - cy) <= range
    )
      return true;
  }
  return false;
}

/** 顺时针旋转角度 */
export function nextRotation(r: Rotation): Rotation {
  return ((r + 90) % 360) as Rotation;
}
