import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  DatesSetArg,
} from "@fullcalendar/core";
import enLocale from "@fullcalendar/core/locales/en-gb";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";
import interactionPlugin, {
  type EventResizeDoneArg,
} from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CalendarDays } from "lucide-react";
import type { Identifier } from "ra-core";
import { useLocaleState, useNotify, useTranslate, useUpdate } from "ra-core";
import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";

import { rdvInkColor } from "../misc/rdvColors";
import type { Task } from "../types";
import { TaskEdit } from "../tasks/TaskEdit";
import { calendarScrollTime } from "./calendarScrollTime";
import { MeetingCreateDialog } from "./MeetingCreateDialog";
import { meetingSlotFromSelection } from "./meetingSlot";
import "./MeetingsCalendar.css";
import {
  DEFAULT_MEETING_MINUTES,
  useMeetingEvents,
  type CalendarRange,
  type MeetingConsultant,
} from "./useMeetingEvents";

/** Business hours the grid opens on; earlier or later meetings stay reachable by scrolling. */
const FIRST_SLOT = "07:00:00";
const LAST_SLOT = "21:00:00";

const GRID_HEIGHT = 520;

/** Meetings shown in a month cell before collapsing into a "+N more" link. */
const MAX_EVENTS_PER_DAY = 3;
const MINUTE_MS = 60 * 1000;

const minutesBetween = (start: Date, end: Date): number =>
  Math.max(1, Math.round((end.getTime() - start.getTime()) / MINUTE_MS));

/**
 * A block is too narrow to hold a name, so the fill alone says whose meeting it
 * is — this spells the code out for the consultants currently on screen.
 */
const ConsultantLegend = ({
  consultants,
}: {
  consultants: MeetingConsultant[];
}) => {
  if (!consultants.length) return null;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 px-1">
      {consultants.map((consultant) => (
        <li
          key={consultant.id}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span
            aria-hidden
            className="inline-block w-3 h-3 rounded-sm border"
            style={{
              backgroundColor: consultant.color,
              borderColor: rdvInkColor(consultant.color),
            }}
          />
          {consultant.name}
        </li>
      ))}
    </ul>
  );
};

/**
 * Every consultant's meetings for the visible week, shown in the dashboard's
 * centre column, each colored by the consultant holding it. Dragging a block
 * reschedules the meeting, resizing it changes its duration, dragging across
 * empty slots opens the creation dialog.
 */
export const MeetingsCalendar = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const [locale] = useLocaleState();
  const [update] = useUpdate();

  // Computed once on mount: the scroll position is the user's from then on,
  // and re-deriving it on every render would fight them for it.
  const scrollTime = useMemo(
    () => calendarScrollTime(new Date(), FIRST_SLOT, LAST_SLOT),
    [],
  );

  const [range, setRange] = useState<CalendarRange>();
  const [editedTaskId, setEditedTaskId] = useState<Identifier>();
  const [createdSlot, setCreatedSlot] = useState<CalendarRange>();

  const { events, legend } = useMeetingEvents(range);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setRange({ start: arg.start, end: arg.end });
  }, []);

  /**
   * Drag and resize both write the same two fields, and both must put the block
   * back where it was when the server refuses the change.
   */
  const rescheduleMeeting = useCallback(
    (task: Task, start: Date | null, end: Date | null, revert: () => void) => {
      if (!start) {
        revert();
        return;
      }
      update(
        "tasks",
        {
          id: task.id,
          data: {
            due_date: start.toISOString(),
            duration_minutes: end
              ? minutesBetween(start, end)
              : DEFAULT_MEETING_MINUTES,
          },
          // The provider diffs data against previousData, and throws without it.
          previousData: task,
        },
        {
          onError: () => {
            revert();
            notify("crm.dashboard.calendar.reschedule_error", {
              type: "error",
            });
          },
        },
      );
    },
    [update, notify],
  );

  const handleEventDrop = useCallback(
    (arg: EventDropArg) => {
      rescheduleMeeting(
        arg.event.extendedProps.task,
        arg.event.start,
        arg.event.end,
        arg.revert,
      );
    },
    [rescheduleMeeting],
  );

  const handleEventResize = useCallback(
    (arg: EventResizeDoneArg) => {
      rescheduleMeeting(
        arg.event.extendedProps.task,
        arg.event.start,
        arg.event.end,
        arg.revert,
      );
    },
    [rescheduleMeeting],
  );

  const handleEventClick = useCallback((arg: EventClickArg) => {
    setEditedTaskId(arg.event.extendedProps.task.id);
  }, []);

  const handleSelect = useCallback((arg: DateSelectArg) => {
    setCreatedSlot(meetingSlotFromSelection(arg.start, arg.end, arg.allDay));
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <CalendarDays className="text-muted-foreground w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground flex-1">
          {translate("crm.dashboard.calendar.title", { _: "Team meetings" })}
        </h2>
      </div>

      <Card className="p-3 gap-3 meetings-calendar">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={locale === "fr" ? frLocale : enLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height={GRID_HEIGHT}
          allDaySlot={false}
          nowIndicator
          slotMinTime={FIRST_SLOT}
          slotMaxTime={LAST_SLOT}
          scrollTime={scrollTime}
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          views={{
            // A month cell renders timed events as a bare dot by default, which
            // would drop the consultant colour the rest of the widget relies on.
            dayGridMonth: {
              eventDisplay: "block",
              dayMaxEvents: MAX_EVENTS_PER_DAY,
            },
          }}
          expandRows
          stickyHeaderDates
          events={events}
          datesSet={handleDatesSet}
          editable
          eventDurationEditable
          selectable
          selectMirror
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventClick={handleEventClick}
          select={handleSelect}
        />
        <ConsultantLegend consultants={legend} />
      </Card>

      {editedTaskId != null && (
        <TaskEdit
          taskId={editedTaskId}
          open
          close={() => setEditedTaskId(undefined)}
        />
      )}

      {createdSlot && (
        <MeetingCreateDialog
          slot={createdSlot}
          close={() => setCreatedSlot(undefined)}
        />
      )}
    </div>
  );
};
