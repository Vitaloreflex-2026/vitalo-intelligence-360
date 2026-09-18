import { useTranslate } from "ra-core";
import { Badge } from "@/components/ui/badge";

import type { DocumentSlot, DocumentStatus } from "./saleDocumentStatus";
import { useFormatDocumentDate } from "./useFormatDocumentDate";

const VARIANT_BY_STATUS: Record<
  DocumentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  missing: "outline",
  expired: "destructive",
  expiring: "destructive",
  valid: "secondary",
};

/** Where a document stands: missing, expired, due for renewal, or up to date. */
export const DocumentStatusBadge = ({ slot }: { slot: DocumentSlot }) => {
  const translate = useTranslate();
  const formatDate = useFormatDocumentDate();

  return (
    <Badge variant={VARIANT_BY_STATUS[slot.status]} className="shrink-0">
      {slot.status === "expiring" && slot.expiresAt
        ? translate("crm.documents.status.expiring_on", {
            date: formatDate(slot.expiresAt),
          })
        : translate(`crm.documents.status.${slot.status}`)}
    </Badge>
  );
};
