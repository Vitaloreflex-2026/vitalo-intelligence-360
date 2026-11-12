import { meetingEndDate } from "../dashboard/useMeetingEvents";

const MINUTE_MS = 60 * 1000;

/**
 * Local "HH:mm" at which a meeting ends, the form an `<input type="time">`
 * takes. Empty when the meeting has no usable start to count from.
 */
export const meetingEndTime = (
  dueDate: string | null | undefined,
  durationMinutes?: number,
): string => {
  if (!dueDate) return "";
  const end = meetingEndDate({
    due_date: dueDate,
    duration_minutes: durationMinutes,
  });
  return Number.isNaN(end.getTime()) ? "" : end.toTimeString().slice(0, 5);
};

/**
 * Length in minutes of a meeting starting at `dueDate` and ending at `endTime`
 * ("HH:mm") on the same local day; negative when it would end before it starts.
 * Undefined when either is unusable, so the caller can keep the stored length.
 */
export const meetingDurationMinutes = (
  dueDate: string | null | undefined,
  endTime: string,
): number | undefined => {
  if (!dueDate) return undefined;
  const start = new Date(dueDate);
  const [hours, minutes] = endTime.split(":").map(Number);
  const end = new Date(start).setHours(hours, minutes, 0, 0);
  // Rounded up: a start carrying seconds must still end on the picked minute.
  const duration = Math.ceil((end - start.getTime()) / MINUTE_MS);
  return Number.isNaN(duration) ? undefined : duration;
};
