import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import styles from './Modal.module.css';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const gridCols = useGameStore((s) => s.gridCols);
  const gridRows = useGameStore((s) => s.gridRows);
  const setGridSize = useGameStore((s) => s.setGridSize);

  const [cols, setCols] = useState(gridCols);
  const [rows, setRows] = useState(gridRows);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCols(gridCols);
     
    setRows(gridRows);
  }, [gridCols, gridRows]);

  const handleOk = () => {
    const c = Math.max(10, Math.min(200, cols));
    const r = Math.max(10, Math.min(200, rows));
    setGridSize(c, r);
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>网格设置</h3>
        <div className={styles.field}>
          <label>宽度（列）</label>
          <input
            type="number"
            min={10}
            max={200}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value) || 70)}
          />
        </div>
        <div className={styles.field}>
          <label>高度（行）</label>
          <input
            type="number"
            min={10}
            max={200}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value) || 70)}
          />
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            取消
          </button>
          <button type="button" onClick={handleOk}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
