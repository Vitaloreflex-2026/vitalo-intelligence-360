import { addDays } from "date-fns/addDays";

export const DAYS_UNTIL_TOMORROW = 1;
export const DAYS_UNTIL_NEXT_WEEK = 7;

/**
 * Shift a meeting's due date by a number of days, keeping the time of day:
 * a 9:00 meeting postponed to tomorrow stays a 9:00 meeting.
 */
export const postponeDueDate = (dueDate: string, days: number): string =>
  addDays(new Date(dueDate), days).toISOString();
