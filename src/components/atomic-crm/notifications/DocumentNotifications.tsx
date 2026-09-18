import { useTranslate } from "ra-core";

import type { DocumentSlot } from "../documents/saleDocumentStatus";
import { DocumentNotification } from "./DocumentNotification";
import { NotificationSection } from "./NotificationSection";

const DocumentSection = ({
  slots,
  title,
  titleClassName,
}: {
  slots: DocumentSlot[];
  title: string;
  titleClassName?: string;
}) => {
  if (!slots.length) return null;

  return (
    <NotificationSection title={title} titleClassName={titleClassName}>
      {slots.map((slot) => (
        <li key={slot.type.id}>
          <DocumentNotification slot={slot} />
        </li>
      ))}
    </NotificationSection>
  );
};

/**
 * The paperwork half of the notification panel: papers to renew first — they
 * have a deadline — then the ones never filed.
 */
export const DocumentNotifications = ({
  missing,
  renewals,
}: {
  missing: DocumentSlot[];
  renewals: DocumentSlot[];
}) => {
  const translate = useTranslate();

  return (
    <>
      <DocumentSection
        slots={renewals}
        title={translate("crm.documents.sections.renewals")}
        titleClassName="text-destructive"
      />
      <DocumentSection
        slots={missing}
        title={translate("crm.documents.sections.missing")}
      />
    </>
  );
};
