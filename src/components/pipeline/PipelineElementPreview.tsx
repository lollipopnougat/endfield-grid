import { Group, Rect, Line, Path } from 'react-konva';
import type { PipelineElementKind } from '../../types';
import { CELL_SIZE } from '../../constants/grid';

const CELL = CELL_SIZE;
const CX = CELL / 2;
const CY = CELL / 2;
const PREVIEW_OPACITY = 0.5;

function elementGroupPosition(col: number, row: number) {
  return { x: col * CELL + CX, y: row * CELL + CY, offsetX: CX, offsetY: CY };
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

/** 放置流水线连接元素时跟随鼠标的半透明预览 */
export function PipelineElementPreview({
  kind,
  col,
  row,
}: {
  kind: PipelineElementKind;
  col: number;
  row: number;
}) {
  const pos = elementGroupPosition(col, row);

  if (kind === 'cross_bridge') {
    return (
      <Group {...pos} opacity={PREVIEW_OPACITY} listening={false}>
        <Rect width={CELL} height={CELL} fill="#FFD700" stroke="#333" />
        <Line points={[CX, 0, CX, CELL]} stroke="black" strokeWidth={2} />
        <Line points={[0, CY, CELL, CY]} stroke="black" strokeWidth={2} />
      </Group>
    );
  }

  if (kind === 'splitter') {
    return (
      <Group {...pos} opacity={PREVIEW_OPACITY} listening={false}>
        <Rect width={CELL} height={CELL} fill="#FFD700" stroke="#333" />
        <ThreeArrowsFromLeft />
      </Group>
    );
  }

  if (kind === 'merger') {
    return (
      <Group {...pos} opacity={PREVIEW_OPACITY} listening={false}>
        <Rect width={CELL} height={CELL} fill="#FFD700" stroke="#333" />
        <ThreeArrowsToRight />
      </Group>
    );
  }

  return null;
}
