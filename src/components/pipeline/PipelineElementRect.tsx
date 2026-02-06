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

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
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
        <SplitterIcon />
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
        <MergerIcon />
      </Group>
    );
  }

  return null;
}

function rotationToDeg(r: Rotation): number {
  return r;
}

/** 分流器图标：四个黑色三角形分别位于上、下、左、右，指向上下右右 */
function SplitterIcon() {
  const arr = 6; // 箭头大小
  const margin = 4; // 距离边缘的距离
  
  // 上方三角形（指向上）
  const topPath = `M ${CX} ${margin} L ${CX - arr} ${margin + arr} L ${CX + arr} ${margin + arr} Z`;
  // 下方三角形（指向下）
  const bottomPath = `M ${CX} ${CELL - margin} L ${CX - arr} ${CELL - margin - arr} L ${CX + arr} ${CELL - margin - arr} Z`;
  // 左侧三角形（指向右）：顶点在左侧边缘
  const leftPath = `M ${margin} ${CY} L ${margin + arr} ${CY - arr} L ${margin + arr} ${CY + arr} Z`;
  // 右侧三角形（指向右）：顶点在内部，底边在右侧边缘
  const rightPath = `M ${CELL - margin - arr} ${CY} L ${CELL - margin} ${CY - arr} L ${CELL - margin} ${CY + arr} Z`;
  
  return (
    <>
      <Path data={topPath} fill="black" listening={false} />
      <Path data={bottomPath} fill="black" listening={false} />
      <Path data={leftPath} fill="black" listening={false} />
      <Path data={rightPath} fill="black" listening={false} />
    </>
  );
}

/** 合流器图标：四个黑色三角形位于边缘中点，分别指向下、上、右、右 */
function MergerIcon() {
  const arr = 6; // 箭头大小
  const margin = 4; // 距离边缘的距离
  
  // 上方三角形（指向下）
  const topPath = `M ${CX} ${margin + arr} L ${CX - arr} ${margin} L ${CX + arr} ${margin} Z`;
  // 下方三角形（指向上）
  const bottomPath = `M ${CX} ${CELL - margin - arr} L ${CX - arr} ${CELL - margin} L ${CX + arr} ${CELL - margin} Z`;
  // 左侧三角形（指向右）：顶点在左侧边缘
  const leftPath = `M ${margin} ${CY} L ${margin + arr} ${CY - arr} L ${margin + arr} ${CY + arr} Z`;
  // 右侧三角形（指向右）：顶点在内部，底边在右侧边缘
  const rightPath = `M ${CELL - margin - arr} ${CY} L ${CELL - margin} ${CY - arr} L ${CELL - margin} ${CY + arr} Z`;
  
  return (
    <>
      {/* 四个三角形 */}
      <Path data={topPath} fill="black" listening={false} />
      <Path data={bottomPath} fill="black" listening={false} />
      <Path data={leftPath} fill="black" listening={false} />
      <Path data={rightPath} fill="black" listening={false} />
    </>
  );
}
