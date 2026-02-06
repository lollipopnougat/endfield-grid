import { create } from 'zustand';
import type {
  EditModalType,
  GridDevice,
  PipelineCell,
  PipelineElement,
  SceneData,
  ToolMode,
  ViewState,
} from '../types';
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from '../constants/grid';
import { nextId } from '../utils/id';
import { nextRotation } from '../utils/grid';
import type { DeviceKind } from '../types';

interface GameState {
  gridCols: number;
  gridRows: number;
  devices: GridDevice[];
  pipelineCells: PipelineCell[];
  pipelineElements: PipelineElement[];
  view: ViewState;
  toolMode: ToolMode;
  editModal: EditModalType;
  /** 移动中的设备 id，下次点击放置 */
  movingDeviceId: string | null;
  /** 移动中的流水线连接元素 id */
  movingPipelineElementId: string | null;
  /** 画布尺寸（用于适配屏幕） */
  stageWidth: number;
  stageHeight: number;

  setGridSize: (cols: number, rows: number) => void;
  addDevice: (device: Omit<GridDevice, 'id'>) => void;
  updateDevice: (id: string, patch: Partial<GridDevice>) => void;
  removeDevice: (id: string) => void;
  setDevicePosition: (id: string, col: number, row: number) => void;
  rotateDevice: (id: string) => void;

  addPipelineCell: (cell: Omit<PipelineCell, 'id'>) => void;
  updatePipelineCell: (id: string, patch: Partial<PipelineCell>) => void;
  removePipelineCell: (id: string) => void;
  removePipelineSegment: (segmentId: string) => void;
  addPipelineElement: (element: Omit<PipelineElement, 'id'>) => void;
  updatePipelineElement: (id: string, patch: Partial<PipelineElement>) => void;
  removePipelineElement: (id: string) => void;

  setView: (v: Partial<ViewState>) => void;
  setToolMode: (mode: ToolMode) => void;
  setEditModal: (modal: EditModalType) => void;
  setMovingDeviceId: (id: string | null) => void;
  setMovingPipelineElementId: (id: string | null) => void;
  setStageSize: (w: number, h: number) => void;
  moveDeviceTo: (id: string, col: number, row: number) => void;
  movePipelineElementTo: (id: string, col: number, row: number) => void;

  placeDevice: (kind: DeviceKind, col: number, row: number) => void;
  getSceneData: () => SceneData;
  loadSceneData: (data: SceneData) => void;
}

const defaultView: ViewState = { scale: 1, x: 0, y: 0 };

export const useGameStore = create<GameState>((set, get) => ({
  gridCols: DEFAULT_GRID_COLS,
  gridRows: DEFAULT_GRID_ROWS,
  devices: [],
  pipelineCells: [],
  pipelineElements: [],
  view: defaultView,
  toolMode: 'select',
  editModal: null,
  movingDeviceId: null,
  movingPipelineElementId: null,
  stageWidth: 800,
  stageHeight: 600,

  setGridSize: (cols, rows) => set({ gridCols: cols, gridRows: rows }),

  addDevice: (device) =>
    set((s) => ({
      devices: [...s.devices, { ...device, id: nextId('dev') }],
    })),
  updateDevice: (id, patch) =>
    set((s) => ({
      devices: s.devices.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    })),
  removeDevice: (id) =>
    set((s) => ({
      devices: s.devices.filter((d) => d.id !== id),
      editModal: s.editModal && (s.editModal as { type: string; device: GridDevice }).device?.id === id ? null : s.editModal,
    })),
  setDevicePosition: (id, col, row) =>
    set((s) => ({
      devices: s.devices.map((d) => (d.id === id ? { ...d, col, row } : d)),
    })),
  rotateDevice: (id) =>
    set((s) => ({
      devices: s.devices.map((d) =>
        d.id === id ? { ...d, rotation: nextRotation(d.rotation) } : d
      ),
    })),

  addPipelineCell: (cell) =>
    set((s) => ({
      pipelineCells: [...s.pipelineCells, { ...cell, id: nextId('pipe') }],
    })),
  updatePipelineCell: (id, patch) =>
    set((s) => ({
      pipelineCells: s.pipelineCells.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  removePipelineCell: (id) =>
    set((s) => ({
      pipelineCells: s.pipelineCells.filter((p) => p.id !== id),
      editModal:
        s.editModal?.type === 'pipeline_cell' && s.editModal.cell.id === id
          ? null
          : s.editModal,
    })),
  removePipelineSegment: (segmentId) =>
    set((s) => ({
      pipelineCells: s.pipelineCells.filter((p) => p.segmentId !== segmentId),
      editModal:
        s.editModal?.type === 'pipeline_cell' &&
        s.editModal.cell.segmentId === segmentId
          ? null
          : s.editModal,
    })),
  addPipelineElement: (el) =>
    set((s) => ({
      pipelineElements: [...s.pipelineElements, { ...el, id: nextId('pel') }],
    })),
  updatePipelineElement: (id, patch) =>
    set((s) => ({
      pipelineElements: s.pipelineElements.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    })),
  removePipelineElement: (id) =>
    set((s) => ({
      pipelineElements: s.pipelineElements.filter((e) => e.id !== id),
      editModal:
        s.editModal?.type === 'pipeline_element' && s.editModal.element.id === id
          ? null
          : s.editModal,
    })),

  setView: (v) => set((s) => ({ view: { ...s.view, ...v } })),
  setToolMode: (mode) => set({ toolMode: mode }),
  setEditModal: (modal) => set({ editModal: modal }),
  setMovingDeviceId: (id) => set({ movingDeviceId: id }),
  setMovingPipelineElementId: (id) => set({ movingPipelineElementId: id }),
  setStageSize: (w, h) => set({ stageWidth: w, stageHeight: h }),
  moveDeviceTo: (id, col, row) =>
    set((s) => {
      const next = s.devices.map((d) => (d.id === id ? { ...d, col, row } : d));
      return { devices: next, movingDeviceId: null };
    }),
  movePipelineElementTo: (id, col, row) =>
    set((s) => ({
      pipelineElements: s.pipelineElements.map((e) =>
        e.id === id ? { ...e, col, row } : e
      ),
      movingPipelineElementId: null,
    })),

  placeDevice: (kind, col, row) => {
    get().addDevice({ kind, col, row, rotation: 0 });
  },

  getSceneData: () => {
    const s = get();
    return {
      version: 1,
      gridCols: s.gridCols,
      gridRows: s.gridRows,
      devices: [...s.devices],
      pipelineCells: [...s.pipelineCells],
      pipelineElements: [...s.pipelineElements],
    };
  },
  loadSceneData: (data) =>
    set({
      gridCols: data.gridCols,
      gridRows: data.gridRows,
      devices: data.devices.map((d) => ({ ...d, id: d.id || nextId('dev') })),
      pipelineCells: data.pipelineCells.map((p) => ({
        ...p,
        id: p.id || nextId('pipe'),
      })),
      pipelineElements: data.pipelineElements.map((e) => ({
        ...e,
        id: e.id || nextId('pel'),
      })),
      editModal: null,
      movingDeviceId: null,
    }),
}));
