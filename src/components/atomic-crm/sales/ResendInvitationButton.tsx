import { useMutation } from "@tanstack/react-query";
import { Send } from "lucide-react";
import {
  useDataProvider,
  useNotify,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { Button } from "@/components/ui/button";

import type { CrmDataProvider, SalesReinviteResult } from "../providers/types";
import type { Sale } from "../types";

// An invitation email was sent a moment ago and the auth rate limit kicked in.
const getErrorMessageKey = (status?: number) =>
  status === 429
    ? "resources.sales.reinvite.too_many_requests"
    : "resources.sales.reinvite.error";

/**
 * Mails a user a fresh single-use link to get into the app, for when the first
 * invitation was lost or expired. The previous link stops working. Users who
 * already activated their account get a password link instead.
 */
export function ResendInvitationButton() {
  const record = useRecordContext<Sale>();
  const dataProvider = useDataProvider<CrmDataProvider>();
  const notify = useNotify();
  const translate = useTranslate();

  const { mutate, isPending } = useMutation({
    mutationKey: ["salesReinvite"],
    mutationFn: async () => {
      if (!record) {
        throw new Error(
          translate("resources.sales.edit.record_not_found", {
            _: "Record not found",
          }),
        );
      }
      return dataProvider.salesReinvite(record.id);
    },
    onSuccess: ({ kind }: SalesReinviteResult) => {
      notify(
        kind === "recovery"
          ? "resources.sales.reinvite.password_link_sent"
          : "resources.sales.reinvite.success",
        {
          messageArgs: {
            _: "A new invitation email has been sent.",
          },
        },
      );
    },
    onError: (error: Error & { status?: number }) => {
      notify(getErrorMessageKey(error.status), {
        type: "error",
        messageArgs: {
          _: error.message,
        },
      });
    },
  });

  if (!record) return null;

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isPending}
      onClick={() => mutate()}
    >
      <Send />
      {translate("resources.sales.reinvite.action", {
        _: "Resend invitation",
      })}
    </Button>
  );
}
