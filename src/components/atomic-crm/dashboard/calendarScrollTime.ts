/**
 * How much of the recent past to keep above the fold. Landing exactly on the
 * current hour hides the meeting in progress, so the grid opens an hour earlier
 * and the upcoming ones fill the rest of the view.
 */
const LEAD_MINUTES = 60;

const MINUTES_PER_HOUR = 60;

/** Minutes since midnight for an "HH:mm:ss" slot boundary. */
const toMinutes = (slot: string): number => {
  const [hours, minutes] = slot.split(":").map(Number);
  return hours * MINUTES_PER_HOUR + (minutes || 0);
};

const toSlot = (minutes: number): string => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  return `${String(hours).padStart(2, "0")}:${String(
    minutes % MINUTES_PER_HOUR,
  ).padStart(2, "0")}:00`;
};

/**
 * Where the calendar should be scrolled when it opens: the hour before now,
 * kept inside the grid's own bounds so an early morning or a late evening still
 * lands on a real slot.
 */
export const calendarScrollTime = (
  now: Date,
  firstSlot: string,
  lastSlot: string,
): string => {
  const nowMinutes = now.getHours() * MINUTES_PER_HOUR + now.getMinutes();
  const target =
    Math.floor((nowMinutes - LEAD_MINUTES) / MINUTES_PER_HOUR) *
    MINUTES_PER_HOUR;
  const earliest = toMinutes(firstSlot);
  const latest = toMinutes(lastSlot);
  return toSlot(Math.min(Math.max(target, earliest), latest));
};
