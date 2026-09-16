import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, OptionsMiddleware } from "../_shared/cors.ts";
import { createErrorResponse } from "../_shared/utils.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { AuthMiddleware, UserMiddleware } from "../_shared/authentication.ts";

async function updatePassword(user: any) {
  const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(
    user.email,
  );

  // Forward the auth error as-is: the caller needs the status (429 when the
  // recovery email was requested too recently) to explain the failure.
  if (error) {
    return createErrorResponse(
      error.status ?? 500,
      error.message || "Internal Server Error",
      { code: error.code },
    );
  }

  return new Response(
    JSON.stringify({
      data,
    }),
    {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    },
  );
}

Deno.serve(async (req: Request) =>
  OptionsMiddleware(req, async (req) =>
    AuthMiddleware(req, async (req) =>
      UserMiddleware(req, async (req, user) => {
        if (req.method === "PATCH") {
          return updatePassword(user);
        }

        return createErrorResponse(405, "Method Not Allowed");
      }),
    ),
  ),
);
