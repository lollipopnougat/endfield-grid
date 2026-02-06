import { Group, Rect, Circle, Line, Path, Text } from 'react-konva';
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

  // 贴靠网格：Group 的 (offsetX, offsetY) 放在 (col*CELL+ox, row*CELL+oy)，使矩形 (0,0)-(w*CELL,h*CELL) 刚好占满格子
  const groupX = device.col * CELL + ox;
  const groupY = device.row * CELL + oy;
  const rectW = w * CELL;
  const rectH = h * CELL;
  const fontSize = Math.max(10, Math.min(14, Math.min(rectW, rectH) * 0.28));
  const deviceNameText = (
    <Text
      x={0}
      y={0}
      width={rectW}
      height={rectH}
      text={def.name}
      fontSize={fontSize}
      fontFamily="sans-serif"
      align="center"
      verticalAlign="middle"
      fill="#333"
      listening={false}
      wrap="none"
      ellipsis
    />
  );

  if (device.kind === 'power_station') {
    return (
      <Group
        x={groupX}
        y={groupY}
        rotation={device.rotation}
        offsetX={ox}
        offsetY={oy}
        onClick={handleClick}
        onTap={handleClick}
        listening
      >
        <Circle x={ox} y={oy} radius={CELL} fill={def.color} stroke="#333" strokeWidth={1} />
        {deviceNameText}
      </Group>
    );
  }

  if (device.kind === 'heat_pool') {
    return (
      <Group
        x={groupX}
        y={groupY}
        rotation={device.rotation}
        offsetX={ox}
        offsetY={oy}
        onClick={handleClick}
        onTap={handleClick}
        listening
      >
        <Rect x={0} y={0} width={rectW} height={rectH} fill={def.color} stroke="#333" />
        {/* 输入口在左侧，箭头指向设备内侧（向右） */}
        <ArrowAtCell cellCol={0} cellRow={0} direction="right" />
        <ArrowAtCell cellCol={0} cellRow={1} direction="right" />
        {deviceNameText}
      </Group>
    );
  }

  // 3x3 / 4x6 / 6x6: 左侧输入（箭头指向内侧=右），右侧输出（箭头指向外侧=右）
  const numPorts = w === 3 ? 3 : 6;
  return (
    <Group
      x={groupX}
      y={groupY}
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
        width={rectW}
        height={rectH}
        fill={def.color}
        stroke="#333"
      />
      {Array.from({ length: numPorts }, (_, i) => (
        <ArrowAtCell key={'in-' + i} cellCol={0} cellRow={i} direction="right" />
      ))}
      {Array.from({ length: numPorts }, (_, i) => (
        <ArrowAtCell key={'out-' + i} cellCol={w - 1} cellRow={i} direction="right" />
      ))}
      {deviceNameText}
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
