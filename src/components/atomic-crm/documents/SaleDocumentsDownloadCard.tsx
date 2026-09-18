import { Archive } from "lucide-react";
import type { Identifier } from "ra-core";
import { useNotify, useTranslate } from "ra-core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { SaleDocumentRow } from "./SaleDocumentRow";
import { downloadDocumentsArchive } from "./documentFiles";
import { useSaleDocumentSlots } from "./useSaleDocuments";

/**
 * One consultant's papers seen by an administrator: the same per-document
 * actions the consultant has on their own profile — an administrator files a
 * paper handed to them directly — plus the whole set as a single archive.
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
              <SaleDocumentRow
                key={slot.type.id}
                slot={slot}
                salesId={salesId}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
