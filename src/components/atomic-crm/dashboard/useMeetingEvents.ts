import type { Identifier } from "ra-core";
import { useGetIdentity, useGetList } from "ra-core";
import { useMemo } from "react";

import { fallbackRdvColor, rdvInkColor } from "../misc/rdvColors";
import type { Choice, Task } from "../types";

/** Default length of a meeting with no stored duration, matching the column default. */
export const DEFAULT_MEETING_MINUTES = 60;

const MAX_MEETINGS_PER_RANGE = 500;
const MAX_MEETING_TYPES = 200;
const MINUTE_MS = 60 * 1000;

export type CalendarRange = { start: Date; end: Date };

export type MeetingEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  classNames: string[];
  extendedProps: {
    taskId: Identifier;
    type: string;
    isDone: boolean;
  };
};

export const meetingEndDate = (task: Task): Date =>
  new Date(
    new Date(task.due_date).getTime() +
      (task.duration_minutes ?? DEFAULT_MEETING_MINUTES) * MINUTE_MS,
  );

/**
 * The current user's meetings over the calendar's visible range, already shaped
 * as FullCalendar events and colored by meeting type.
 *
 * Fetching is scoped to the range rather than pulling every task, so paging
 * through months stays cheap; React Query keeps previously visited ranges warm.
 */
export const useMeetingEvents = (range: CalendarRange | undefined) => {
  const { identity } = useGetIdentity();

  const { data: tasks, isPending } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: MAX_MEETINGS_PER_RANGE },
      sort: { field: "due_date", order: "ASC" },
      filter: {
        sales_id: identity?.id,
        "due_date@gte": range?.start.toISOString(),
        "due_date@lt": range?.end.toISOString(),
      },
    },
    { enabled: !!identity && !!range },
  );

  const { data: meetingTypes } = useGetList<Choice>("choices", {
    filter: { category: "rdv_type" },
    pagination: { page: 1, perPage: MAX_MEETING_TYPES },
    sort: { field: "id", order: "ASC" },
  });

  const colorByType = useMemo(() => {
    const colors = new Map<string, string>();
    meetingTypes?.forEach((type) => {
      colors.set(type.label, type.color || fallbackRdvColor(type.label));
    });
    return colors;
  }, [meetingTypes]);

  const events = useMemo<MeetingEvent[]>(
    () =>
      (tasks ?? []).map((task) => {
        const fill =
          colorByType.get(task.type) ?? fallbackRdvColor(task.type ?? "");
        const isDone = !!task.done_date;
        return {
          id: String(task.id),
          title: task.text,
          start: new Date(task.due_date).toISOString(),
          end: meetingEndDate(task).toISOString(),
          backgroundColor: fill,
          borderColor: rdvInkColor(fill),
          textColor: rdvInkColor(fill),
          classNames: isDone ? ["meeting-event--done"] : [],
          extendedProps: {
            taskId: task.id,
            type: task.type,
            isDone,
          },
        };
      }),
    [tasks, colorByType],
  );

  return { events, isPending };
};
