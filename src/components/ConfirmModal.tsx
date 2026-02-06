import styles from './Modal.module.css';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p style={{ margin: '0 0 1rem', color: '#ccc' }}>{message}</p>
        <div className={styles.actions}>
          <button type="button" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} className={styles.danger}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
