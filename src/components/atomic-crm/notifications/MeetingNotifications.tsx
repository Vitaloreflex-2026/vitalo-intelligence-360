import { endOfToday } from "date-fns/endOfToday";
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
import { cn } from "@/lib/utils";

import { isOverdue } from "../tasks/tasksPredicate";
import type { Task } from "../types";
import { MeetingNotification } from "./MeetingNotification";

const MeetingSection = ({
  meetings,
  showDate,
  title,
  titleClassName,
}: {
  meetings: Task[];
  showDate?: boolean;
  title: string;
  titleClassName?: string;
}) => {
  if (!meetings.length) return null;

  return (
    <section className="px-4 pb-2">
      <h3
        className={cn(
          "text-xs font-semibold uppercase tracking-wide pt-2 pb-1",
          titleClassName,
        )}
      >
        {title}
      </h3>
      <ul className="divide-y">
        {meetings.map((meeting) => (
          <li key={meeting.id}>
            <MeetingNotification meeting={meeting} showDate={showDate} />
          </li>
        ))}
      </ul>
    </section>
  );
};

/**
 * Floating bottom-right panel listing the current user's meetings that still
 * need handling — overdue ones first, then today's — each with a "done" and a
 * "postpone" action.
 */
export const MeetingNotifications = () => {
  const translate = useTranslate();
  const { identity } = useGetIdentity();

  const { data: meetings } = useGetList<Task>(
    "tasks",
    {
      // Newest first, so this bounded window holds today's meetings plus the
      // most recent overdue ones instead of the oldest of a long backlog.
      pagination: { page: 1, perPage: 100 },
      sort: { field: "due_date", order: "DESC" },
      filter: {
        sales_id: identity?.id,
        "due_date@lte": endOfToday().toISOString(),
      },
    },
    { enabled: !!identity },
  );

  const pendingMeetings = useMemo(
    () => (meetings ?? []).filter((meeting) => !meeting.done_date).reverse(),
    [meetings],
  );

  const overdueMeetings = pendingMeetings.filter((meeting) =>
    isOverdue(meeting.due_date),
  );
  const todayMeetings = pendingMeetings.filter(
    (meeting) => !isOverdue(meeting.due_date),
  );

  const pendingCount = pendingMeetings.length;

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
          {pendingMeetings.length === 0 ? (
            <p className="text-sm text-muted-foreground px-4 pb-4">
              {translate("crm.notifications.empty")}
            </p>
          ) : (
            <>
              <MeetingSection
                meetings={overdueMeetings}
                showDate
                title={translate("resources.tasks.filters.overdue")}
                titleClassName="text-destructive"
              />
              <MeetingSection
                meetings={todayMeetings}
                title={translate("resources.tasks.filters.today")}
              />
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
