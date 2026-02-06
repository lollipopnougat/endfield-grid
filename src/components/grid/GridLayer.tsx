import { useMemo } from 'react';
import { Line } from 'react-konva';
import { useGameStore } from '../../store/useGameStore';
import { CELL_SIZE } from '../../constants/grid';
import { DEVICE_DEFS } from '../../constants/devices';

export function GridLayer() {
  const gridCols = useGameStore((s) => s.gridCols);
  const gridRows = useGameStore((s) => s.gridRows);
  const editModal = useGameStore((s) => s.editModal);

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

  const powerRangeLines = useMemo(() => {
    if (editModal?.type !== 'device') return null;
    const device = editModal.device;
    const def = DEVICE_DEFS[device.kind];
    if (!def.isPowerSource || def.powerRange == null) return null;
    const [cx, cy] = [device.col + 1, device.row + 1];
    const r = def.powerRange;
    const minC = Math.max(0, cx - r);
    const maxC = Math.min(gridCols - 1, cx + r);
    const minR = Math.max(0, cy - r);
    const maxR = Math.min(gridRows - 1, cy + r);
    const outline: number[] = [];
    const top = minR * CELL_SIZE;
    const bottom = (maxR + 1) * CELL_SIZE;
    const left = minC * CELL_SIZE;
    const right = (maxC + 1) * CELL_SIZE;
    outline.push(left, top, right, top, right, bottom, left, bottom, left, top);
    return outline;
  }, [editModal, gridCols, gridRows]);

  const poweredCells = useMemo(() => {
    if (editModal?.type !== 'device') return null;
    const device = editModal.device;
    const def = DEVICE_DEFS[device.kind];
    if (!def.isPowerSource || def.powerRange == null) return null;
    const [cx, cy] = [device.col + 1, device.row + 1];
    const r = def.powerRange;
    const cells: [number, number][] = [];
    for (let col = Math.max(0, cx - r); col <= Math.min(gridCols - 1, cx + r); col++) {
      for (let row = Math.max(0, cy - r); row <= Math.min(gridRows - 1, cy + r); row++) {
        cells.push([col, row]);
      }
    }
    return cells;
  }, [editModal, gridCols, gridRows]);

  return (
    <>
      {poweredCells?.map(([col, row]) => (
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
      {powerRangeLines && (
        <Line
          points={powerRangeLines}
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
