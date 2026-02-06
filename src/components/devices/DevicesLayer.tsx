import { useGameStore } from '../../store/useGameStore';
import { DeviceRect } from './DeviceRect';

export function DevicesLayer() {
  const devices = useGameStore((s) => s.devices);
  return (
    <>
      {devices.map((d) => (
        <DeviceRect key={d.id} device={d} />
      ))}
    </>
  );
}
