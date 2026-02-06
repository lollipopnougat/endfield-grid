import { Group, Rect, Line, Path } from 'react-konva';
import Konva from 'konva';
import type { PipelineElement as PipelineElementType, Rotation } from '../../types';
import { CELL_SIZE } from '../../constants/grid';
import { useGameStore } from '../../store/useGameStore';

const CELL = CELL_SIZE;

const CX = CELL / 2;
const CY = CELL / 2;

/** 贴靠网格：Group 的 (offsetX, offsetY) 放在 (col*CELL+cx, row*CELL+cy)，使矩形 (0,0)-(CELL,CELL) 占满格子 */
function elementGroupPosition(col: number, row: number) {
  return { x: col * CELL + CX, y: row * CELL + CY, offsetX: CX, offsetY: CY };
}

export function PipelineElementRect({ element }: { element: PipelineElementType }) {
  const setEditModal = useGameStore((s) => s.setEditModal);
  const setSelectedElementId = useGameStore((s) => s.setSelectedElementId);
  const selectedElementId = useGameStore((s) => s.selectedElementId);
  const pos = elementGroupPosition(element.col, element.row);
  const r = rotationToDeg(element.rotation);
  const isSelected = selectedElementId === element.id;

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if ('button' in e.evt && e.evt.button === 2) return;
    setSelectedElementId(element.id);
    setEditModal({ type: 'pipeline_element', element });
  };

  if (element.kind === 'cross_bridge') {
    return (
      <Group {...pos} rotation={r} onClick={handleClick} onTap={handleClick}>
        <Rect
          width={CELL}
          height={CELL}
          fill="#FFD700"
          stroke={isSelected ? '#4169E1' : '#333'}
          strokeWidth={isSelected ? 3 : 1}
        />
        <Line points={[CX, 0, CX, CELL]} stroke="black" strokeWidth={2} />
        <Line points={[0, CY, CELL, CY]} stroke="black" strokeWidth={2} />
      </Group>
    );
  }

  if (element.kind === 'splitter') {
    return (
      <Group {...pos} rotation={r} onClick={handleClick} onTap={handleClick}>
        <Rect
          width={CELL}
          height={CELL}
          fill="#FFD700"
          stroke={isSelected ? '#4169E1' : '#333'}
          strokeWidth={isSelected ? 3 : 1}
        />
        <ThreeArrowsFromLeft />
      </Group>
    );
  }

  if (element.kind === 'merger') {
    return (
      <Group {...pos} rotation={r} onClick={handleClick} onTap={handleClick}>
        <Rect
          width={CELL}
          height={CELL}
          fill="#FFD700"
          stroke={isSelected ? '#4169E1' : '#333'}
          strokeWidth={isSelected ? 3 : 1}
        />
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
  const arr = 5;
  const paths = [
    `M ${CX - arr} ${CY} L ${CX + arr} ${CY - arr} L ${CX + arr} ${CY + arr} Z`,
    `M ${CX} ${CY - arr} L ${CX + arr} ${CY} L ${CX} ${CY + arr} Z`,
    `M ${CX} ${CY + arr} L ${CX - arr} ${CY} L ${CX + arr} ${CY} Z`,
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
  const arr = 5;
  const paths = [
    `M ${CX + arr} ${CY} L ${CX - arr} ${CY - arr} L ${CX - arr} ${CY + arr} Z`,
    `M ${CX} ${CY - arr} L ${CX - arr} ${CY} L ${CX} ${CY + arr} Z`,
    `M ${CX} ${CY + arr} L ${CX + arr} ${CY} L ${CX - arr} ${CY} Z`,
  ];
  return (
    <>
      {paths.map((p, i) => (
        <Path key={i} data={p} fill="black" listening={false} />
      ))}
    </>
  );
}
