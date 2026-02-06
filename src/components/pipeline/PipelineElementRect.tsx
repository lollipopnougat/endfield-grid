import { Group, Rect, Line, Path } from 'react-konva';
import type { PipelineElement as PipelineElementType, Rotation } from '../../types';
import { CELL_SIZE } from '../../constants/grid';
import { useGameStore } from '../../store/useGameStore';

const CELL = CELL_SIZE;

export function PipelineElementRect({ element }: { element: PipelineElementType }) {
  const setEditModal = useGameStore((s) => s.setEditModal);
  const x = element.col * CELL;
  const y = element.row * CELL;
  const cx = CELL / 2;
  const cy = CELL / 2;
  const r = rotationToDeg(element.rotation);

  const handleClick = () => {
    setEditModal({ type: 'pipeline_element', element });
  };

  if (element.kind === 'cross_bridge') {
    return (
      <Group x={x} y={y} rotation={r} offsetX={cx} offsetY={cy} onClick={handleClick} onTap={handleClick}>
        <Rect width={CELL} height={CELL} fill="#FFD700" stroke="#333" />
        <Line points={[cx, 0, cx, CELL]} stroke="black" strokeWidth={2} />
        <Line points={[0, cy, CELL, cy]} stroke="black" strokeWidth={2} />
      </Group>
    );
  }

  if (element.kind === 'splitter') {
    return (
      <Group x={x} y={y} rotation={r} offsetX={cx} offsetY={cy} onClick={handleClick} onTap={handleClick}>
        <Rect width={CELL} height={CELL} fill="#FFD700" stroke="#333" />
        <ThreeArrowsFromLeft />
      </Group>
    );
  }

  if (element.kind === 'merger') {
    return (
      <Group x={x} y={y} rotation={r} offsetX={cx} offsetY={cy} onClick={handleClick} onTap={handleClick}>
        <Rect width={CELL} height={CELL} fill="#FFD700" stroke="#333" />
        <ThreeArrowsToRight />
      </Group>
    );
  }

  return null;
}

function rotationToDeg(r: Rotation): number {
  return r;
}

function ThreeArrowsFromLeft() {
  const cx = CELL / 2;
  const cy = CELL / 2;
  const arr = 5;
  const paths = [
    `M ${cx - arr} ${cy} L ${cx + arr} ${cy - arr} L ${cx + arr} ${cy + arr} Z`,
    `M ${cx} ${cy - arr} L ${cx + arr} ${cy} L ${cx} ${cy + arr} Z`,
    `M ${cx} ${cy + arr} L ${cx - arr} ${cy} L ${cx + arr} ${cy} Z`,
  ];
  return (
    <>
      {paths.map((p, i) => (
        <Path key={i} data={p} fill="black" listening={false} />
      ))}
    </>
  );
}

function ThreeArrowsToRight() {
  const cx = CELL / 2;
  const cy = CELL / 2;
  const arr = 5;
  const paths = [
    `M ${cx + arr} ${cy} L ${cx - arr} ${cy - arr} L ${cx - arr} ${cy + arr} Z`,
    `M ${cx} ${cy - arr} L ${cx - arr} ${cy} L ${cx} ${cy + arr} Z`,
    `M ${cx} ${cy + arr} L ${cx + arr} ${cy} L ${cx - arr} ${cy} Z`,
  ];
  return (
    <>
      {paths.map((p, i) => (
        <Path key={i} data={p} fill="black" listening={false} />
      ))}
    </>
  );
}
