import { addDays } from "date-fns/addDays";

import { isOverdue } from "./tasksPredicate";

export const DAYS_UNTIL_TOMORROW = 1;
export const DAYS_UNTIL_NEXT_WEEK = 7;

/**
 * Shift a meeting's due date by a number of days, keeping the time of day:
 * a 9:00 meeting postponed to tomorrow stays a 9:00 meeting.
 *
 * A late meeting is rescheduled from today rather than from the day it was
 * missed, so "tomorrow" always means tomorrow.
 */
export const postponeDueDate = (dueDate: string, days: number): string => {
  const due = new Date(dueDate);
  const base = isOverdue(dueDate) ? new Date() : due;
  base.setHours(due.getHours(), due.getMinutes(), 0, 0);
  return addDays(base, days).toISOString();
};
