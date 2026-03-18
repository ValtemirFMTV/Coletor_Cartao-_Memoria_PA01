import { BLE_CONFIG } from '../config/ble.js';
import { BLE_FRAME, BleFrameParser, buildFrame } from '../protocol/bleFrame.js';

export class WebBluetoothAdapter {
  constructor() {
    this.type = 'ble';
    this.device = null;
    this.server = null;
    this.service = null;
    this.commandCharacteristic = null;
    this.dataCharacteristic = null;
    this.onBytes = null;
    this.onDisconnected = null;
    this.frameParser = new BleFrameParser();
    this.protocolMode = 'unknown';
    this.correlationId = 1;
    this.textDecoder = new TextDecoder();
    this.textEncoder = new TextEncoder();
    this.boundValueChanged = this.handleValueChanged.bind(this);
    this.boundDisconnected = this.handleDisconnected.bind(this);
  }

  isSupported() {
    return 'bluetooth' in navigator;
  }

  async connect() {
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [BLE_CONFIG.serviceUuid] }],
      optionalServices: [BLE_CONFIG.serviceUuid]
    });

    this.device.addEventListener('gattserverdisconnected', this.boundDisconnected);

    this.server = await this.device.gatt.connect();
    this.service = await this.server.getPrimaryService(BLE_CONFIG.serviceUuid);

    this.commandCharacteristic = await this.service.getCharacteristic(BLE_CONFIG.commandCharacteristicUuid);
    this.dataCharacteristic = await this.service.getCharacteristic(BLE_CONFIG.dataCharacteristicUuid);

    await this.dataCharacteristic.startNotifications();
    this.dataCharacteristic.addEventListener('characteristicvaluechanged', this.boundValueChanged);

    return { transport: this.type, deviceName: this.device.name || 'PA01' };
  }

  onData(callback) {
    this.onBytes = callback;
  }

  onDisconnect(callback) {
    this.onDisconnected = callback;
  }

  async send(command) {
    if (this.protocolMode === 'frame') {
      const payload = this.textEncoder.encode(command);
      const frame = buildFrame(BLE_FRAME.TYPE.COMMAND_TEXT, this.nextCorrelationId(), payload, 0x00);
      await this.write(frame);
      return;
    }

    const payload = this.textEncoder.encode(command + '\n');
    await this.write(payload);
  }

  async disconnect() {
    if (this.dataCharacteristic) {
      this.dataCharacteristic.removeEventListener('characteristicvaluechanged', this.boundValueChanged);
      this.dataCharacteristic = null;
    }

    if (this.device) {
      this.device.removeEventListener('gattserverdisconnected', this.boundDisconnected);
    }

    if (this.server && this.server.connected) {
      this.server.disconnect();
    }

    this.commandCharacteristic = null;
    this.service = null;
    this.server = null;
    this.device = null;
  }

  handleValueChanged(event) {
    const value = event.target.value;
    const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    this.routeIncoming(bytes);
  }

  handleDisconnected() {
    if (this.onDisconnected) {
      this.onDisconnected();
    }
  }

  async write(payload) {
    if (this.commandCharacteristic.writeValueWithoutResponse) {
      await this.commandCharacteristic.writeValueWithoutResponse(payload);
      return;
    }

    await this.commandCharacteristic.writeValue(payload);
  }

  routeIncoming(bytes) {
    if (!this.onBytes) {
      return;
    }

    if (this.protocolMode !== 'text') {
      const frames = this.frameParser.append(bytes);
      if (frames.length > 0) {
        this.protocolMode = 'frame';
        for (const frame of frames) {
          this.dispatchFrame(frame);
        }
        return;
      }

      if (this.protocolMode === 'unknown' && bytes[0] !== BLE_FRAME.SOF) {
        this.protocolMode = 'text';
      }
    }

    this.onBytes(bytes);
  }

  dispatchFrame(frame) {
    switch (frame.type) {
      case BLE_FRAME.TYPE.EVENT_TEXT: {
        const text = this.textDecoder.decode(frame.payload);
        const payload = this.textEncoder.encode(text + '\n');
        this.onBytes(payload);
        break;
      }
      case BLE_FRAME.TYPE.FILE_CHUNK:
        this.onBytes(frame.payload);
        break;
      case BLE_FRAME.TYPE.ACK: {
        const text = 'ACK ' + frame.correlationId;
        this.onBytes(this.textEncoder.encode(text + '\n'));
        break;
      }
      case BLE_FRAME.TYPE.ERROR: {
        const text = this.textDecoder.decode(frame.payload);
        const payload = this.textEncoder.encode('ERRO ' + text + '\n');
        this.onBytes(payload);
        break;
      }
      default:
        break;
    }
  }

  nextCorrelationId() {
    this.correlationId = (this.correlationId + 1) & 0xffff;
    if (this.correlationId === 0) {
      this.correlationId = 1;
    }
    return this.correlationId;
  }
}
