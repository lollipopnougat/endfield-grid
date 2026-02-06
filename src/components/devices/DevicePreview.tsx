import { Group, Rect, Circle, Path } from 'react-konva';
import type { DeviceKind } from '../../types';
import { DEVICE_DEFS, parseSize } from '../../constants/devices';
import { CELL_SIZE } from '../../constants/grid';

const CELL = CELL_SIZE;
const PREVIEW_OPACITY = 0.5;

function ArrowPath({
  cellCol,
  cellRow,
  direction,
}: {
  cellCol: number;
  cellRow: number;
  direction: 'left' | 'right' | 'up' | 'down';
}) {
  const cx = cellCol * CELL + CELL / 2;
  const cy = cellRow * CELL + CELL / 2;
  const arr = 6;
  let path = '';
  if (direction === 'left') {
    path = `M ${cx + arr} ${cy} L ${cx - arr} ${cy - arr} L ${cx - arr} ${cy + arr} Z`;
  } else if (direction === 'right') {
    path = `M ${cx - arr} ${cy} L ${cx + arr} ${cy - arr} L ${cx + arr} ${cy + arr} Z`;
  } else if (direction === 'up') {
    path = `M ${cx} ${cy + arr} L ${cx - arr} ${cy - arr} L ${cx + arr} ${cy - arr} Z`;
  } else {
    path = `M ${cx} ${cy - arr} L ${cx - arr} ${cy + arr} L ${cx + arr} ${cy + arr} Z`;
  }
  return <Path data={path} fill="black" listening={false} />;
}

/** 放置设备时跟随鼠标的半透明预览 */
export function DevicePreview({
  kind,
  col,
  row,
}: {
  kind: DeviceKind;
  col: number;
  row: number;
}) {
  const def = DEVICE_DEFS[kind];
  const [w, h] = parseSize(def.size);
  const ox = (w * CELL) / 2;
  const oy = (h * CELL) / 2;
  const groupX = col * CELL + ox;
  const groupY = row * CELL + oy;

  if (kind === 'power_station') {
    return (
      <Group x={groupX} y={groupY} offsetX={ox} offsetY={oy} opacity={PREVIEW_OPACITY} listening={false}>
        <Circle x={ox} y={oy} radius={CELL} fill={def.color} stroke="#333" strokeWidth={1} />
      </Group>
    );
  }

  if (kind === 'heat_pool') {
    return (
      <Group x={groupX} y={groupY} offsetX={ox} offsetY={oy} opacity={PREVIEW_OPACITY} listening={false}>
        <Rect x={0} y={0} width={w * CELL} height={h * CELL} fill={def.color} stroke="#333" />
        <ArrowPath cellCol={0} cellRow={0} direction="left" />
        <ArrowPath cellCol={0} cellRow={1} direction="left" />
      </Group>
    );
  }

  if (kind === 'warehouse_output') {
    return (
      <Group x={groupX} y={groupY} offsetX={ox} offsetY={oy} opacity={PREVIEW_OPACITY} listening={false}>
        <Rect x={0} y={0} width={w * CELL} height={h * CELL} fill={def.color} stroke="#333" />
        <ArrowPath cellCol={1} cellRow={0} direction="up" />
      </Group>
    );
  }

  if (kind === 'warehouse_input') {
    return (
      <Group x={groupX} y={groupY} offsetX={ox} offsetY={oy} opacity={PREVIEW_OPACITY} listening={false}>
        <Rect x={0} y={0} width={w * CELL} height={h * CELL} fill={def.color} stroke="#333" />
        <ArrowPath cellCol={1} cellRow={0} direction="down" />
      </Group>
    );
  }

  if (kind === 'protocol_core') {
    return (
      <Group x={groupX} y={groupY} offsetX={ox} offsetY={oy} opacity={PREVIEW_OPACITY} listening={false}>
        <Rect x={0} y={0} width={w * CELL} height={h * CELL} fill={def.color} stroke="#333" />
        {/* 左侧7个输入口 */}
        {[1, 2, 3, 4, 5, 6, 7].map((row) => (
          <ArrowPath key={`left-${row}`} cellCol={0} cellRow={row} direction="left" />
        ))}
        {/* 右侧7个输入口 */}
        {[1, 2, 3, 4, 5, 6, 7].map((row) => (
          <ArrowPath key={`right-${row}`} cellCol={8} cellRow={row} direction="right" />
        ))}
        {/* 上方3个输出口 */}
        {[1, 4, 7].map((col) => (
          <ArrowPath key={`top-${col}`} cellCol={col} cellRow={0} direction="down" />
        ))}
        {/* 下方3个输出口 */}
        {[1, 4, 7].map((col) => (
          <ArrowPath key={`bottom-${col}`} cellCol={col} cellRow={8} direction="up" />
        ))}
      </Group>
    );
  }

  const numPorts = w === 3 ? 3 : 6;
  return (
    <Group x={groupX} y={groupY} offsetX={ox} offsetY={oy} opacity={PREVIEW_OPACITY} listening={false}>
      <Rect
        x={0}
        y={0}
        width={w * CELL}
        height={h * CELL}
        fill={def.color}
        stroke="#333"
      />
      {Array.from({ length: numPorts }, (_, i) => (
        <ArrowPath key={'in-' + i} cellCol={0} cellRow={i} direction="left" />
      ))}
      {Array.from({ length: numPorts }, (_, i) => (
        <ArrowPath key={'out-' + i} cellCol={w - 1} cellRow={i} direction="left" />
      ))}
    </Group>
  );
}
