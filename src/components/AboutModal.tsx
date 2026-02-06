import styles from './Modal.module.css';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>关于</h3>
        <div style={{ marginBottom: '1rem', color: '#ccc' }}>
          <p style={{ margin: '0 0 0.5rem' }}>作者：lollipopnougat</p>
          <p style={{ margin: 0 }}>
            GitHub:{' '}
            <a
              href="https://github.com/lollipopnougat"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4a9eff', textDecoration: 'none' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              https://github.com/lollipopnougat
            </a>
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
