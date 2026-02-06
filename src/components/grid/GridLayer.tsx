import { useMemo } from 'react';
import { Line } from 'react-konva';
import { useGameStore } from '../../store/useGameStore';
import { CELL_SIZE } from '../../constants/grid';
import { DEVICE_DEFS } from '../../constants/devices';

export function GridLayer() {
  const gridCols = useGameStore((s) => s.gridCols);
  const gridRows = useGameStore((s) => s.gridRows);
  const editModal = useGameStore((s) => s.editModal);
  const devices = useGameStore((s) => s.devices);

  const verticalLines = useMemo(() => {
    const out: { key: string; points: number[] }[] = [];
    for (let i = 0; i <= gridCols; i++) {
      out.push({
        key: `v-${i}`,
        points: [i * CELL_SIZE, 0, i * CELL_SIZE, gridRows * CELL_SIZE],
      });
    }
    return out;
  }, [gridCols, gridRows]);

  const horizontalLines = useMemo(() => {
    const out: { key: string; points: number[] }[] = [];
    for (let j = 0; j <= gridRows; j++) {
      out.push({
        key: `h-${j}`,
        points: [0, j * CELL_SIZE, gridCols * CELL_SIZE, j * CELL_SIZE],
      });
    }
    return out;
  }, [gridCols, gridRows]);

  /** 所有供电桩覆盖的格子（去重） */
  const allPoweredCells = useMemo(() => {
    const cellSet = new Set<string>();
    for (const device of devices) {
      const def = DEVICE_DEFS[device.kind];
      if (!def.isPowerSource || def.powerRange == null) continue;
      const [cx, cy] = [device.col + 1, device.row + 1];
      // 12x12 范围：以供电桩中心为中心，左右各6格，上下各6格
      const minC = Math.max(0, cx - 6);
      const maxC = Math.min(gridCols - 1, cx + 5);
      const minR = Math.max(0, cy - 6);
      const maxR = Math.min(gridRows - 1, cy + 5);
      for (let col = minC; col <= maxC; col++) {
        for (let row = minR; row <= maxR; row++) {
          cellSet.add(`${col},${row}`);
        }
      }
    }
    return Array.from(cellSet).map((s) => {
      const [col, row] = s.split(',').map(Number);
      return [col, row] as [number, number];
    });
  }, [devices, gridCols, gridRows]);

  /** 选中供电桩时的范围外描边 */
  const selectedPowerRangeLines = useMemo(() => {
    if (editModal?.type !== 'device') return null;
    const device = editModal.device;
    const def = DEVICE_DEFS[device.kind];
    if (!def.isPowerSource || def.powerRange == null) return null;
    const [cx, cy] = [device.col + 1, device.row + 1];
    // 12x12 范围：以供电桩中心为中心，左右各6格，上下各6格
    const minC = Math.max(0, cx - 6);
    const maxC = Math.min(gridCols - 1, cx + 5);
    const minR = Math.max(0, cy - 6);
    const maxR = Math.min(gridRows - 1, cy + 5);
    const outline: number[] = [];
    const top = minR * CELL_SIZE;
    const bottom = (maxR + 1) * CELL_SIZE;
    const left = minC * CELL_SIZE;
    const right = (maxC + 1) * CELL_SIZE;
    outline.push(left, top, right, top, right, bottom, left, bottom, left, top);
    return outline;
  }, [editModal, gridCols, gridRows]);

  return (
    <>
      {allPoweredCells.map(([col, row]) => (
        <Line
          key={`p-${col}-${row}`}
          points={[
            col * CELL_SIZE,
            row * CELL_SIZE,
            (col + 1) * CELL_SIZE,
            row * CELL_SIZE,
            (col + 1) * CELL_SIZE,
            (row + 1) * CELL_SIZE,
            col * CELL_SIZE,
            (row + 1) * CELL_SIZE,
            col * CELL_SIZE,
            row * CELL_SIZE,
          ]}
          closed
          fill="rgba(144,238,144,0.4)"
          stroke="transparent"
          listening={false}
        />
      ))}
      {selectedPowerRangeLines && (
        <Line
          points={selectedPowerRangeLines}
          stroke="blue"
          strokeWidth={2}
          lineCap="square"
          listening={false}
        />
      )}
      {verticalLines.map(({ key, points }) => (
        <Line
          key={key}
          points={points}
          stroke="rgba(128,128,128,0.5)"
          strokeWidth={1}
          listening={false}
        />
      ))}
      {horizontalLines.map(({ key, points }) => (
        <Line
          key={key}
          points={points}
          stroke="rgba(128,128,128,0.5)"
          strokeWidth={1}
          listening={false}
        />
      ))}
    </>
  );
}
