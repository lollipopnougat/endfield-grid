import { Group, Rect, Circle, Line, Path, Text } from 'react-konva';
import Konva from 'konva';
import type { GridDevice } from '../../types';
import { DEVICE_DEFS, parseSize } from '../../constants/devices';
import { CELL_SIZE } from '../../constants/grid';
import { useGameStore } from '../../store/useGameStore';
import { isDevicePowered } from '../../utils/grid';

const CELL = CELL_SIZE;

export function DeviceRect({ device }: { device: GridDevice }) {
  const setEditModal = useGameStore((s) => s.setEditModal);
  const setSelectedDeviceId = useGameStore((s) => s.setSelectedDeviceId);
  const selectedDeviceId = useGameStore((s) => s.selectedDeviceId);
  const devices = useGameStore((s) => s.devices);
  const def = DEVICE_DEFS[device.kind];
  const [w, h] = parseSize(def.size);
  // 需要供电的设备：3x3, 4x6, 6x6（不包括新设备）
  const isProduction = def.size === '3x3' || def.size === '4x6' || def.size === '6x6';
  const powered = isProduction ? isDevicePowered(device, devices) : true;
  const ox = (w * CELL) / 2;
  const oy = (h * CELL) / 2;
  const isSelected = selectedDeviceId === device.id;

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if ('button' in e.evt && e.evt.button === 2) return;
    setSelectedDeviceId(device.id);
    setEditModal({ type: 'device', device });
  };

  // 贴靠网格：Group 的 (offsetX, offsetY) 放在 (col*CELL+ox, row*CELL+oy)，使矩形 (0,0)-(w*CELL,h*CELL) 刚好占满格子
  const groupX = device.col * CELL + ox;
  const groupY = device.row * CELL + oy;
  const rectW = w * CELL;
  const rectH = h * CELL;
  const fontSize = Math.max(10, Math.min(14, Math.min(rectW, rectH) * 0.28));
  // 文字和图标需要保持正向，所以需要反向旋转来抵消父 Group 的旋转
  // 文字 Group 的位置在设备中心 (ox, oy)，旋转中心也在 (ox, oy)，这样旋转后文字位置不变
  const deviceNameText = (
    <Group x={ox} y={oy} offsetX={0} offsetY={0} rotation={-device.rotation}>
      <Text
        x={-ox}
        y={-oy}
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
    </Group>
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
        onTap={() => {
          setSelectedDeviceId(device.id);
          setEditModal({ type: 'device', device });
        }}
        listening
      >
        <Circle
          x={ox}
          y={oy}
          radius={CELL}
          fill={def.color}
          stroke={isSelected ? '#4169E1' : '#333'}
          strokeWidth={isSelected ? 3 : 1}
        />
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
        onTap={() => {
          setSelectedDeviceId(device.id);
          setEditModal({ type: 'device', device });
        }}
        listening
      >
        <Rect
          x={0}
          y={0}
          width={rectW}
          height={rectH}
          fill={def.color}
          stroke={isSelected ? '#4169E1' : '#333'}
          strokeWidth={isSelected ? 3 : 1}
        />
        {/* 输入口在左侧，箭头指向设备内侧（向右） */}
        <ArrowAtCell cellCol={0} cellRow={0} direction="right" />
        <ArrowAtCell cellCol={0} cellRow={1} direction="right" />
        {deviceNameText}
      </Group>
    );
  }

  // 仓库取货口：3x1，输出口在中间（第2个格子，索引1）
  if (device.kind === 'warehouse_output') {
    return (
      <Group
        x={groupX}
        y={groupY}
        rotation={device.rotation}
        offsetX={ox}
        offsetY={oy}
        onClick={handleClick}
        onTap={() => {
          setSelectedDeviceId(device.id);
          setEditModal({ type: 'device', device });
        }}
        listening
      >
        <Rect
          x={0}
          y={0}
          width={rectW}
          height={rectH}
          fill={def.color}
          stroke={isSelected ? '#4169E1' : '#333'}
          strokeWidth={isSelected ? 3 : 1}
        />
        {/* 输出口在中间，箭头指向设备外侧（向右） */}
        <ArrowAtCell cellCol={1} cellRow={0} direction="right" />
        {deviceNameText}
      </Group>
    );
  }

  // 仓库存货口：3x1，输入口在中间（第2个格子，索引1）
  if (device.kind === 'warehouse_input') {
    return (
      <Group
        x={groupX}
        y={groupY}
        rotation={device.rotation}
        offsetX={ox}
        offsetY={oy}
        onClick={handleClick}
        onTap={() => {
          setSelectedDeviceId(device.id);
          setEditModal({ type: 'device', device });
        }}
        listening
      >
        <Rect
          x={0}
          y={0}
          width={rectW}
          height={rectH}
          fill={def.color}
          stroke={isSelected ? '#4169E1' : '#333'}
          strokeWidth={isSelected ? 3 : 1}
        />
        {/* 输入口在中间，箭头指向设备内侧（向右） */}
        <ArrowAtCell cellCol={1} cellRow={0} direction="right" />
        {deviceNameText}
      </Group>
    );
  }

  // 协议核心：9x9，14个输入口（左右各7个）+ 6个输出口（上下各3个）
  if (device.kind === 'protocol_core') {
    return (
      <Group
        x={groupX}
        y={groupY}
        rotation={device.rotation}
        offsetX={ox}
        offsetY={oy}
        onClick={handleClick}
        onTap={() => {
          setSelectedDeviceId(device.id);
          setEditModal({ type: 'device', device });
        }}
        listening
      >
        <Rect
          x={0}
          y={0}
          width={rectW}
          height={rectH}
          fill={def.color}
          stroke={isSelected ? '#4169E1' : '#333'}
          strokeWidth={isSelected ? 3 : 1}
        />
        {/* 左侧7个输入口（行1-7），箭头指向右（向内） */}
        {[1, 2, 3, 4, 5, 6, 7].map((row) => (
          <ArrowAtCell key={`left-${row}`} cellCol={0} cellRow={row} direction="right" />
        ))}
        {/* 右侧7个输入口（行1-7），箭头指向左（向内） */}
        {[1, 2, 3, 4, 5, 6, 7].map((row) => (
          <ArrowAtCell key={`right-${row}`} cellCol={8} cellRow={row} direction="left" />
        ))}
        {/* 上方3个输出口（列1, 4, 7），箭头指向上（向外） */}
        {[1, 4, 7].map((col) => (
          <ArrowAtCell key={`top-${col}`} cellCol={col} cellRow={0} direction="up" />
        ))}
        {/* 下方3个输出口（列1, 4, 7），箭头指向下（向外） */}
        {[1, 4, 7].map((col) => (
          <ArrowAtCell key={`bottom-${col}`} cellCol={col} cellRow={8} direction="down" />
        ))}
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
        stroke={isSelected ? '#4169E1' : '#333'}
        strokeWidth={isSelected ? 3 : 1}
      />
      {Array.from({ length: numPorts }, (_, i) => (
        <ArrowAtCell key={'in-' + i} cellCol={0} cellRow={i} direction="right" />
      ))}
      {Array.from({ length: numPorts }, (_, i) => (
        <ArrowAtCell key={'out-' + i} cellCol={w - 1} cellRow={i} direction="right" />
      ))}
      {deviceNameText}
      {!powered && (
        <Group x={ox} y={oy} offsetX={0} offsetY={0} rotation={-device.rotation}>
          {/* 图标位置在设备顶部中心，相对于设备中心 (ox, oy) 的偏移是 (0, -oy + 14) */}
          <Group x={0} y={-oy + 14}>
            <Circle x={0} y={0} r={14} fill="red" />
            <Line points={[-8, -8, 8, 8]} stroke="white" strokeWidth={3} />
            <Line points={[8, -8, -8, 8]} stroke="white" strokeWidth={3} />
          </Group>
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
