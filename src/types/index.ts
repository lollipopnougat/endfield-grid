/** 设备尺寸类型 */
export type DeviceSize = '2x2' | '3x3' | '4x6' | '6x6';

/** 设备类型 ID */
export type DeviceKind =
  | 'power_station'   // 供电桩
  | 'heat_pool'       // 热能池
  | 'refinery'        // 精炼炉
  | 'crusher'         // 粉碎机
  | 'parts_machine'   // 配件机
  | 'shaping_machine' // 塑形机
  | 'equipment_origin' // 装备原件机
  | 'filler'         // 灌装机
  | 'packager'       // 封装机
  | 'grinder'        // 研磨机
  | 'disassembler'   // 拆解机
  | 'seed_collector' // 采种机
  | 'planter'        // 种植机
  | 'reactor'        // 反应池
  | 'furnace';       // 天有洪炉

/** 旋转角度 0|90|180|270 */
export type Rotation = 0 | 90 | 180 | 270;

/** 网格上的设备 */
export interface GridDevice {
  id: string;
  kind: DeviceKind;
  /** 左上角格子坐标 (col, row) */
  col: number;
  row: number;
  rotation: Rotation;
}

/** 流水线单格 */
export interface PipelineCell {
  id: string;
  col: number;
  row: number;
  /** 箭头方向: 'up'|'down'|'left'|'right' */
  direction: 'up' | 'down' | 'left' | 'right';
  /** 所属线段 id，用于「删除整条流水线」 */
  segmentId: string;
}

/** 流水线连接元素类型 */
export type PipelineElementKind = 'cross_bridge' | 'splitter' | 'merger';

/** 流水线连接装置（1x1） */
export interface PipelineElement {
  id: string;
  kind: PipelineElementKind;
  col: number;
  row: number;
  rotation: Rotation;
}

/** 当前选中的工具 */
export type ToolMode =
  | 'select'
  | 'pipeline'
  | { device: DeviceKind }
  | { pipelineElement: PipelineElementKind };

/** 编辑弹窗类型 */
export type EditModalType =
  | null
  | { type: 'device'; device: GridDevice }
  | { type: 'pipeline_cell'; cell: PipelineCell }
  | { type: 'pipeline_element'; element: PipelineElement };

/** 视图状态 */
export interface ViewState {
  scale: number;
  x: number;
  y: number;
}

/** 保存/加载用的完整场景数据 */
export interface SceneData {
  version: number;
  gridCols: number;
  gridRows: number;
  devices: GridDevice[];
  pipelineCells: PipelineCell[];
  pipelineElements: PipelineElement[];
}
