import type { RAFile } from "../types";
import { createZip } from "./createZip";
import type { DocumentSlot } from "./saleDocumentStatus";

/** Characters no common file system accepts in a name. */
const ILLEGAL_NAME_CHARACTERS = /[\\/:*?"<>|]/g;

export const sanitizeFileName = (name: string) =>
  name.replace(ILLEGAL_NAME_CHARACTERS, "-").trim();

const extensionOf = (title: string) => {
  const dot = title.lastIndexOf(".");
  return dot > 0 ? title.slice(dot) : "";
};

/**
 * Name a downloaded file after the document TYPE rather than after whatever the
 * consultant called the file on their laptop ("scan_001.pdf"), keeping the
 * original extension so the file still opens.
 */
export const documentFileName = (slot: DocumentSlot) =>
  `${sanitizeFileName(slot.type.label)}${extensionOf(slot.document?.file.title ?? "")}`;

const fetchBytes = async (file: RAFile) => {
  const response = await fetch(file.src);
  if (!response.ok) {
    throw new Error(`Failed to download ${file.title}`);
  }
  return new Uint8Array(await response.arrayBuffer());
};

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Files live in a public storage bucket on another origin, where the `download`
 * attribute of a link is ignored and the browser just opens the PDF. Fetching
 * the bytes first is what actually saves the file under the name we chose.
 */
export const downloadDocument = async (slot: DocumentSlot) => {
  if (!slot.document) return;
  saveBlob(
    new Blob([await fetchBytes(slot.document.file)]),
    documentFileName(slot),
  );
};

export const downloadDocumentsArchive = async (
  slots: DocumentSlot[],
  archiveName: string,
) => {
  const filed = slots.filter((slot) => slot.document);
  if (filed.length === 0) return;
  const entries = await Promise.all(
    filed.map(async (slot) => ({
      name: documentFileName(slot),
      data: await fetchBytes(slot.document!.file),
    })),
  );
  saveBlob(createZip(entries), `${sanitizeFileName(archiveName)}.zip`);
};
