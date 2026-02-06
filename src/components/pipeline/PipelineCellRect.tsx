import { Group, Rect, Path } from 'react-konva';
import type { PipelineCell } from '../../types';
import { CELL_SIZE } from '../../constants/grid';
import { useGameStore } from '../../store/useGameStore';

const CELL = CELL_SIZE;

export function PipelineCellRect({ cell }: { cell: PipelineCell }) {
  const setEditModal = useGameStore((s) => s.setEditModal);
  const x = cell.col * CELL;
  const y = cell.row * CELL;
  const cx = CELL / 2;
  const cy = CELL / 2;
  const arr = 4;
  let path = '';
  switch (cell.direction) {
    case 'up':
      path = `M ${cx} ${cy - arr} L ${cx - arr} ${cy + arr} L ${cx + arr} ${cy + arr} Z`;
      break;
    case 'down':
      path = `M ${cx} ${cy + arr} L ${cx - arr} ${cy - arr} L ${cx + arr} ${cy - arr} Z`;
      break;
    case 'left':
      path = `M ${cx - arr} ${cy} L ${cx + arr} ${cy - arr} L ${cx + arr} ${cy + arr} Z`;
      break;
    case 'right':
      path = `M ${cx + arr} ${cy} L ${cx - arr} ${cy - arr} L ${cx - arr} ${cy + arr} Z`;
      break;
  }

  return (
    <Group x={x} y={y} onClick={() => setEditModal({ type: 'pipeline_cell', cell })} onTap={() => setEditModal({ type: 'pipeline_cell', cell })}>
      <Rect width={CELL} height={CELL} fill="#FFD700" stroke="#333" />
      <Path data={path} fill="black" listening={false} />
    </Group>
  );
}
