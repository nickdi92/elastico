import { parseHeartRate } from '../domain/heartRate';

/* Tipi minimi di Web Bluetooth: non sono ancora nella libreria DOM di TypeScript. */
interface BleCharacteristic extends EventTarget {
  value?: DataView;
  startNotifications(): Promise<BleCharacteristic>;
}
interface BleDevice extends EventTarget {
  name?: string;
  gatt?: {
    connected: boolean;
    connect(): Promise<{
      getPrimaryService(s: string): Promise<{ getCharacteristic(c: string): Promise<BleCharacteristic> }>;
    }>;
    disconnect(): void;
  };
}
interface BleNavigator {
  bluetooth?: { requestDevice(o: { filters: { services: string[] }[] }): Promise<BleDevice> };
}

export type HrStatus = 'unsupported' | 'idle' | 'connecting' | 'connected' | 'error';

export interface HrSnapshot {
  status: HrStatus;
  bpm?: number;
  deviceName?: string;
  error?: string;
}

type Listener = (s: HrSnapshot) => void;

let snapshot: HrSnapshot = {
  status: typeof navigator !== 'undefined' && (navigator as BleNavigator).bluetooth ? 'idle' : 'unsupported',
};
let device: BleDevice | null = null;
const listeners = new Set<Listener>();

function set(next: Partial<HrSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l(snapshot));
}

export function hrSnapshot(): HrSnapshot {
  return snapshot;
}

export function subscribeHr(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Va chiamato da un tocco dell'utente: il browser mostra la scelta del dispositivo. */
export async function connectHr(): Promise<void> {
  const bt = (navigator as BleNavigator).bluetooth;
  if (!bt) return set({ status: 'unsupported' });
  try {
    set({ status: 'connecting', error: undefined });
    device = await bt.requestDevice({ filters: [{ services: ['heart_rate'] }] });
    device.addEventListener('gattserverdisconnected', () => set({ status: 'idle', bpm: undefined }));
    const server = await device.gatt!.connect();
    const service = await server.getPrimaryService('heart_rate');
    const ch = await service.getCharacteristic('heart_rate_measurement');
    ch.addEventListener('characteristicvaluechanged', () => {
      if (ch.value) set({ bpm: parseHeartRate(ch.value) });
    });
    await ch.startNotifications();
    set({ status: 'connected', deviceName: device.name ?? 'Cardiofrequenzimetro' });
  } catch (e) {
    const cancelled = e instanceof DOMException && e.name === 'NotFoundError';
    set({ status: cancelled ? 'idle' : 'error', error: cancelled ? undefined : 'Collegamento non riuscito. Riprova.' });
  }
}

export function disconnectHr(): void {
  device?.gatt?.disconnect();
  device = null;
  set({ status: 'idle', bpm: undefined, deviceName: undefined });
}
