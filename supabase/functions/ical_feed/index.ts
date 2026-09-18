import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { AuthMiddleware, UserMiddleware } from "../_shared/authentication.ts";
import { corsHeaders, OptionsMiddleware } from "../_shared/cors.ts";
import { getUserSale } from "../_shared/getUserSale.ts";
import { normalizeIcalFeedUrls } from "../_shared/icalUrl.ts";
import { createErrorResponse } from "../_shared/utils.ts";
import { fetchIcalFeed } from "./fetchIcalFeed.ts";

/**
 * Serves the caller their OWN external calendar feeds, fetched server-side.
 *
 * Two reasons this cannot happen in the browser: a published `.ics` endpoint
 * sends no CORS header, and a feed URL is a bearer secret we would rather not
 * hand to the page. The URLs are read from the caller's own `sales` row, never
 * from the request, so nobody can use this as an open proxy.
 *
 * One unreachable calendar does not sink the others: each feed answers for
 * itself, so the dashboard can draw what it has and still say what failed.
 */
Deno.serve(async (req: Request) =>
  OptionsMiddleware(req, async (req) =>
    AuthMiddleware(req, async (req) =>
      UserMiddleware(req, async (req, user) => {
        if (req.method !== "GET") {
          return createErrorResponse(405, "Method Not Allowed");
        }

        const sale = await getUserSale(user!);
        if (!sale) return createErrorResponse(401, "Unauthorized");

        const normalized = normalizeIcalFeedUrls(sale.ical_urls);
        if ("error" in normalized) {
          return createErrorResponse(400, normalized.error);
        }

        // No calendar configured is the normal state, not a failure.
        const feeds = await Promise.all(
          normalized.urls.map(async (url) => {
            const result = await fetchIcalFeed(url);
            return "status" in result
              ? { error: result.message }
              : { ics: result.ics };
          }),
        );

        return new Response(JSON.stringify({ data: { feeds } }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }),
    ),
  ),
);
