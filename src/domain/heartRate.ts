/** Decodifica la caratteristica Bluetooth "Heart Rate Measurement" (0x2A37). */
export function parseHeartRate(view: DataView): number {
  const flags = view.getUint8(0);
  return flags & 0x01 ? view.getUint16(1, true) : view.getUint8(1);
}
