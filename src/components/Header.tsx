import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { CELL_SIZE } from '../constants/grid';
import { SettingsModal } from './SettingsModal';
import { SaveLoad } from './SaveLoad';
import styles from './Header.module.css';

export function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const gridCols = useGameStore((s) => s.gridCols);
  const gridRows = useGameStore((s) => s.gridRows);
  const setView = useGameStore((s) => s.setView);
  const stageWidth = useGameStore((s) => s.stageWidth);
  const stageHeight = useGameStore((s) => s.stageHeight);

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
        <SaveLoad />
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </div>
  );
}
