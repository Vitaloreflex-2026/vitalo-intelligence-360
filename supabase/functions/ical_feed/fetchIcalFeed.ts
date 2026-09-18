import { isBlockedFeedHost } from "../_shared/icalUrl.ts";

/** A feed that takes longer than this is not worth making the dashboard wait. */
const TIMEOUT_MS = 10_000;

/** Personal calendars run to tens of kilobytes; this is a runaway guard. */
const MAX_BYTES = 4 * 1024 * 1024;

/** Enough for the usual "short link -> real host" hop, not enough to loop. */
const MAX_REDIRECTS = 3;

export type FetchIcalResult =
  | { ics: string }
  | { status: number; message: string };

/** Read at most `MAX_BYTES` of the body, aborting a feed that keeps coming. */
const readCappedText = async (response: Response): Promise<string | null> => {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  chunks.forEach((chunk) => {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return new TextDecoder("utf-8").decode(body);
};

/**
 * Fetch a published iCalendar document.
 *
 * Redirects are followed by hand rather than by `fetch`, because a validated
 * public URL is free to redirect to `http://169.254.169.254/` — checking only
 * the first URL would leave the hole the validation was meant to close.
 */
export const fetchIcalFeed = async (
  feedUrl: string,
): Promise<FetchIcalResult> => {
  let url = feedUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    let response: Response;
    try {
      response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { accept: "text/calendar, text/plain;q=0.9, */*;q=0.1" },
      });
    } catch (error) {
      console.error("ical_feed.fetch_error", error);
      return { status: 502, message: "Could not reach the calendar URL" };
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) {
        return { status: 502, message: "Could not reach the calendar URL" };
      }

      let next: URL;
      try {
        next = new URL(location, url);
      } catch {
        return { status: 502, message: "Could not reach the calendar URL" };
      }
      if (next.protocol !== "https:" || isBlockedFeedHost(next.hostname)) {
        return {
          status: 400,
          message: "This calendar URL redirects to a private address",
        };
      }
      url = next.toString();
      continue;
    }

    if (!response.ok) {
      await response.body?.cancel();
      return {
        status: 502,
        message: `The calendar URL answered ${response.status}`,
      };
    }

    const ics = await readCappedText(response);
    if (ics == null) {
      return { status: 502, message: "This calendar feed is too large" };
    }
    // A wrong URL usually answers with an HTML page rather than an error, so
    // say so here instead of letting the browser show an empty calendar.
    if (!ics.includes("BEGIN:VCALENDAR")) {
      return {
        status: 422,
        message: "This URL does not return an iCalendar feed",
      };
    }

    return { ics };
  }

  return { status: 502, message: "The calendar URL redirects too many times" };
};
