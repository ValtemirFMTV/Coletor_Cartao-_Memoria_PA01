export function crc16Ccitt(data) {
  let crc = 0xffff;

  for (const byte of data) {
    crc ^= byte << 8;

    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc & 0xffff;
}
