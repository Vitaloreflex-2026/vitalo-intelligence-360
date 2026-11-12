import { useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { useTranslate } from "ra-core";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/supabase/layout";
import { getSupabaseClient } from "@/components/atomic-crm/providers/supabase/supabase";

/**
 * Landing page of the invite / recovery email links.
 *
 * The email links here (with a token_hash) instead of to Supabase's /verify
 * endpoint, because mail scanners (Outlook Safe Links) open links before the
 * user does and would consume the one-time token. The token is only verified
 * when the user clicks the button, which scanners don't do.
 */
export const ConfirmEmailPage = () => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const [params] = useSearchParams();
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  const confirm = async () => {
    if (!tokenHash || !type) return;
    setLoading(true);
    const { data, error } = await getSupabaseClient().auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    setLoading(false);
    if (error || !data.session) {
      setHasFailed(true);
      return;
    }
    if (type === "invite" || type === "recovery") {
      const { access_token, refresh_token } = data.session;
      navigate(
        `/set-password?access_token=${access_token}&refresh_token=${refresh_token}&type=${type}`,
      );
      return;
    }
    navigate("/");
  };

  if (!tokenHash || !type || hasFailed) {
    return (
      <Layout>
        <p>
          {translate("crm.auth.confirm_email.invalid_link", {
            _: "This link is invalid or has expired.",
          })}
        </p>
        <Link to="/forgot-password" className="underline">
          {translate("ra-supabase.auth.forgot_password", {
            _: "Forgot password?",
          })}
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold tracking-tight text-center">
        {translate(
          type === "recovery"
            ? "crm.auth.confirm_email.recovery_title"
            : "crm.auth.confirm_email.title",
          {
            _:
              type === "recovery"
                ? "Reset your password"
                : "Activate your account",
          },
        )}
      </h1>
      <Button onClick={confirm} disabled={loading} className="cursor-pointer">
        {translate("crm.auth.confirm_email.action", { _: "Continue" })}
      </Button>
    </Layout>
  );
};

ConfirmEmailPage.path = "auth-confirm";
