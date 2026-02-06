import { useGameStore } from '../../store/useGameStore';
import { DeviceRect } from './DeviceRect';

export function DevicesLayer() {
  const devices = useGameStore((s) => s.devices);
  const movingDeviceId = useGameStore((s) => s.movingDeviceId);
  // 过滤掉正在移动的设备，防止点击到原设备
  const visibleDevices = devices.filter((d) => d.id !== movingDeviceId);
  return (
    <>
      {visibleDevices.map((d) => (
        <DeviceRect key={d.id} device={d} />
      ))}
    </>
  );
}
