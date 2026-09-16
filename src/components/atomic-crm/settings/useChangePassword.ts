import { useMutation } from "@tanstack/react-query";
import {
  useDataProvider,
  useGetIdentity,
  useNotify,
  useTranslate,
} from "ra-core";

import type { CrmDataProvider } from "../providers/types";

/**
 * Sends a password reset email to the current user.
 *
 * Shared by the desktop profile page and the mobile settings page so both
 * report the same failures — most notably the rate limit hit when the reset
 * email was already requested a moment ago.
 */
export const useChangePassword = () => {
  const notify = useNotify();
  const translate = useTranslate();
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider<CrmDataProvider>();

  const { mutate, isPending } = useMutation({
    mutationKey: ["updatePassword"],
    mutationFn: async () => {
      if (!identity) {
        throw new Error(
          translate("crm.profile.record_not_found", {
            _: "Record not found",
          }),
        );
      }
      return dataProvider.updatePassword(identity.id);
    },
    onSuccess: () => {
      notify("crm.profile.password_reset_sent", {
        messageArgs: {
          _: "A reset password email has been sent to your email address",
        },
      });
    },
    onError: (error: Error & { status?: number }) => {
      notify(
        error.status === 429
          ? "crm.profile.password.too_many_requests"
          : "crm.profile.password.change_error",
        {
          type: "error",
          messageArgs: {
            _: error.message,
          },
        },
      );
    },
  });

  return { changePassword: mutate, isPending };
};
