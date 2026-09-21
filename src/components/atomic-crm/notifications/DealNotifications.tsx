import { useTranslate } from "ra-core";

import type { DealAlert } from "../deals/dealAlerts";
import { DealNotification } from "./DealNotification";
import { NotificationSection } from "./NotificationSection";

const AlertSection = ({
  alerts,
  title,
  titleClassName,
}: {
  alerts: DealAlert[];
  title: string;
  titleClassName?: string;
}) => {
  if (!alerts.length) return null;

  return (
    <NotificationSection title={title} titleClassName={titleClassName}>
      {alerts.map((alert) => (
        <li key={`${alert.deal.id}-${alert.kind}`}>
          <DealNotification alert={alert} />
        </li>
      ))}
    </NotificationSection>
  );
};

/**
 * The contract half of the notification panel: missed deadlines first, then
 * the paperwork still within its window.
 */
export const DealNotifications = ({ alerts }: { alerts: DealAlert[] }) => {
  const translate = useTranslate();

  return (
    <>
      <AlertSection
        alerts={alerts.filter((alert) => alert.isOverdue)}
        title={translate("crm.deal_alerts.sections.overdue")}
        titleClassName="text-destructive"
      />
      <AlertSection
        alerts={alerts.filter((alert) => !alert.isOverdue)}
        title={translate("crm.deal_alerts.sections.upcoming")}
      />
    </>
  );
};
