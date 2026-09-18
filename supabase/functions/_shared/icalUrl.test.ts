import { describe, expect, it } from "vitest";

import {
  MAX_ICAL_FEEDS,
  isBlockedFeedHost,
  normalizeIcalFeedUrl,
  normalizeIcalFeedUrls,
} from "./icalUrl";

describe("normalizeIcalFeedUrl", () => {
  it("keeps a public https feed URL", () => {
    expect(
      normalizeIcalFeedUrl(
        "https://calendar.google.com/calendar/ical/me%40example.com/private-abc/basic.ics",
      ),
    ).toEqual({
      url: "https://calendar.google.com/calendar/ical/me%40example.com/private-abc/basic.ics",
    });
  });

  it("rewrites a webcal URL to https", () => {
    expect(normalizeIcalFeedUrl("webcal://example.com/feed.ics")).toEqual({
      url: "https://example.com/feed.ics",
    });
  });

  it("accepts a published iCloud calendar's webcal address", () => {
    expect(
      normalizeIcalFeedUrl(
        "webcal://p46-calendars.icloud.com/published/2/MTIzNDU2Nzg5MAoxMjM0NTY3ODkw",
      ),
    ).toEqual({
      url: "https://p46-calendars.icloud.com/published/2/MTIzNDU2Nzg5MAoxMjM0NTY3ODkw",
    });
  });

  it("accepts the ICS link Outlook publishes", () => {
    expect(
      normalizeIcalFeedUrl(
        "https://outlook.office365.com/owa/calendar/abc123/reachcalendar.ics",
      ),
    ).toEqual({
      url: "https://outlook.office365.com/owa/calendar/abc123/reachcalendar.ics",
    });
  });

  it("treats an empty value as no feed", () => {
    expect(normalizeIcalFeedUrl("   ")).toEqual({ url: null });
    expect(normalizeIcalFeedUrl(null)).toEqual({ url: null });
  });

  it("refuses a plain http URL", () => {
    expect(normalizeIcalFeedUrl("http://example.com/feed.ics")).toHaveProperty(
      "error",
    );
  });

  it("refuses a non-http scheme", () => {
    expect(normalizeIcalFeedUrl("file:///etc/passwd")).toHaveProperty("error");
  });

  it("refuses a URL carrying credentials", () => {
    expect(
      normalizeIcalFeedUrl("https://user:secret@example.com/feed.ics"),
    ).toHaveProperty("error");
  });

  it("refuses text that is not a URL", () => {
    expect(normalizeIcalFeedUrl("mon agenda")).toHaveProperty("error");
  });

  it("refuses a loopback host", () => {
    expect(normalizeIcalFeedUrl("https://localhost/feed.ics")).toHaveProperty(
      "error",
    );
  });

  it("refuses the cloud metadata address", () => {
    expect(
      normalizeIcalFeedUrl("https://169.254.169.254/latest/meta-data/"),
    ).toHaveProperty("error");
  });
});

describe("isBlockedFeedHost", () => {
  it.each([
    "localhost",
    "supabase_db.local",
    "kong.internal",
    "127.0.0.1",
    "10.0.0.5",
    "172.16.4.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "[::1]",
    "[fd00::1]",
    "[fe80::1]",
    "[::ffff:127.0.0.1]",
  ])("blocks %s", (hostname) => {
    expect(isBlockedFeedHost(hostname)).toBe(true);
  });

  it.each([
    "calendar.google.com",
    "outlook.office365.com",
    "8.8.8.8",
    "172.32.0.1",
    "192.169.1.1",
  ])("allows %s", (hostname) => {
    expect(isBlockedFeedHost(hostname)).toBe(false);
  });
});

describe("normalizeIcalFeedUrls", () => {
  it("keeps every calendar of the list, in order", () => {
    expect(
      normalizeIcalFeedUrls([
        "https://example.com/work.ics",
        "webcal://example.com/family.ics",
      ]),
    ).toEqual({
      urls: ["https://example.com/work.ics", "https://example.com/family.ics"],
    });
  });

  it("treats a bare string as a one-calendar list", () => {
    expect(normalizeIcalFeedUrls("https://example.com/work.ics")).toEqual({
      urls: ["https://example.com/work.ics"],
    });
  });

  it("drops the blank row left by an unfilled entry", () => {
    expect(
      normalizeIcalFeedUrls(["https://example.com/work.ics", "", null]),
    ).toEqual({ urls: ["https://example.com/work.ics"] });
  });

  it("keeps the same calendar only once", () => {
    expect(
      normalizeIcalFeedUrls([
        "https://example.com/work.ics",
        "webcal://example.com/work.ics",
      ]),
    ).toEqual({ urls: ["https://example.com/work.ics"] });
  });

  it("reads no calendar at all as an empty list", () => {
    expect(normalizeIcalFeedUrls(null)).toEqual({ urls: [] });
    expect(normalizeIcalFeedUrls([])).toEqual({ urls: [] });
  });

  it("rejects the whole list when one calendar is not acceptable", () => {
    expect(
      normalizeIcalFeedUrls([
        "https://example.com/work.ics",
        "https://10.0.0.5/internal.ics",
      ]),
    ).toHaveProperty("error");
  });

  it("refuses more calendars than the cap", () => {
    const urls = Array.from(
      { length: MAX_ICAL_FEEDS + 1 },
      (_, index) => `https://example.com/${index}.ics`,
    );

    expect(normalizeIcalFeedUrls(urls)).toHaveProperty("error");
  });
});
