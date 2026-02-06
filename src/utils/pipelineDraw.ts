import type { PipelineCell } from '../types';

export function getDirection(
  from: { col: number; row: number },
  to: { col: number; row: number }
): 'up' | 'down' | 'left' | 'right' {
  if (to.col > from.col) return 'right';
  if (to.col < from.col) return 'left';
  if (to.row > from.row) return 'down';
  return 'up';
}

export function isAdjacent(
  a: { col: number; row: number },
  b: { col: number; row: number }
): boolean {
  const d = Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
  return d === 1;
}

export function hasPipelineAt(
  col: number,
  row: number,
  cells: PipelineCell[]
): boolean {
  return cells.some((p) => p.col === col && p.row === row);
}
