#!/usr/bin/env node
/* eslint-disable no-console -- CLI script: progress goes to stdout. */
/**
 * Moves user avatars stored inline in `sales.avatar` (a `data:` URL, written
 * before the avatar upload fix) to the attachments bucket, and keeps only the
 * public URL in the row, the shape the app now saves.
 *
 * Dry run by default; pass --apply to write.
 *
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SECRET_KEY=<secret or service_role key> \
 *   node scripts/migrate-inline-avatars.mjs [--apply]
 *
 * ATTACHMENTS_BUCKET overrides the bucket (default "attachments").
 */
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
const BUCKET = process.env.ATTACHMENTS_BUCKET || "attachments";
const isApply = process.argv.includes("--apply");

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SECRET_KEY.");
  process.exit(1);
}

const DATA_URL = /^data:([\w/+.-]+);base64,(.*)$/s;
const EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const { data: sales, error } = await supabase
  .from("sales")
  .select("id, first_name, last_name, avatar")
  .like("avatar->>src", "data:%");

if (error) {
  console.error("Could not read sales:", error.message);
  process.exit(1);
}

console.log(
  `${sales.length} inline avatar(s) found${isApply ? "" : " (dry run, pass --apply to migrate)"}.`,
);

let failures = 0;
for (const sale of sales) {
  const label = `#${sale.id} ${sale.first_name} ${sale.last_name}`;
  const match = DATA_URL.exec(sale.avatar.src);
  if (!match) {
    console.error(`${label}: not a base64 data URL, skipped`);
    failures++;
    continue;
  }
  const [, mimeType, base64] = match;
  const bytes = Buffer.from(base64, "base64");
  const path = `avatar-${sale.id}-${Date.now()}.${EXTENSIONS[mimeType] ?? "bin"}`;
  console.log(
    `${label}: ${(bytes.length / 1024).toFixed(0)} kB ${mimeType} -> ${BUCKET}/${path}`,
  );
  if (!isApply) continue;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: mimeType });
  if (uploadError) {
    console.error(
      `${label}: upload failed, row left untouched: ${uploadError.message}`,
    );
    failures++;
    continue;
  }

  const { data: url } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const avatar = { ...sale.avatar, src: url.publicUrl, path, type: mimeType };
  const { error: updateError } = await supabase
    .from("sales")
    .update({ avatar })
    .eq("id", sale.id);
  if (updateError) {
    console.error(
      `${label}: row update failed (file ${path} uploaded): ${updateError.message}`,
    );
    failures++;
    continue;
  }
  console.log(`${label}: done`);
}

process.exit(failures ? 1 : 0);
