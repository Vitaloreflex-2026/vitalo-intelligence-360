import { DEFAULT_MEETING_MINUTES } from "./useMeetingEvents";

/** Hour a meeting defaults to when the day was picked without one. */
const DEFAULT_MEETING_HOUR = 9;

const MINUTE_MS = 60 * 1000;

export type MeetingSlot = { start: Date; end: Date };

/**
 * Turns a calendar selection into the slot the creation dialog prefills.
 *
 * The time-grid views hand over the exact range the user drew. The month view
 * cannot: picking a day there yields a whole-day range from midnight to
 * midnight, which would prefill a 24-hour meeting starting at 00:00. A day
 * picked that way falls back to a regular meeting in the morning instead.
 */
export const meetingSlotFromSelection = (
  start: Date,
  end: Date,
  isAllDay: boolean,
): MeetingSlot => {
  if (!isAllDay) return { start, end };

  const dayStart = new Date(start);
  dayStart.setHours(DEFAULT_MEETING_HOUR, 0, 0, 0);
  return {
    start: dayStart,
    end: new Date(dayStart.getTime() + DEFAULT_MEETING_MINUTES * MINUTE_MS),
  };
};
