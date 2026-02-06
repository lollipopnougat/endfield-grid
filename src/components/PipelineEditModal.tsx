import { useGameStore } from '../store/useGameStore';
import styles from './Modal.module.css';

export function PipelineEditModal() {
  const editModal = useGameStore((s) => s.editModal);
  const setEditModal = useGameStore((s) => s.setEditModal);
  const removePipelineCell = useGameStore((s) => s.removePipelineCell);
  const removePipelineSegment = useGameStore((s) => s.removePipelineSegment);

  if (editModal?.type !== 'pipeline_cell') return null;
  const { cell } = editModal;

  const handleDeleteCell = () => {
    removePipelineCell(cell.id);
    setEditModal(null);
  };

  const handleDeleteSegment = () => {
    removePipelineSegment(cell.segmentId);
    setEditModal(null);
  };

  return (
    <div className={styles.overlay} onClick={() => setEditModal(null)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>流水线</h3>
        <p className={styles.meta}>
          格子 ({cell.col}, {cell.row})
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={handleDeleteCell} className={styles.danger}>
            删除本格
          </button>
          <button type="button" onClick={handleDeleteSegment} className={styles.danger}>
            删除整条流水线
          </button>
          <button type="button" onClick={() => setEditModal(null)}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
