import { useGetIdentity, useTranslate } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

import { SaleDocumentRow } from "./SaleDocumentRow";
import { useSaleDocumentSlots } from "./useSaleDocuments";

/**
 * The administrative papers the signed-in consultant must file, on their own
 * profile page. Nobody files them for someone else: row-level security only
 * lets a consultant write their own, and administrators read them.
 */
export const SaleDocumentsCard = () => {
  const translate = useTranslate();
  const { identity } = useGetIdentity();
  const { slots, isPending } = useSaleDocumentSlots(identity?.id);

  if (!identity) return null;

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.documents.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {translate("crm.documents.hint")}
        </p>
        {isPending ? null : slots.length === 0 ? (
          <p className="text-sm">{translate("crm.documents.no_types")}</p>
        ) : (
          <ul className="divide-y">
            {slots.map((slot) => (
              <SaleDocumentRow
                key={slot.type.id}
                slot={slot}
                salesId={identity.id}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
