import { Group, Rect, Circle, Line, Path } from 'react-konva';
import type { GridDevice } from '../../types';
import { DEVICE_DEFS, parseSize } from '../../constants/devices';
import { CELL_SIZE } from '../../constants/grid';
import { useGameStore } from '../../store/useGameStore';
import { isCellPowered } from '../../utils/grid';

const CELL = CELL_SIZE;

export function DeviceRect({ device }: { device: GridDevice }) {
  const setEditModal = useGameStore((s) => s.setEditModal);
  const devices = useGameStore((s) => s.devices);
  const def = DEVICE_DEFS[device.kind];
  const [w, h] = parseSize(def.size);
  const isProduction = def.size === '3x3' || def.size === '4x6' || def.size === '6x6';
  const powered = isProduction ? isCellPowered(device.col, device.row, devices) : true;
  const ox = (w * CELL) / 2;
  const oy = (h * CELL) / 2;

  const handleClick = () => {
    setEditModal({ type: 'device', device });
  };

  if (device.kind === 'power_station') {
    return (
      <Group
        x={device.col * CELL}
        y={device.row * CELL}
        rotation={device.rotation}
        offsetX={ox}
        offsetY={oy}
        onClick={handleClick}
        onTap={handleClick}
        listening
      >
        <Circle x={ox} y={oy} radius={CELL} fill={def.color} stroke="#333" strokeWidth={1} />
      </Group>
    );
  }

  if (device.kind === 'heat_pool') {
    return (
      <Group
        x={device.col * CELL}
        y={device.row * CELL}
        rotation={device.rotation}
        offsetX={ox}
        offsetY={oy}
        onClick={handleClick}
        onTap={handleClick}
        listening
      >
        <Rect x={0} y={0} width={w * CELL} height={h * CELL} fill={def.color} stroke="#333" />
        {/* 输入口在左侧两格，箭头上方指向左 */}
        <ArrowAtCell cellCol={0} cellRow={0} direction="left" />
        <ArrowAtCell cellCol={0} cellRow={1} direction="left" />
      </Group>
    );
  }

  // 3x3 / 4x6 / 6x6: 左侧输入，右侧输出
  const numPorts = w === 3 ? 3 : 6;
  return (
    <Group
      x={device.col * CELL}
      y={device.row * CELL}
      rotation={device.rotation}
      offsetX={ox}
      offsetY={oy}
      onClick={handleClick}
      onTap={handleClick}
      listening
    >
      <Rect
        x={0}
        y={0}
        width={w * CELL}
        height={h * CELL}
        fill={def.color}
        stroke="#333"
      />
      {Array.from({ length: numPorts }, (_, i) => (
        <ArrowAtCell key={'in-' + i} cellCol={0} cellRow={i} direction="left" />
      ))}
      {Array.from({ length: numPorts }, (_, i) => (
        <ArrowAtCell key={'out-' + i} cellCol={w - 1} cellRow={i} direction="right" />
      ))}
      {!powered && (
        <Group x={ox} y={oy} offsetX={12} offsetY={12}>
          <Circle x={0} y={0} r={14} fill="red" />
          <Line points={[-8, -8, 8, 8]} stroke="white" strokeWidth={3} />
          <Line points={[8, -8, -8, 8]} stroke="white" strokeWidth={3} />
        </Group>
      )}
    </Group>
  );
}

function ArrowAtCell({
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
