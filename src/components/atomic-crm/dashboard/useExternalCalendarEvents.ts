import { useQuery } from "@tanstack/react-query";
import { useDataProvider, useTranslate } from "ra-core";
import { useMemo } from "react";

import type { CrmDataProvider } from "../providers/types";
import { expandIcalEvents } from "./ical/expandIcalEvents";
import { parseIcalendar } from "./ical/parseIcalendar";
import type { CalendarRange } from "./useMeetingEvents";

/** A personal calendar does not change by the second; refetch at most this often. */
const FEED_STALE_MS = 5 * 60 * 1000;

export type ExternalCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  classNames: string[];
  editable: false;
  startEditable: false;
  durationEditable: false;
  extendedProps: { isExternal: true };
};

/**
 * The current user's own external calendars, overlaid on the dashboard as
 * read-only busy time.
 *
 * Every feed is fetched once and re-expanded locally whenever the visible range
 * moves: paging through weeks is then free, and a published `.ics` is not
 * range-queryable anyway.
 *
 * Colors are CSS variables rather than hex, so FullCalendar's inline styles
 * still follow the light/dark theme. All calendars share one fill on purpose —
 * they are all "not available", and the CRM's own colors mean consultant.
 */
export const useExternalCalendarEvents = (
  range: CalendarRange | undefined,
  enabled: boolean,
) => {
  const dataProvider = useDataProvider<CrmDataProvider>();
  const translate = useTranslate();

  const { data, error } = useQuery({
    queryKey: ["ical-feeds"],
    queryFn: () => dataProvider.getIcalFeeds(),
    staleTime: FEED_STALE_MS,
    // A misconfigured feed fails the same way every time; retrying only delays
    // the message telling the user to fix the address.
    retry: false,
    enabled,
  });

  /** Parsed events per feed, keeping each feed's position as its identity. */
  const eventsByFeed = useMemo(
    () =>
      (data?.feeds ?? []).map((feed) =>
        "ics" in feed ? parseIcalendar(feed.ics) : [],
      ),
    [data?.feeds],
  );

  const events = useMemo<ExternalCalendarEvent[]>(() => {
    if (!enabled || !range) return [];

    return eventsByFeed.flatMap((feedEvents, feedIndex) =>
      expandIcalEvents(feedEvents, range).map((occurrence) => ({
        // Namespaced twice over: a feed UID could collide with a task id, and
        // the same event synced into two calendars carries the same UID.
        id: `external-${feedIndex}-${occurrence.id}`,
        title:
          occurrence.summary ||
          translate("crm.dashboard.calendar.external.busy", { _: "Busy" }),
        start: occurrence.start.toISOString(),
        end: occurrence.end.toISOString(),
        allDay: occurrence.allDay,
        backgroundColor: "var(--muted)",
        borderColor: "var(--border)",
        textColor: "var(--muted-foreground)",
        classNames: ["external-event"],
        editable: false as const,
        startEditable: false as const,
        durationEditable: false as const,
        extendedProps: { isExternal: true as const },
      })),
    );
  }, [enabled, range, eventsByFeed, translate]);

  // A whole failed call means none could be read; otherwise count the feeds
  // that answered with an error while their siblings succeeded.
  const failedCount = useMemo(() => {
    if (!enabled) return 0;
    if (error) return Math.max(1, data?.feeds.length ?? 1);
    return (data?.feeds ?? []).filter((feed) => "error" in feed).length;
  }, [enabled, error, data?.feeds]);

  return { events, failedCount };
};
