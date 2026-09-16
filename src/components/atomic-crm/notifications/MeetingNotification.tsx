import { useQueryClient } from "@tanstack/react-query";
import { Check, Clock } from "lucide-react";
import { useGetRecordRepresentation, useTranslate, useUpdate } from "ra-core";
import { useState } from "react";
import { DateField } from "@/components/admin/date-field";
import { ReferenceField } from "@/components/admin/reference-field";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { useConfigurationContext } from "../root/ConfigurationContext";
import { TaskEdit } from "../tasks/TaskEdit";
import {
  DAYS_UNTIL_NEXT_WEEK,
  DAYS_UNTIL_TOMORROW,
  postponeDueDate,
} from "../tasks/postponeDueDate";
import type { Contact, Task } from "../types";

/**
 * One of today's meetings in the notification panel: the meeting itself plus
 * its two actions — mark as done, and postpone (tomorrow / next week / edit).
 */
export const MeetingNotification = ({ meeting }: { meeting: Task }) => {
  const translate = useTranslate();
  const queryClient = useQueryClient();
  const { taskTypes } = useConfigurationContext();
  const getContactRepresentation = useGetRecordRepresentation("contacts");

  const [openEdit, setOpenEdit] = useState(false);
  const [update, { isPending }] = useUpdate();

  const isDone = !!meeting.done_date;

  const handleCheck = () => {
    update("tasks", {
      id: meeting.id,
      data: { done_date: isDone ? null : new Date().toISOString() },
      previousData: meeting,
    });
  };

  const handlePostpone = (days: number) => () => {
    update(
      "tasks",
      {
        id: meeting.id,
        data: { due_date: postponeDueDate(meeting.due_date, days) },
        previousData: meeting,
      },
      {
        // A postponed meeting leaves today's list, so the panel must refetch.
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tasks", "getList"] });
        },
      },
    );
  };

  const meetingType = taskTypes.find(
    (taskType) => taskType.value === meeting.type,
  );

  return (
    <>
      <div className="flex items-start justify-between gap-3 py-2">
        <div className={cn("flex-grow text-sm", isDone && "line-through")}>
          <div className="flex items-baseline gap-2">
            <DateField
              source="due_date"
              record={meeting}
              showTime
              showDate={false}
              options={{ hour: "2-digit", minute: "2-digit" }}
              className="font-semibold tabular-nums"
            />
            <span>{meeting.text}</span>
          </div>
          <div className="flex items-baseline gap-2 text-xs text-muted-foreground">
            <ReferenceField<Task, Contact>
              source="contact_id"
              reference="contacts"
              record={meeting}
              link="show"
              render={({ referenceRecord }) =>
                referenceRecord ? (
                  <>{getContactRepresentation(referenceRecord)}</>
                ) : null
              }
            />
            <span className="truncate">
              {[
                meetingType && meeting.type !== "none"
                  ? meetingType.label
                  : meeting.type,
                meeting.mode,
                meeting.location,
              ]
                .filter(Boolean)
                .join(" — ")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            disabled={isPending}
            onClick={handleCheck}
            aria-label={translate("crm.notifications.actions.done")}
          >
            <Check className={cn("size-4", isDone && "text-primary")} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer"
                disabled={isPending}
                aria-label={translate("crm.notifications.actions.postpone")}
              >
                <Clock className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handlePostpone(DAYS_UNTIL_TOMORROW)}
              >
                {translate("resources.tasks.actions.postpone_tomorrow")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handlePostpone(DAYS_UNTIL_NEXT_WEEK)}
              >
                {translate("resources.tasks.actions.postpone_next_week")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setOpenEdit(true)}
              >
                {translate("ra.action.edit")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TaskEdit
        taskId={meeting.id}
        open={openEdit}
        close={() => setOpenEdit(false)}
      />
    </>
  );
};
