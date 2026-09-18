import { useMutation } from "@tanstack/react-query";
import { Send } from "lucide-react";
import {
  useDataProvider,
  useNotify,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { Button } from "@/components/ui/button";

import type { CrmDataProvider } from "../providers/types";
import type { Sale } from "../types";

const getErrorMessageKey = (status?: number) => {
  // The account is already activated, so there is nothing left to invite to.
  if (status === 422) return "resources.sales.reinvite.already_active";
  // An invitation email was sent a moment ago and the auth rate limit kicked in.
  if (status === 429) return "resources.sales.reinvite.too_many_requests";
  return "resources.sales.reinvite.error";
};

/**
 * Regenerates the single-use activation link of a user who never used theirs
 * and mails it again. The previous link stops working.
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
    onSuccess: () => {
      notify("resources.sales.reinvite.success", {
        messageArgs: {
          _: "A new invitation email has been sent.",
        },
      });
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
