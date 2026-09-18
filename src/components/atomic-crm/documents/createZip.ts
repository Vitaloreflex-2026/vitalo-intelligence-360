/**
 * Minimal ZIP writer, enough to hand a consultant's papers over as one file.
 *
 * Entries are STORED (compression method 0): the payloads are PDFs and photos,
 * which are already compressed, so deflating them would cost CPU for nothing —
 * and storing is the one method every archiver reads without a library.
 */

export type ZipEntry = { name: string; data: Uint8Array };

const LOCAL_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_HEADER_SIGNATURE = 0x02014b50;
const END_OF_DIRECTORY_SIGNATURE = 0x06054b50;
const LOCAL_HEADER_SIZE = 30;
const CENTRAL_HEADER_SIZE = 46;
const END_OF_DIRECTORY_SIZE = 22;
/** Version 2.0, the floor for the features used here. */
const ZIP_VERSION = 20;
/** General-purpose bit 11: file names are UTF-8. */
const UTF8_NAME_FLAG = 0x0800;
const STORED = 0;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index++) {
    crc = CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

/** ZIP stores timestamps in the 1980-epoch MS-DOS packed format. */
const toDosDateTime = (value: Date) => ({
  date:
    ((value.getFullYear() - 1980) << 9) |
    ((value.getMonth() + 1) << 5) |
    value.getDate(),
  time:
    (value.getHours() << 11) |
    (value.getMinutes() << 5) |
    (value.getSeconds() >> 1),
});

export const createZip = (
  entries: ZipEntry[],
  now: Date = new Date(),
): Blob => {
  const encoder = new TextEncoder();
  const { date, time } = toDosDateTime(now);
  const body: Uint8Array[] = [];
  const directory: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new Uint8Array(LOCAL_HEADER_SIZE + name.length);
    const localHeader = new DataView(local.buffer);
    localHeader.setUint32(0, LOCAL_HEADER_SIGNATURE, true);
    localHeader.setUint16(4, ZIP_VERSION, true);
    localHeader.setUint16(6, UTF8_NAME_FLAG, true);
    localHeader.setUint16(8, STORED, true);
    localHeader.setUint16(10, time, true);
    localHeader.setUint16(12, date, true);
    localHeader.setUint32(14, crc, true);
    localHeader.setUint32(18, size, true);
    localHeader.setUint32(22, size, true);
    localHeader.setUint16(26, name.length, true);
    local.set(name, LOCAL_HEADER_SIZE);
    body.push(local, entry.data);

    const central = new Uint8Array(CENTRAL_HEADER_SIZE + name.length);
    const centralHeader = new DataView(central.buffer);
    centralHeader.setUint32(0, CENTRAL_HEADER_SIGNATURE, true);
    centralHeader.setUint16(4, ZIP_VERSION, true);
    centralHeader.setUint16(6, ZIP_VERSION, true);
    centralHeader.setUint16(8, UTF8_NAME_FLAG, true);
    centralHeader.setUint16(10, STORED, true);
    centralHeader.setUint16(12, time, true);
    centralHeader.setUint16(14, date, true);
    centralHeader.setUint32(16, crc, true);
    centralHeader.setUint32(20, size, true);
    centralHeader.setUint32(24, size, true);
    centralHeader.setUint16(28, name.length, true);
    centralHeader.setUint32(42, offset, true);
    central.set(name, CENTRAL_HEADER_SIZE);
    directory.push(central);

    offset += local.length + size;
  }

  const directorySize = directory.reduce(
    (total, header) => total + header.length,
    0,
  );
  const end = new Uint8Array(END_OF_DIRECTORY_SIZE);
  const endHeader = new DataView(end.buffer);
  endHeader.setUint32(0, END_OF_DIRECTORY_SIGNATURE, true);
  endHeader.setUint16(8, entries.length, true);
  endHeader.setUint16(10, entries.length, true);
  endHeader.setUint32(12, directorySize, true);
  endHeader.setUint32(16, offset, true);

  return new Blob([...body, ...directory, end], { type: "application/zip" });
};
