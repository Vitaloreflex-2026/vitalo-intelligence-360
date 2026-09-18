import { useTranslate } from "ra-core";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { PopoverClose } from "@/components/ui/popover";

import { DocumentStatusBadge } from "../documents/DocumentStatusBadge";
import { useFormatDocumentDate } from "../documents/useFormatDocumentDate";
import type { DocumentSlot } from "../documents/saleDocumentStatus";
import { ProfilePage } from "../settings/ProfilePage";

/**
 * One missing or expiring document in the notification panel. Files are only
 * ever uploaded from the consultant's own profile, so the action here is a link
 * there rather than an inline upload.
 */
export const DocumentNotification = ({ slot }: { slot: DocumentSlot }) => {
  const translate = useTranslate();
  const formatDate = useFormatDocumentDate();

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate">{slot.type.label}</span>
          <DocumentStatusBadge slot={slot} />
        </div>
        <p className="text-xs text-muted-foreground">
          {slot.expiresAt
            ? translate("crm.documents.expired_on", {
                date: formatDate(slot.expiresAt),
              })
            : translate("crm.documents.not_filed")}
        </p>
      </div>

      <PopoverClose asChild>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="shrink-0 cursor-pointer"
        >
          <Link to={ProfilePage.path}>
            {translate("crm.documents.actions.file")}
          </Link>
        </Button>
      </PopoverClose>
    </div>
  );
};
