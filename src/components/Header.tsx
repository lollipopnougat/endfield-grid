import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { CELL_SIZE } from '../constants/grid';
import { SettingsModal } from './SettingsModal';
import { ConfirmModal } from './ConfirmModal';
import { SaveLoad } from './SaveLoad';
import styles from './Header.module.css';

export function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const gridCols = useGameStore((s) => s.gridCols);
  const gridRows = useGameStore((s) => s.gridRows);
  const setView = useGameStore((s) => s.setView);
  const stageWidth = useGameStore((s) => s.stageWidth);
  const stageHeight = useGameStore((s) => s.stageHeight);
  const clearAllDevices = useGameStore((s) => s.clearAllDevices);

  const fitToScreen = () => {
    const contentW = gridCols * CELL_SIZE;
    const contentH = gridRows * CELL_SIZE;
    const scale = Math.min(
      (stageWidth - 40) / contentW,
      (stageHeight - 40) / contentH,
      2,
    );
    const x = (stageWidth - contentW * scale) / 2;
    const y = (stageHeight - contentH * scale) / 2;
    setView({ scale, x, y });
  };

  const handleClearDevices = () => {
    setConfirmOpen(true);
  };

  const handleConfirmClear = () => {
    clearAllDevices();
    setConfirmOpen(false);
  };

  return (
    <div className={styles.header}>
      <span className={styles.title}>流水线布局</span>
      <div className={styles.actions}>
        <button type="button" onClick={fitToScreen}>
          适配屏幕
        </button>
        <button type="button" onClick={() => setSettingsOpen(true)}>
          设置
        </button>
        <button type="button" onClick={handleClearDevices}>
          清空画布
        </button>
        <SaveLoad />
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <ConfirmModal
          open={confirmOpen}
          title="清空画布"
          message="确定要清空画布上的所有设备、流水线和连接元素吗？此操作不可撤销。"
          confirmText="确定"
          cancelText="取消"
          onConfirm={handleConfirmClear}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </div>
  );
}
