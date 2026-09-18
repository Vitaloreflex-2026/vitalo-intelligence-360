import { Archive } from "lucide-react";
import type { Identifier } from "ra-core";
import { useNotify, useTranslate } from "ra-core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { DocumentDownloadButton } from "./DocumentDownloadButton";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { useFormatDocumentDate } from "./useFormatDocumentDate";
import { downloadDocumentsArchive } from "./documentFiles";
import { useSaleDocumentSlots } from "./useSaleDocuments";

/**
 * Read-only view of one consultant's papers, for an administrator: every filed
 * document is downloadable on its own, and the whole set as a single archive.
 * Uploading stays on the consultant's own profile.
 */
export const SaleDocumentsDownloadCard = ({
  salesId,
  archiveName,
}: {
  salesId: Identifier;
  archiveName: string;
}) => {
  const translate = useTranslate();
  const notify = useNotify();
  const formatDate = useFormatDocumentDate();
  const { slots, isPending } = useSaleDocumentSlots(salesId);
  const [isArchiving, setArchiving] = useState(false);

  const filedCount = slots.filter((slot) => slot.document).length;

  const handleDownloadAll = async () => {
    setArchiving(true);
    try {
      await downloadDocumentsArchive(slots, archiveName);
    } catch {
      notify("crm.documents.download_error", { type: "error" });
    } finally {
      setArchiving(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-muted-foreground">
            {translate("crm.documents.title_other")}
          </h2>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={isArchiving || filedCount === 0}
            onClick={handleDownloadAll}
          >
            <Archive className="size-4" />
            {translate("crm.documents.actions.download_all")}
          </Button>
        </div>

        {isPending ? null : slots.length === 0 ? (
          <p className="text-sm">{translate("crm.documents.no_types")}</p>
        ) : (
          <ul className="divide-y">
            {slots.map((slot) => (
              <li
                key={slot.type.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {slot.type.label}
                    </span>
                    <DocumentStatusBadge slot={slot} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {slot.document
                      ? translate("crm.documents.filed_on", {
                          date: formatDate(slot.document.created_at),
                        })
                      : translate("crm.documents.not_filed")}
                  </p>
                </div>
                <DocumentDownloadButton slot={slot} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
