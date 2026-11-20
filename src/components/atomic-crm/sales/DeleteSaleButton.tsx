import { useMutation } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useState } from "react";
import {
  useDataProvider,
  useGetIdentity,
  useNotify,
  useRecordContext,
  useRedirect,
  useTranslate,
} from "ra-core";
import { Confirm } from "@/components/admin/confirm";
import { Button } from "@/components/ui/button";

import type { CrmDataProvider } from "../providers/types";
import type { Sale } from "../types";

/**
 * Permanently deletes a user's account after confirmation. Their records stay,
 * without an owner. Hidden on one's own account, which the server refuses.
 */
export function DeleteSaleButton() {
  const record = useRecordContext<Sale>();
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider<CrmDataProvider>();
  const notify = useNotify();
  const redirect = useRedirect();
  const translate = useTranslate();
  const [isOpen, setIsOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationKey: ["salesDelete"],
    mutationFn: (id: Sale["id"]) => dataProvider.salesDelete(id),
    onSuccess: () => {
      setIsOpen(false);
      redirect("/sales");
      notify("resources.sales.delete.success", {
        messageArgs: { _: "User deleted" },
      });
    },
    onError: () => {
      notify("resources.sales.delete.error", {
        type: "error",
        messageArgs: { _: "The user could not be deleted. Please try again." },
      });
    },
  });

  if (!record || record.id === identity?.id) return null;

  return (
    <>
      <Button
        variant="destructive"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <Trash />
        {translate("resources.sales.delete.action", { _: "Delete user" })}
      </Button>
      <Confirm
        isOpen={isOpen}
        loading={isPending}
        title="resources.sales.delete.title"
        titleTranslateOptions={{
          name: `${record.first_name} ${record.last_name}`,
        }}
        content="resources.sales.delete.content"
        confirm="ra.action.delete"
        confirmColor="warning"
        onConfirm={() => mutate(record.id)}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
