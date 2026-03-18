import { crc16Ccitt } from './crc16.js';

export const BLE_FRAME = {
  SOF: 0xa5,
  VERSION: 0x01,
  HEADER_SIZE: 8,
  CRC_SIZE: 2,
  TYPE: {
    COMMAND_TEXT: 0x01,
    EVENT_TEXT: 0x02,
    FILE_CHUNK: 0x03,
    ACK: 0x04,
    ERROR: 0x05,
    HEARTBEAT: 0x06
  }
};

export function buildFrame(type, correlationId, payload = new Uint8Array(0), flags = 0x00) {
  const bodyLength = BLE_FRAME.HEADER_SIZE + payload.length;
  const rawNoCrc = new Uint8Array(bodyLength);

  rawNoCrc[0] = BLE_FRAME.SOF;
  rawNoCrc[1] = BLE_FRAME.VERSION;
  rawNoCrc[2] = type;
  rawNoCrc[3] = flags;
  rawNoCrc[4] = correlationId & 0xff;
  rawNoCrc[5] = (correlationId >> 8) & 0xff;
  rawNoCrc[6] = payload.length & 0xff;
  rawNoCrc[7] = (payload.length >> 8) & 0xff;
  rawNoCrc.set(payload, BLE_FRAME.HEADER_SIZE);

  const crc = crc16Ccitt(rawNoCrc);
  const frame = new Uint8Array(rawNoCrc.length + BLE_FRAME.CRC_SIZE);
  frame.set(rawNoCrc, 0);
  frame[rawNoCrc.length] = crc & 0xff;
  frame[rawNoCrc.length + 1] = (crc >> 8) & 0xff;

  return frame;
}

export class BleFrameParser {
  constructor() {
    this.buffer = new Uint8Array(0);
  }

  append(chunk) {
    const merged = new Uint8Array(this.buffer.length + chunk.length);
    merged.set(this.buffer, 0);
    merged.set(chunk, this.buffer.length);
    this.buffer = merged;

    const frames = [];

    while (this.buffer.length >= BLE_FRAME.HEADER_SIZE + BLE_FRAME.CRC_SIZE) {
      const sofIndex = this.buffer.indexOf(BLE_FRAME.SOF);
      if (sofIndex < 0) {
        this.buffer = new Uint8Array(0);
        break;
      }

      if (sofIndex > 0) {
        this.buffer = this.buffer.slice(sofIndex);
      }

      if (this.buffer.length < BLE_FRAME.HEADER_SIZE + BLE_FRAME.CRC_SIZE) {
        break;
      }

      const version = this.buffer[1];
      const type = this.buffer[2];
      const flags = this.buffer[3];
      const correlationId = this.buffer[4] | (this.buffer[5] << 8);
      const payloadLen = this.buffer[6] | (this.buffer[7] << 8);
      const frameLen = BLE_FRAME.HEADER_SIZE + payloadLen + BLE_FRAME.CRC_SIZE;

      if (version !== BLE_FRAME.VERSION) {
        this.buffer = this.buffer.slice(1);
        continue;
      }

      if (this.buffer.length < frameLen) {
        break;
      }

      const frameBytes = this.buffer.slice(0, frameLen);
      const withoutCrc = frameBytes.slice(0, frameLen - BLE_FRAME.CRC_SIZE);
      const crcRx = frameBytes[frameLen - 2] | (frameBytes[frameLen - 1] << 8);
      const crcCalc = crc16Ccitt(withoutCrc);

      if (crcRx !== crcCalc) {
        this.buffer = this.buffer.slice(1);
        continue;
      }

      const payload = frameBytes.slice(BLE_FRAME.HEADER_SIZE, frameLen - BLE_FRAME.CRC_SIZE);
      frames.push({
        type,
        flags,
        correlationId,
        payload
      });

      this.buffer = this.buffer.slice(frameLen);
    }

    return frames;
  }
}
