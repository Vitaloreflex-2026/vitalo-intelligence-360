import { Download } from "lucide-react";
import { useNotify, useTranslate } from "ra-core";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { downloadDocument } from "./documentFiles";
import type { DocumentSlot } from "./saleDocumentStatus";

/** Saves one filed document under its document-type name. */
export const DocumentDownloadButton = ({
  slot,
  variant = "ghost",
  showLabel = false,
}: {
  slot: DocumentSlot;
  variant?: "ghost" | "outline";
  showLabel?: boolean;
}) => {
  const translate = useTranslate();
  const notify = useNotify();
  const [isDownloading, setDownloading] = useState(false);

  if (!slot.document) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadDocument(slot);
    } catch {
      notify("crm.documents.download_error", { type: "error" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={showLabel ? "default" : "icon"}
      className="cursor-pointer"
      disabled={isDownloading}
      onClick={handleDownload}
      aria-label={translate("crm.documents.actions.download")}
    >
      <Download className="size-4" />
      {showLabel && translate("crm.documents.actions.download")}
    </Button>
  );
};
