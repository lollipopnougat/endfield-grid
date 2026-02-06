import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { useGameStore } from '../store/useGameStore';
import { GridLayer } from './grid/GridLayer';
import { DevicesLayer } from './devices/DevicesLayer';
import { PipelineLayer } from './pipeline/PipelineLayer';
import { getCoordFromPoint } from '../utils/canvasCoord';
import { canPlaceDevice, canPlacePipelineElement } from '../utils/placeDevice';
import { getDirection, isAdjacent } from '../utils/pipelineDraw';
import { hasPipelineAt } from '../utils/pipelineDraw';
import { isCellOccupiedByDevice } from '../utils/grid';
import { nextId } from '../utils/id';

type PipelineDrawState = {
  segmentId: string;
  lastCell: { col: number; row: number };
  lastCellId: string;
};

export function GameCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pipelineDraw, setPipelineDraw] = useState<PipelineDrawState | null>(null);
  const {
    view,
    setView,
    setStageSize,
    toolMode,
    placeDevice,
    movingDeviceId,
    movingPipelineElementId,
    moveDeviceTo,
    movePipelineElementTo,
    addPipelineCell,
    addPipelineElement,
    updatePipelineCell,
    devices,
    gridCols,
    gridRows,
  } = useGameStore();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 800, height: 600 };
      setStageSize(width, height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [setStageSize]);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const point = stage.getPointerPosition();
      if (!point) return;
      const scaleBy = 1.1;
      const oldScale = view.scale;
      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      const clamped = Math.max(0.2, Math.min(3, newScale));
      const mousePointTo = {
        x: (point.x - view.x) / oldScale,
        y: (point.y - view.y) / oldScale,
      };
      setView({
        scale: clamped,
        x: point.x - mousePointTo.x * clamped,
        y: point.y - mousePointTo.y * clamped,
      });
    },
    [view, setView]
  );

  const handleStageDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      setView({ x: e.target.x(), y: e.target.y() });
    },
    [setView]
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (e.target.getType() !== 'Stage') return;
      if (pipelineDraw) return;
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const [col, row] = getCoordFromPoint(pos, view);
      const state = useGameStore.getState();

      if (movingDeviceId) {
        const device = state.devices.find((d) => d.id === movingDeviceId);
        if (device && canPlaceDevice(device.kind, col, row, state, movingDeviceId)) {
          moveDeviceTo(movingDeviceId, col, row);
        }
        return;
      }
      if (movingPipelineElementId) {
        if (canPlacePipelineElement(col, row, state, movingPipelineElementId)) {
          movePipelineElementTo(movingPipelineElementId, col, row);
        }
        return;
      }

      if (toolMode === 'select' || toolMode === 'pipeline') return;
      if (typeof toolMode === 'object' && 'pipelineElement' in toolMode) {
        if (canPlacePipelineElement(col, row, state)) {
          addPipelineElement({
            kind: toolMode.pipelineElement,
            col,
            row,
            rotation: 0,
          });
        }
        return;
      }
      const kind = toolMode.device;
      if (canPlaceDevice(kind, col, row, state)) {
        placeDevice(kind, col, row);
      }
    },
    [
      toolMode,
      view,
      placeDevice,
      movingDeviceId,
      movingPipelineElementId,
      moveDeviceTo,
      movePipelineElementTo,
      pipelineDraw,
      addPipelineElement,
    ]
  );

  const handlePipelineMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target.getType() !== 'Stage' || toolMode !== 'pipeline') return;
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const [col, row] = getCoordFromPoint(pos, view);
      if (col < 0 || row < 0 || col >= gridCols || row >= gridRows) return;
      if (isCellOccupiedByDevice(col, row, devices)) return;
      const segmentId = nextId('seg');
      addPipelineCell({
        col,
        row,
        direction: 'right',
        segmentId,
      });
      const state = useGameStore.getState();
      const added = state.pipelineCells.find(
        (p) => p.segmentId === segmentId && p.col === col && p.row === row
      );
      if (added) setPipelineDraw({ segmentId, lastCell: { col, row }, lastCellId: added.id });
    },
    [toolMode, view, gridCols, gridRows, devices, addPipelineCell]
  );

  const handlePipelineMouseMove = useCallback(
    (_e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!pipelineDraw || toolMode !== 'pipeline') return;
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const [col, row] = getCoordFromPoint(pos, view);
      if (col < 0 || row < 0 || col >= gridCols || row >= gridRows) return;
      if (isCellOccupiedByDevice(col, row, devices)) return;
      if (!isAdjacent(pipelineDraw.lastCell, { col, row })) return;
      const state = useGameStore.getState();
      const alreadyInSegment = state.pipelineCells.some(
        (p) =>
          p.segmentId === pipelineDraw.segmentId && p.col === col && p.row === row
      );
      if (alreadyInSegment) {
        const existing = state.pipelineCells.find(
          (p) =>
            p.segmentId === pipelineDraw.segmentId && p.col === col && p.row === row
        );
        if (existing) {
          setPipelineDraw({
            segmentId: pipelineDraw.segmentId,
            lastCell: { col, row },
            lastCellId: existing.id,
          });
        }
        return;
      }
      const dir = getDirection(pipelineDraw.lastCell, { col, row });
      updatePipelineCell(pipelineDraw.lastCellId, { direction: dir });
      if (hasPipelineAt(col, row, state.pipelineCells)) {
        const hasBridge = state.pipelineElements.some(
          (el) => el.kind === 'cross_bridge' && el.col === col && el.row === row
        );
        if (!hasBridge) {
          addPipelineElement({ kind: 'cross_bridge', col, row, rotation: 0 });
        }
      }
      addPipelineCell({
        col,
        row,
        direction: dir,
        segmentId: pipelineDraw.segmentId,
      });
      const nextState = useGameStore.getState();
      const added = nextState.pipelineCells.find(
        (p) => p.segmentId === pipelineDraw.segmentId && p.col === col && p.row === row
      );
      if (added) {
        setPipelineDraw({
          segmentId: pipelineDraw.segmentId,
          lastCell: { col, row },
          lastCellId: added.id,
        });
      }
    },
    [
      pipelineDraw,
      toolMode,
      view,
      gridCols,
      gridRows,
      devices,
      addPipelineCell,
      addPipelineElement,
      updatePipelineCell,
    ]
  );

  const handlePipelineMouseUp = useCallback(() => {
    setPipelineDraw(null);
  }, []);

  const stageW = useGameStore((s) => s.stageWidth);
  const stageH = useGameStore((s) => s.stageHeight);
  const isPipelineTool = toolMode === 'pipeline';

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Stage
        ref={stageRef}
        width={stageW}
        height={stageH}
        scaleX={view.scale}
        scaleY={view.scale}
        x={view.x}
        y={view.y}
        draggable={!isPipelineTool}
        onWheel={handleWheel}
        onDragEnd={handleStageDragEnd}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onMouseDown={handlePipelineMouseDown}
        onMouseMove={handlePipelineMouseMove}
        onMouseUp={handlePipelineMouseUp}
        onMouseLeave={() => setPipelineDraw(null)}
        dragBoundFunc={(pos) => ({ ...pos })}
      >
        <Layer>
          <GridLayer />
        </Layer>
        <Layer>
          <DevicesLayer />
        </Layer>
        <Layer>
          <PipelineLayer />
        </Layer>
      </Stage>
    </div>
  );
}
