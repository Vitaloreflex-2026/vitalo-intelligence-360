import type { Identifier } from "ra-core";
import { useGetList } from "ra-core";
import { useMemo } from "react";

import { fallbackRdvColor, rdvInkColor } from "../misc/rdvColors";
import { salesName } from "../sales/salesName";
import type { Sale, Task } from "../types";

/** Default length of a meeting with no stored duration, matching the column default. */
export const DEFAULT_MEETING_MINUTES = 60;

const MAX_MEETINGS_PER_RANGE = 500;
const MAX_CONSULTANTS = 200;
const MINUTE_MS = 60 * 1000;

/**
 * Fill for a meeting held by nobody, or by a consultant the list did not return.
 * A neutral grey rather than a palette entry: borrowing one would make the block
 * read as a real consultant's.
 */
const UNASSIGNED_FILL = "#e5e7eb";

export type CalendarRange = { start: Date; end: Date };

/** One consultant/trainer with meetings in the visible range, for the legend. */
export type MeetingConsultant = {
  id: Identifier;
  name: string;
  color: string;
};

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
    salesId: Identifier | null;
    isDone: boolean;
  };
};

export const meetingEndDate = (task: Task): Date =>
  new Date(
    new Date(task.due_date).getTime() +
      (task.duration_minutes ?? DEFAULT_MEETING_MINUTES) * MINUTE_MS,
  );

/**
 * Every consultant's meetings over the calendar's visible range, already shaped
 * as FullCalendar events and colored by the consultant/trainer holding them,
 * plus the consultants actually present in the range so the widget can legend
 * the colors.
 *
 * Fetching is scoped to the range rather than pulling every task, so paging
 * through months stays cheap; React Query keeps previously visited ranges warm.
 */
export const useMeetingEvents = (range: CalendarRange | undefined) => {
  const { data: tasks, isPending } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: MAX_MEETINGS_PER_RANGE },
      sort: { field: "due_date", order: "ASC" },
      filter: {
        "due_date@gte": range?.start.toISOString(),
        "due_date@lt": range?.end.toISOString(),
      },
    },
    { enabled: !!range },
  );

  const { data: consultants } = useGetList<Sale>("sales", {
    pagination: { page: 1, perPage: MAX_CONSULTANTS },
    sort: { field: "id", order: "ASC" },
  });

  // Keyed by string: a task's `sales_id` may be a number here and a string
  // there depending on the provider, and a Map would treat those as two keys.
  const colorBySalesId = useMemo(() => {
    const colors = new Map<string, string>();
    consultants?.forEach((consultant) => {
      colors.set(
        String(consultant.id),
        consultant.color || fallbackRdvColor(salesName(consultant)),
      );
    });
    return colors;
  }, [consultants]);

  const events = useMemo<MeetingEvent[]>(
    () =>
      (tasks ?? []).map((task) => {
        const fill =
          colorBySalesId.get(String(task.sales_id)) ?? UNASSIGNED_FILL;
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
            salesId: task.sales_id ?? null,
            isDone,
          },
        };
      }),
    [tasks, colorBySalesId],
  );

  // Only the consultants on screen: a legend listing a whole inactive team
  // would be longer than the calendar it explains.
  const legend = useMemo<MeetingConsultant[]>(() => {
    const visible = new Set((tasks ?? []).map((task) => String(task.sales_id)));
    return (consultants ?? [])
      .filter((consultant) => visible.has(String(consultant.id)))
      .map((consultant) => ({
        id: consultant.id,
        name: salesName(consultant),
        color: consultant.color || fallbackRdvColor(salesName(consultant)),
      }));
  }, [tasks, consultants]);

  return { events, legend, isPending };
};
