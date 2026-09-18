/**
 * Validation of the user-supplied iCalendar feed URL.
 *
 * The server fetches this URL on the user's behalf, so it is a server-side
 * request forgery vector: left unchecked, any authenticated user could point it
 * at the container's own network, at a cloud metadata endpoint, or at an
 * internal service, and read the answer. Everything below exists to keep the
 * fetch on the public internet.
 */

/**
 * Feeds are public HTTPS documents. `webcal:` is the same URL under the scheme
 * calendar apps register, so it is rewritten before parsing — the URL spec
 * refuses to swap a non-special scheme like `webcal:` for `https:` after the
 * fact, which makes the textual replacement the only one that works.
 */
const WEBCAL_PREFIX = /^webcal:\/\//i;

const BLOCKED_HOSTNAMES = ["localhost", "metadata.google.internal", "metadata"];

const BLOCKED_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".localdomain",
  ".home.arpa",
];

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** RFC 1918, loopback, link-local (incl. the cloud metadata address) and CGNAT. */
const isPrivateIpv4 = (hostname: string): boolean => {
  const match = IPV4_PATTERN.exec(hostname);
  if (!match) return false;

  const [first, second] = match.slice(1).map(Number);
  if (match.slice(1).some((part) => Number(part) > 255)) return true;

  if (first === 0 || first === 10 || first === 127) return true;
  if (first === 169 && second === 254) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  if (first === 100 && second >= 64 && second <= 127) return true;
  return false;
};

/** Loopback, unique-local and link-local IPv6, including IPv4-mapped forms. */
const isPrivateIpv6 = (hostname: string): boolean => {
  if (!hostname.startsWith("[")) return false;
  const address = hostname.slice(1, -1).toLowerCase();

  if (address === "::1" || address === "::") return true;
  if (/^f[cd][0-9a-f]{2}:/.test(address)) return true;
  if (/^fe[89ab][0-9a-f]:/.test(address)) return true;

  const mapped = /^::ffff:(.+)$/.exec(address);
  return mapped ? isPrivateIpv4(mapped[1]) : false;
};

export const isBlockedFeedHost = (hostname: string): boolean => {
  const host = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.includes(host)) return true;
  if (BLOCKED_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  return isPrivateIpv4(host) || isPrivateIpv6(host);
};

/** More calendars than anyone overlays on one grid, and a bound on the fan-out. */
export const MAX_ICAL_FEEDS = 5;

/**
 * The canonical HTTPS URL to fetch, or `null` when the input is not a feed URL
 * we are willing to request. An empty input is the user clearing their feed and
 * is reported as `{ url: null }` rather than as an error.
 */
export const normalizeIcalFeedUrl = (
  raw: unknown,
): { url: string | null } | { error: string } => {
  if (raw == null || (typeof raw === "string" && raw.trim() === "")) {
    return { url: null };
  }
  if (typeof raw !== "string") {
    return { error: "The calendar URL must be a string" };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw.trim().replace(WEBCAL_PREFIX, "https://"));
  } catch {
    return { error: "This is not a valid calendar URL" };
  }

  // Plain http: would put the feed's secret token on the wire in clear.
  if (parsed.protocol !== "https:") {
    return { error: "The calendar URL must start with https:// or webcal://" };
  }

  if (parsed.username || parsed.password) {
    return { error: "The calendar URL must not carry a username or password" };
  }

  if (isBlockedFeedHost(parsed.hostname)) {
    return { error: "This calendar URL points to a private address" };
  }

  return { url: parsed.toString() };
};

/**
 * The canonical list of feeds to fetch. One bad entry rejects the whole list:
 * silently dropping it would leave the user with a saved calendar that never
 * shows anything and no clue why.
 *
 * A non-array is accepted as a single URL so an older client, or a form that
 * sends one string, still works.
 */
export const normalizeIcalFeedUrls = (
  raw: unknown,
): { urls: string[] } | { error: string } => {
  if (raw == null) return { urls: [] };

  const entries = Array.isArray(raw) ? raw : [raw];
  if (entries.length > MAX_ICAL_FEEDS) {
    return { error: `You can follow at most ${MAX_ICAL_FEEDS} calendars` };
  }

  const urls: string[] = [];
  for (const entry of entries) {
    const normalized = normalizeIcalFeedUrl(entry);
    if ("error" in normalized) return normalized;
    // A blank row is the user having added one and not filled it in.
    if (normalized.url) urls.push(normalized.url);
  }

  // The same calendar twice would draw every block twice.
  return { urls: [...new Set(urls)] };
};
