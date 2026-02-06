import { Group, Rect, Path } from 'react-konva';
import Konva from 'konva';
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

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if ('button' in e.evt && e.evt.button === 2) return;
    setEditModal({ type: 'pipeline_cell', cell });
  };

  return (
    <Group x={x} y={y} onClick={handleClick} onTap={handleClick}>
      <Rect width={CELL} height={CELL} fill="#FFD700" stroke="#333" />
      <Path data={path} fill="black" listening={false} />
    </Group>
  );
}
