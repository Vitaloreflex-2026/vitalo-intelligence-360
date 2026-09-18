import { describe, expect, it } from "vitest";

import { createZip } from "./createZip";

const EOCD_SIGNATURE = 0x06054b50;
const EOCD_SIZE = 22;
const CENTRAL_HEADER_SIZE = 46;
const LOCAL_HEADER_SIZE = 30;

/**
 * A deliberately naive ZIP reader — the point of these tests is that a reader
 * which knows nothing about how the archive was built can get the files back.
 */
const readZip = (bytes: Uint8Array) => {
  const view = new DataView(bytes.buffer);
  const decoder = new TextDecoder();

  const endOffset = bytes.length - EOCD_SIZE;
  expect(view.getUint32(endOffset, true)).toBe(EOCD_SIGNATURE);
  const entryCount = view.getUint16(endOffset + 10, true);
  let directoryOffset = view.getUint32(endOffset + 16, true);

  const entries: { name: string; content: string }[] = [];
  for (let index = 0; index < entryCount; index++) {
    const nameLength = view.getUint16(directoryOffset + 28, true);
    const size = view.getUint32(directoryOffset + 24, true);
    const localOffset = view.getUint32(directoryOffset + 42, true);
    const name = decoder.decode(
      bytes.slice(
        directoryOffset + CENTRAL_HEADER_SIZE,
        directoryOffset + CENTRAL_HEADER_SIZE + nameLength,
      ),
    );

    const localNameLength = view.getUint16(localOffset + 26, true);
    const dataStart = localOffset + LOCAL_HEADER_SIZE + localNameLength;
    entries.push({
      content: decoder.decode(bytes.slice(dataStart, dataStart + size)),
      name,
    });

    directoryOffset += CENTRAL_HEADER_SIZE + nameLength;
  }
  return entries;
};

const zipToBytes = async (blob: Blob) =>
  new Uint8Array(await blob.arrayBuffer());

const encode = (text: string) => new TextEncoder().encode(text);

describe("createZip", () => {
  it("produces an archive a reader can walk back to the original files", async () => {
    // Arrange
    const entries = [
      { data: encode("carte"), name: "Carte d'identité.pdf" },
      { data: encode("iban"), name: "RIB.pdf" },
    ];

    // Act
    const archive = await zipToBytes(createZip(entries));

    // Assert
    expect(readZip(archive)).toEqual([
      { content: "carte", name: "Carte d'identité.pdf" },
      { content: "iban", name: "RIB.pdf" },
    ]);
  });

  it("stores a checksum a reader can verify", async () => {
    // Arrange — CRC-32 of "hello" is a well-known constant.
    const archive = await zipToBytes(
      createZip([{ data: encode("hello"), name: "a.txt" }]),
    );
    const view = new DataView(archive.buffer);

    // Act
    const crc = view.getUint32(14, true);

    // Assert
    expect(crc).toBe(0x3610a686);
  });

  it("builds a valid, empty archive when there is nothing to pack", async () => {
    // Arrange / Act
    const archive = await zipToBytes(createZip([]));

    // Assert
    expect(archive).toHaveLength(EOCD_SIZE);
    expect(readZip(archive)).toEqual([]);
  });

  it("announces itself as a zip file", () => {
    // Arrange / Act
    const archive = createZip([{ data: encode("x"), name: "x.txt" }]);

    // Assert
    expect(archive.type).toBe("application/zip");
  });
});
