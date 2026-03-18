export class WebSerialAdapter {
  constructor() {
    this.type = 'serial';
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.onBytes = null;
    this.readLoopRunning = false;
  }

  isSupported() {
    return 'serial' in navigator;
  }

  async connect() {
    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: 115200 });
    this.writer = this.port.writable.getWriter();
    this.reader = this.port.readable.getReader();

    this.port.addEventListener('disconnect', () => {
      this.disconnect();
    });

    this.startReadLoop();
    return { transport: this.type };
  }

  onData(callback) {
    this.onBytes = callback;
  }

  async send(command) {
    const payload = new TextEncoder().encode(command + '\n');
    await this.writer.write(payload);
  }

  async disconnect() {
    this.readLoopRunning = false;

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (err) {
        // Reader may already be closed.
      }
      this.reader.releaseLock();
      this.reader = null;
    }

    if (this.writer) {
      this.writer.releaseLock();
      this.writer = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch (err) {
        // Port may already be closed.
      }
      this.port = null;
    }
  }

  async startReadLoop() {
    this.readLoopRunning = true;

    try {
      while (this.readLoopRunning && this.reader) {
        const { value, done } = await this.reader.read();
        if (done) {
          break;
        }

        if (value && this.onBytes) {
          this.onBytes(value);
        }
      }
    } catch (err) {
      // Errors are handled in app layer by transport disconnect behavior.
    } finally {
      if (this.reader) {
        this.reader.releaseLock();
        this.reader = null;
      }
    }
  }
}
