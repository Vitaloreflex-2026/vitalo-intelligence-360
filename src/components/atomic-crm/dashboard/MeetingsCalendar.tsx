import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  DatesSetArg,
} from "@fullcalendar/core";
import enLocale from "@fullcalendar/core/locales/en-gb";
import frLocale from "@fullcalendar/core/locales/fr";
import interactionPlugin, {
  type EventResizeDoneArg,
} from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CalendarDays } from "lucide-react";
import type { Identifier } from "ra-core";
import { useLocaleState, useNotify, useTranslate, useUpdate } from "ra-core";
import { useCallback, useState } from "react";
import { Card } from "@/components/ui/card";

import { TaskEdit } from "../tasks/TaskEdit";
import { MeetingCreateDialog } from "./MeetingCreateDialog";
import "./MeetingsCalendar.css";
import {
  DEFAULT_MEETING_MINUTES,
  useMeetingEvents,
  type CalendarRange,
} from "./useMeetingEvents";

/** Business hours the grid opens on; earlier or later meetings stay reachable by scrolling. */
const FIRST_SLOT = "07:00:00";
const LAST_SLOT = "21:00:00";
const INITIAL_SCROLL = "08:00:00";

const GRID_HEIGHT = 520;
const MINUTE_MS = 60 * 1000;

const minutesBetween = (start: Date, end: Date): number =>
  Math.max(1, Math.round((end.getTime() - start.getTime()) / MINUTE_MS));

/**
 * The current user's meetings for the visible week, shown in the dashboard's
 * centre column. Dragging a block reschedules the meeting, resizing it changes
 * its duration, dragging across empty slots opens the creation dialog.
 */
export const MeetingsCalendar = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const [locale] = useLocaleState();
  const [update] = useUpdate();

  const [range, setRange] = useState<CalendarRange>();
  const [editedTaskId, setEditedTaskId] = useState<Identifier>();
  const [createdSlot, setCreatedSlot] = useState<CalendarRange>();

  const { events } = useMeetingEvents(range);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setRange({ start: arg.start, end: arg.end });
  }, []);

  /**
   * Drag and resize both write the same two fields, and both must put the block
   * back where it was when the server refuses the change.
   */
  const rescheduleMeeting = useCallback(
    (
      taskId: string,
      start: Date | null,
      end: Date | null,
      revert: () => void,
    ) => {
      if (!start) {
        revert();
        return;
      }
      update(
        "tasks",
        {
          id: taskId,
          data: {
            due_date: start.toISOString(),
            duration_minutes: end
              ? minutesBetween(start, end)
              : DEFAULT_MEETING_MINUTES,
          },
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
        arg.event.id,
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
        arg.event.id,
        arg.event.start,
        arg.event.end,
        arg.revert,
      );
    },
    [rescheduleMeeting],
  );

  const handleEventClick = useCallback((arg: EventClickArg) => {
    setEditedTaskId(arg.event.extendedProps.taskId);
  }, []);

  const handleSelect = useCallback((arg: DateSelectArg) => {
    setCreatedSlot({ start: arg.start, end: arg.end });
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <CalendarDays className="text-muted-foreground w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground flex-1">
          {translate("crm.dashboard.calendar.title", { _: "My meetings" })}
        </h2>
      </div>

      <Card className="p-3 meetings-calendar">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={locale === "fr" ? frLocale : enLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          height={GRID_HEIGHT}
          allDaySlot={false}
          nowIndicator
          slotMinTime={FIRST_SLOT}
          slotMaxTime={LAST_SLOT}
          scrollTime={INITIAL_SCROLL}
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
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
