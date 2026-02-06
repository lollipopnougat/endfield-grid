import { useGameStore } from '../store/useGameStore';
import {
  DEVICE_DEFS,
  DEVICES_2X2,
  DEVICES_3X1,
  DEVICES_3X3,
  DEVICES_4X6,
  DEVICES_6X6,
  DEVICES_9X9,
} from '../constants/devices';
import type { DeviceKind } from '../types';
import type { PipelineElementKind } from '../types';
import styles from './Toolbar.module.css';

const PIPELINE_ELEMENT_NAMES: Record<PipelineElementKind, string> = {
  cross_bridge: '交叉桥',
  splitter: '分流器',
  merger: '合流器',
};

export function Toolbar() {
  const toolMode = useGameStore((s) => s.toolMode);
  const setToolMode = useGameStore((s) => s.setToolMode);

  const isDeviceSelected = (kind: DeviceKind) =>
    toolMode !== 'select' &&
    toolMode !== 'pipeline' &&
    typeof toolMode === 'object' &&
    'device' in toolMode &&
    toolMode.device === kind;

  const isElementSelected = (kind: PipelineElementKind) =>
    typeof toolMode === 'object' &&
    'pipelineElement' in toolMode &&
    toolMode.pipelineElement === kind;

  return (
    <div className={styles.toolbar}>
      <div className={styles.section}>
        <span className={styles.label}>选择</span>
        <button
          className={toolMode === 'select' ? styles.active : ''}
          onClick={() => setToolMode('select')}
        >
          选择
        </button>
      </div>
      <div className={styles.section}>
        <span className={styles.label}>流水线</span>
        <button
          className={toolMode === 'pipeline' ? styles.active : ''}
          onClick={() => setToolMode('pipeline')}
        >
          流水线
        </button>
      </div>
      <div className={styles.section}>
        <span className={styles.label}>连接</span>
        {(['cross_bridge', 'splitter', 'merger'] as PipelineElementKind[]).map((kind) => (
          <button
            key={kind}
            className={isElementSelected(kind) ? styles.active : ''}
            onClick={() => setToolMode({ pipelineElement: kind })}
            title={PIPELINE_ELEMENT_NAMES[kind]}
          >
            {PIPELINE_ELEMENT_NAMES[kind]}
          </button>
        ))}
      </div>
      <div className={styles.section}>
        <span className={styles.label}>2×2</span>
        {DEVICES_2X2.map((kind) => (
          <button
            key={kind}
            className={isDeviceSelected(kind) ? styles.active : ''}
            onClick={() => setToolMode({ device: kind })}
            title={DEVICE_DEFS[kind].name}
          >
            {DEVICE_DEFS[kind].name}
          </button>
        ))}
      </div>
      <div className={styles.section}>
        <span className={styles.label}>3×1</span>
        {DEVICES_3X1.map((kind) => (
          <button
            key={kind}
            className={isDeviceSelected(kind) ? styles.active : ''}
            onClick={() => setToolMode({ device: kind })}
            title={DEVICE_DEFS[kind].name}
          >
            {DEVICE_DEFS[kind].name}
          </button>
        ))}
      </div>
      <div className={styles.section}>
        <span className={styles.label}>3×3</span>
        {DEVICES_3X3.map((kind) => (
          <button
            key={kind}
            className={isDeviceSelected(kind) ? styles.active : ''}
            onClick={() => setToolMode({ device: kind })}
            title={DEVICE_DEFS[kind].name}
          >
            {DEVICE_DEFS[kind].name}
          </button>
        ))}
      </div>
      <div className={styles.section}>
        <span className={styles.label}>4×6</span>
        {DEVICES_4X6.map((kind) => (
          <button
            key={kind}
            className={isDeviceSelected(kind) ? styles.active : ''}
            onClick={() => setToolMode({ device: kind })}
            title={DEVICE_DEFS[kind].name}
          >
            {DEVICE_DEFS[kind].name}
          </button>
        ))}
      </div>
      <div className={styles.section}>
        <span className={styles.label}>6×6</span>
        {DEVICES_6X6.map((kind) => (
          <button
            key={kind}
            className={isDeviceSelected(kind) ? styles.active : ''}
            onClick={() => setToolMode({ device: kind })}
            title={DEVICE_DEFS[kind].name}
          >
            {DEVICE_DEFS[kind].name}
          </button>
        ))}
      </div>
      <div className={styles.section}>
        <span className={styles.label}>9×9</span>
        {DEVICES_9X9.map((kind) => (
          <button
            key={kind}
            className={isDeviceSelected(kind) ? styles.active : ''}
            onClick={() => setToolMode({ device: kind })}
            title={DEVICE_DEFS[kind].name}
          >
            {DEVICE_DEFS[kind].name}
          </button>
        ))}
      </div>
    </div>
  );
}
