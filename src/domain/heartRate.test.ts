import { describe, expect, it } from 'vitest';
import { parseHeartRate } from './heartRate';

const view = (bytes: number[]) => new DataView(new Uint8Array(bytes).buffer);

describe('parseHeartRate', () => {
  it('reads an 8-bit value when flag bit 0 is clear', () => {
    expect(parseHeartRate(view([0x00, 132]))).toBe(132);
  });

  it('reads a little-endian 16-bit value when flag bit 0 is set', () => {
    expect(parseHeartRate(view([0x01, 0x2c, 0x01]))).toBe(300);
  });
});
