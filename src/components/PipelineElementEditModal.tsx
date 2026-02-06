import { useGameStore } from '../store/useGameStore';
import { nextRotation } from '../utils/grid';
import styles from './Modal.module.css';

const ELEMENT_NAMES: Record<string, string> = {
  cross_bridge: '流水线交叉桥',
  splitter: '流水线分流器',
  merger: '流水线合流器',
};

export function PipelineElementEditModal() {
  const editModal = useGameStore((s) => s.editModal);
  const setEditModal = useGameStore((s) => s.setEditModal);
  const updatePipelineElement = useGameStore((s) => s.updatePipelineElement);
  const removePipelineElement = useGameStore((s) => s.removePipelineElement);
  const setMovingPipelineElementId = useGameStore((s) => s.setMovingPipelineElementId);

  if (editModal?.type !== 'pipeline_element') return null;
  const { element } = editModal;
  const name = ELEMENT_NAMES[element.kind] ?? element.kind;

  const handleMove = () => {
    setMovingPipelineElementId(element.id);
    setEditModal(null);
  };

  const handleRotate = () => {
    updatePipelineElement(element.id, { rotation: nextRotation(element.rotation) });
  };

  const handleDelete = () => {
    removePipelineElement(element.id);
    setEditModal(null);
  };

  return (
    <div className={styles.overlay} onClick={() => setEditModal(null)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{name}</h3>
        <p className={styles.meta}>
          位置: ({element.col}, {element.row})
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={handleMove}>
            移动
          </button>
          <button type="button" onClick={handleRotate}>
            旋转
          </button>
          <button type="button" onClick={handleDelete} className={styles.danger}>
            删除
          </button>
          <button type="button" onClick={() => setEditModal(null)}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
