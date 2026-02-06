import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { useGameStore } from '../store/useGameStore';
import { GridLayer } from './grid/GridLayer';
import { DevicesLayer } from './devices/DevicesLayer';
import { DevicePreview } from './devices/DevicePreview';
import { PipelineLayer } from './pipeline/PipelineLayer';
import { PipelineElementPreview } from './pipeline/PipelineElementPreview';
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
  /** 放置设备时，鼠标所在格子的预览位置（贴靠网格） */
  const [devicePreviewCell, setDevicePreviewCell] = useState<{ col: number; row: number } | null>(null);
  /** 放置流水线连接元素时，鼠标所在格子的预览位置 */
  const [elementPreviewCell, setElementPreviewCell] = useState<{ col: number; row: number } | null>(null);
  /** 移动设备时，鼠标所在格子的预览位置 */
  const [movingDevicePreviewCell, setMovingDevicePreviewCell] = useState<{ col: number; row: number } | null>(null);
  const {
    view,
    setView,
    setStageSize,
    toolMode,
    setToolMode,
    placeDevice,
    movingDeviceId,
    movingPipelineElementId,
    moveDeviceTo,
    movePipelineElementTo,
    addPipelineCell,
    addPipelineElement,
    updatePipelineCell,
    setSelectedDeviceId,
    setSelectedElementId,
    setMovingPipelineElementId,
    cancelMovingDevice,
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

  useEffect(() => {
    if (typeof toolMode !== 'object' || !('device' in toolMode)) {
      setDevicePreviewCell(null);
    }
    if (typeof toolMode !== 'object' || !('pipelineElement' in toolMode)) {
      setElementPreviewCell(null);
    }
  }, [toolMode]);

  useEffect(() => {
    if (!movingDeviceId) {
      setMovingDevicePreviewCell(null);
    }
  }, [movingDeviceId]);

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
      const isRightClick = 'button' in e.evt && e.evt.button === 2;
      if (isRightClick) {
        if (
          typeof toolMode === 'object' &&
          ('device' in toolMode || 'pipelineElement' in toolMode)
        ) {
          e.evt.preventDefault();
          setToolMode('select');
        }
        if (movingDeviceId) {
          e.evt.preventDefault();
          // 右键退出移动模式时，恢复设备到原位置
          cancelMovingDevice();
        }
        if (movingPipelineElementId) {
          e.evt.preventDefault();
          setMovingPipelineElementId(null);
          setSelectedElementId(null);
        }
        return;
      }
      setSelectedDeviceId(null);
      setSelectedElementId(null);
      if (pipelineDraw) return;
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const [col, row] = getCoordFromPoint(pos, view);
      const state = useGameStore.getState();

      if (movingDeviceId) {
        const device = state.devices.find((d) => d.id === movingDeviceId);
        if (device) {
          // 移动模式下：如果目标位置就是当前位置，直接允许；否则检查是否可以放置
          if (col === device.col && row === device.row) {
            moveDeviceTo(movingDeviceId, col, row);
          } else if (canPlaceDevice(device.kind, col, row, state, movingDeviceId)) {
            moveDeviceTo(movingDeviceId, col, row);
          }
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
      setToolMode,
      setSelectedDeviceId,
      setSelectedElementId,
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

  const handleStageMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const [col, row] = getCoordFromPoint(pos, view);
      const state = useGameStore.getState();

      if (pipelineDraw && toolMode === 'pipeline') {
        setDevicePreviewCell(null);
        setMovingDevicePreviewCell(null);
        handlePipelineMouseMove(e as Konva.KonvaEventObject<MouseEvent>);
        return;
      }

      if (movingDeviceId) {
        setDevicePreviewCell(null);
        setElementPreviewCell(null);
        if (col >= 0 && row >= 0 && col < state.gridCols && row < state.gridRows) {
          setMovingDevicePreviewCell({ col, row });
        } else {
          setMovingDevicePreviewCell(null);
        }
        return;
      }

      if (typeof toolMode === 'object' && 'device' in toolMode) {
        setElementPreviewCell(null);
        setMovingDevicePreviewCell(null);
        if (col >= 0 && row >= 0 && col < state.gridCols && row < state.gridRows) {
          setDevicePreviewCell({ col, row });
        } else {
          setDevicePreviewCell(null);
        }
      } else if (typeof toolMode === 'object' && 'pipelineElement' in toolMode) {
        setDevicePreviewCell(null);
        setMovingDevicePreviewCell(null);
        if (col >= 0 && row >= 0 && col < state.gridCols && row < state.gridRows) {
          setElementPreviewCell({ col, row });
        } else {
          setElementPreviewCell(null);
        }
      } else {
        setDevicePreviewCell(null);
        setElementPreviewCell(null);
        setMovingDevicePreviewCell(null);
      }
    },
    [toolMode, view, pipelineDraw, handlePipelineMouseMove, movingDeviceId]
  );

  const handleStageMouseLeave = useCallback(() => {
    setDevicePreviewCell(null);
    setElementPreviewCell(null);
    setMovingDevicePreviewCell(null);
    setPipelineDraw(null);
  }, []);

  const stageW = useGameStore((s) => s.stageWidth);
  const stageH = useGameStore((s) => s.stageHeight);
  const isPipelineTool = toolMode === 'pipeline';
  const isDevicePlaceMode = typeof toolMode === 'object' && 'device' in toolMode;
  const isElementPlaceMode = typeof toolMode === 'object' && 'pipelineElement' in toolMode;
  const canPlacePreview =
    devicePreviewCell &&
    isDevicePlaceMode &&
    canPlaceDevice(
      toolMode.device,
      devicePreviewCell.col,
      devicePreviewCell.row,
      useGameStore.getState()
    );
  const showDevicePreview = Boolean(canPlacePreview && devicePreviewCell && isDevicePlaceMode);
  const canPlaceElementPreview =
    elementPreviewCell &&
    isElementPlaceMode &&
    canPlacePipelineElement(
      elementPreviewCell.col,
      elementPreviewCell.row,
      useGameStore.getState()
    );
  const showElementPreview = Boolean(
    canPlaceElementPreview && elementPreviewCell && isElementPlaceMode
  );
  const movingDevice = movingDeviceId
    ? useGameStore.getState().devices.find((d) => d.id === movingDeviceId)
    : null;
  const canPlaceMovingDevice =
    movingDevicePreviewCell &&
    movingDevice &&
    canPlaceDevice(
      movingDevice.kind,
      movingDevicePreviewCell.col,
      movingDevicePreviewCell.row,
      useGameStore.getState(),
      movingDeviceId || undefined
    );
  const showMovingDevicePreview = Boolean(
    canPlaceMovingDevice && movingDevicePreviewCell && movingDevice
  );

  const handleContainerContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (
        typeof toolMode === 'object' &&
        ('device' in toolMode || 'pipelineElement' in toolMode)
      ) {
        e.preventDefault();
        setToolMode('select');
      }
    },
    [toolMode, setToolMode]
  );

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
      onContextMenu={handleContainerContextMenu}
    >
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
        onMouseMove={handleStageMouseMove}
        onMouseUp={handlePipelineMouseUp}
        onMouseLeave={handleStageMouseLeave}
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
        {showDevicePreview && devicePreviewCell && isDevicePlaceMode && (
          <Layer listening={false}>
            <DevicePreview
              kind={toolMode.device}
              col={devicePreviewCell.col}
              row={devicePreviewCell.row}
            />
          </Layer>
        )}
        {showElementPreview && elementPreviewCell && isElementPlaceMode && (
          <Layer listening={false}>
            <PipelineElementPreview
              kind={toolMode.pipelineElement}
              col={elementPreviewCell.col}
              row={elementPreviewCell.row}
            />
          </Layer>
        )}
        {showMovingDevicePreview && movingDevicePreviewCell && movingDevice && (
          <Layer listening={false}>
            <DevicePreview
              kind={movingDevice.kind}
              col={movingDevicePreviewCell.col}
              row={movingDevicePreviewCell.row}
            />
          </Layer>
        )}
      </Stage>
    </div>
  );
}
