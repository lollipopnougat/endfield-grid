import { CELL_SIZE } from '../constants/grid';

export function getCoordFromPoint(
  point: { x: number; y: number },
  view: { x: number; y: number; scale: number }
): [number, number] {
  const col = Math.floor((point.x - view.x) / view.scale / CELL_SIZE);
  const row = Math.floor((point.y - view.y) / view.scale / CELL_SIZE);
  return [col, row];
}

export function getPointFromCoord(col: number, row: number): { x: number; y: number } {
  return { x: col * CELL_SIZE, y: row * CELL_SIZE };
}
