import type { DeviceKind } from '../types';
import { DEVICE_DEFS, parseSize } from '../constants/devices';
import { getDeviceCells } from './grid';

type StateSlice = {
  gridCols: number;
  gridRows: number;
  devices: { id: string; kind: DeviceKind; col: number; row: number }[];
  pipelineCells: { col: number; row: number }[];
  pipelineElements: { id?: string; col: number; row: number }[];
};

export function canPlaceDevice(
  kind: DeviceKind,
  col: number,
  row: number,
  state: StateSlice,
  excludeDeviceId?: string
): boolean {
  const def = DEVICE_DEFS[kind];
  const [w, h] = parseSize(def.size);
  if (col < 0 || row < 0 || col + w > state.gridCols || row + h > state.gridRows) return false;
  const cells = getDeviceCells(kind);
  for (const [c, r] of cells) {
    const ac = col + c;
    const ar = row + r;
    for (const d of state.devices) {
      if (d.id === excludeDeviceId) continue;
      const dDef = DEVICE_DEFS[d.kind];
      const [dw, dh] = parseSize(dDef.size);
      if (ac >= d.col && ac < d.col + dw && ar >= d.row && ar < d.row + dh) return false;
    }
    if (state.pipelineCells.some((p) => p.col === ac && p.row === ar)) return false;
    if (state.pipelineElements.some((e) => e.col === ac && e.row === ar)) return false;
  }
  return true;
}

export function canPlacePipelineElement(
  col: number,
  row: number,
  state: StateSlice,
  excludeElementId?: string
): boolean {
  if (col < 0 || row < 0 || col >= state.gridCols || row >= state.gridRows) return false;
  for (const d of state.devices) {
    const dDef = DEVICE_DEFS[d.kind];
    const [dw, dh] = parseSize(dDef.size);
    if (col >= d.col && col < d.col + dw && row >= d.row && row < d.row + dh) return false;
  }
  if (state.pipelineCells.some((p) => p.col === col && p.row === row)) return false;
  for (const el of state.pipelineElements) {
    if ('id' in el && el.id === excludeElementId) continue;
    if (el.col === col && el.row === row) return false;
  }
  return true;
}
