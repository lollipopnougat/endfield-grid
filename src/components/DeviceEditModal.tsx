import { useGameStore } from '../store/useGameStore';
import { DEVICE_DEFS } from '../constants/devices';
import styles from './Modal.module.css';

export function DeviceEditModal() {
  const editModal = useGameStore((s) => s.editModal);
  const setEditModal = useGameStore((s) => s.setEditModal);
  const removeDevice = useGameStore((s) => s.removeDevice);
  const rotateDevice = useGameStore((s) => s.rotateDevice);
  const setMovingDeviceId = useGameStore((s) => s.setMovingDeviceId);

  if (editModal?.type !== 'device') return null;
  const { device } = editModal;
  const def = DEVICE_DEFS[device.kind];

  const handleDelete = () => {
    removeDevice(device.id);
    setEditModal(null);
  };

  const handleMove = () => {
    setMovingDeviceId(device.id);
    setEditModal(null);
  };

  const handleRotate = () => {
    rotateDevice(device.id);
  };

  return (
    <div className={styles.overlay} onClick={() => setEditModal(null)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{def.name}</h3>
        <p className={styles.meta}>
          位置: ({device.col}, {device.row}) · 旋转: {device.rotation}°
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
