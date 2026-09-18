import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchIcalFeed } from "./fetchIcalFeed";

const CALENDAR = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n";

const respondWith = (
  body: string,
  init: ResponseInit = {},
): typeof globalThis.fetch =>
  vi.fn(async () => new Response(body, init)) as unknown as typeof fetch;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchIcalFeed", () => {
  it("returns the calendar document", async () => {
    vi.stubGlobal("fetch", respondWith(CALENDAR));

    await expect(
      fetchIcalFeed("https://example.com/feed.ics"),
    ).resolves.toEqual({ ics: CALENDAR });
  });

  it("follows a redirect to another public host", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { location: "https://cdn.example.com/feed.ics" },
        }),
      )
      .mockResolvedValueOnce(new Response(CALENDAR));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchIcalFeed("https://example.com/feed.ics"),
    ).resolves.toEqual({ ics: CALENDAR });
    expect(fetchMock.mock.calls[1][0]).toBe("https://cdn.example.com/feed.ics");
  });

  it("refuses a redirect to a private address", async () => {
    vi.stubGlobal(
      "fetch",
      respondWith("", {
        status: 302,
        headers: { location: "http://169.254.169.254/latest/meta-data/" },
      }),
    );

    await expect(
      fetchIcalFeed("https://example.com/feed.ics"),
    ).resolves.toMatchObject({ status: 400 });
  });

  it("refuses a redirect loop", async () => {
    vi.stubGlobal(
      "fetch",
      respondWith("", {
        status: 302,
        headers: { location: "https://example.com/feed.ics" },
      }),
    );

    await expect(
      fetchIcalFeed("https://example.com/feed.ics"),
    ).resolves.toMatchObject({ status: 502 });
  });

  it("reports the upstream status when the feed is gone", async () => {
    vi.stubGlobal("fetch", respondWith("nope", { status: 404 }));

    await expect(
      fetchIcalFeed("https://example.com/feed.ics"),
    ).resolves.toMatchObject({ status: 502 });
  });

  it("reports a URL that answers with something other than a calendar", async () => {
    vi.stubGlobal("fetch", respondWith("<html>Sign in</html>"));

    await expect(
      fetchIcalFeed("https://example.com/feed.ics"),
    ).resolves.toMatchObject({ status: 422 });
  });

  it("reports an unreachable host", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network error");
      }),
    );

    await expect(
      fetchIcalFeed("https://example.com/feed.ics"),
    ).resolves.toMatchObject({ status: 502 });
  });

  it("gives up on a feed larger than the cap", async () => {
    const oversized = "BEGIN:VCALENDAR\r\n".concat("X".repeat(5 * 1024 * 1024));
    vi.stubGlobal("fetch", respondWith(oversized));

    await expect(
      fetchIcalFeed("https://example.com/feed.ics"),
    ).resolves.toMatchObject({ status: 502 });
  });
});
