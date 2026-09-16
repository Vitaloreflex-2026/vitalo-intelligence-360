import { endOfToday } from "date-fns/endOfToday";
import { startOfToday } from "date-fns/startOfToday";
import { Bell } from "lucide-react";
import { useGetIdentity, useGetList, useTranslate } from "ra-core";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { isRecentlyDone } from "../tasks/tasksPredicate";
import type { Task } from "../types";
import { MeetingNotification } from "./MeetingNotification";

/**
 * Floating bottom-right panel listing the current user's meetings for today,
 * each with a "done" and a "postpone" action.
 */
export const MeetingNotifications = () => {
  const translate = useTranslate();
  const { identity } = useGetIdentity();

  const { data: meetings } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "due_date", order: "ASC" },
      filter: {
        sales_id: identity?.id,
        "due_date@gte": startOfToday().toISOString(),
        "due_date@lte": endOfToday().toISOString(),
      },
    },
    { enabled: !!identity },
  );

  // Meetings checked a moment ago stay listed so the user sees the change
  // before they disappear, as in the dashboard task list.
  const todayMeetings = useMemo(
    () =>
      meetings?.filter(
        (meeting) =>
          !meeting.done_date ||
          isRecentlyDone({
            due_date: meeting.due_date,
            done_date: meeting.done_date,
          }),
      ) ?? [],
    [meetings],
  );

  const pendingCount = todayMeetings.filter(
    (meeting) => !meeting.done_date,
  ).length;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="relative size-14 rounded-full shadow-xl cursor-pointer"
            aria-label={translate("crm.notifications.title")}
          >
            <Bell className="size-6" />
            {pendingCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-0.5 -right-0.5 size-6 rounded-full p-0 text-xs tabular-nums ring-2 ring-background dark:bg-destructive"
              >
                {pendingCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          collisionPadding={16}
          className="w-[36rem] max-w-[calc(100vw-2rem)] max-h-(--radix-popover-content-available-height) overflow-y-auto p-0 shadow-2xl border-gray-300"
        >
          <h2 className="text-sm font-semibold px-4 pt-4 pb-2">
            {translate("crm.notifications.title")}
          </h2>
          {todayMeetings.length === 0 ? (
            <p className="text-sm text-muted-foreground px-4 pb-4">
              {translate("crm.notifications.empty")}
            </p>
          ) : (
            <ul className="px-4 pb-2 divide-y">
              {todayMeetings.map((meeting) => (
                <li key={meeting.id}>
                  <MeetingNotification meeting={meeting} />
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
