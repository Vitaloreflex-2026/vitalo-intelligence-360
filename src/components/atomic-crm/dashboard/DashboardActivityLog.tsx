import { Clock } from "lucide-react";
import { useTranslate } from "ra-core";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

import { ActivityLog } from "../activity/ActivityLog";

export function DashboardActivityLog() {
  const isMobile = useIsMobile();
  const translate = useTranslate();
  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-4 md:mb-2">
        <div className="mr-3 flex rounded-full bg-vitalo-blue p-2 shadow-sm">
          <Clock className="text-background w-5 h-5" />
        </div>
        <h2 className="font-heading text-xl font-bold text-vitalo-forest">
          {translate("crm.dashboard.latest_activity", {
            _: "Latest Activity",
          })}
        </h2>
      </div>
      {isMobile ? (
        <ActivityLog pageSize={10} />
      ) : (
        <Card className="mb-2 p-6 border-t-4 border-t-vitalo-blue shadow-md">
          <ActivityLog pageSize={10} />
        </Card>
      )}
    </div>
  );
}
