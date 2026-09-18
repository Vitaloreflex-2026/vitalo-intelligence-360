import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import {
  useCreate,
  useDelete,
  useNotify,
  useTranslate,
  useUpdate,
} from "ra-core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { DOCUMENT_TYPE_CATEGORY } from "../documents/saleDocumentStatus";
import { useDocumentTypes } from "../documents/useSaleDocuments";
import type { Choice } from "../types";

const useRefreshDocumentTypes = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["choices"] });
};

const DocumentTypeRow = ({ type }: { type: Choice }) => {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefreshDocumentTypes();
  const [update, { isPending: isUpdating }] = useUpdate();
  const [remove, { isPending: isRemoving }] = useDelete();

  const onError = () =>
    notify("crm.settings.documents.save_error", { type: "error" });

  const handleToggleRenewal = (checked: boolean) => {
    update(
      "choices",
      {
        id: type.id,
        data: { requires_renewal: checked },
        previousData: type,
      },
      { onSuccess: refresh, onError },
    );
  };

  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm truncate">{type.label}</span>
      <div className="flex items-center gap-3 shrink-0">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={!!type.requires_renewal}
            disabled={isUpdating || isRemoving}
            onCheckedChange={(checked) => handleToggleRenewal(checked === true)}
          />
          {translate("crm.settings.documents.requires_renewal")}
        </label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          disabled={isUpdating || isRemoving}
          onClick={() =>
            remove(
              "choices",
              { id: type.id, previousData: type },
              { onSuccess: refresh, onError },
            )
          }
          aria-label={`${translate("ra.action.delete")} ${type.label}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
};

/**
 * The papers every consultant must file. They live in the `choices` table
 * rather than in the configuration record the rest of this page writes, so this
 * card saves each change immediately — same arrangement as consultant colours.
 */
export const DocumentTypesCard = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefreshDocumentTypes();
  const { data: types, isPending } = useDocumentTypes();
  const [create, { isPending: isCreating }] = useCreate();
  const [newLabel, setNewLabel] = useState("");

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    create(
      "choices",
      {
        data: {
          category: DOCUMENT_TYPE_CATEGORY,
          label,
          requires_renewal: false,
        },
      },
      {
        onSuccess: () => {
          setNewLabel("");
          refresh();
        },
        onError: () =>
          notify("crm.settings.documents.save_error", { type: "error" }),
      },
    );
  };

  return (
    <Card id="documents">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.settings.sections.documents")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {translate("crm.settings.documents.hint")}
        </p>

        {isPending ? null : types?.length ? (
          <ul className="divide-y">
            {types.map((type) => (
              <DocumentTypeRow key={type.id} type={type} />
            ))}
          </ul>
        ) : (
          <p className="text-sm">{translate("crm.settings.documents.empty")}</p>
        )}

        <div className="flex items-center gap-2">
          <Input
            value={newLabel}
            disabled={isCreating}
            placeholder={translate("crm.settings.documents.new_placeholder")}
            aria-label={translate("crm.settings.documents.new_placeholder")}
            onChange={(event) => setNewLabel(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              // The settings page is one big form; Enter must not submit it.
              event.preventDefault();
              handleAdd();
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer shrink-0"
            disabled={isCreating || !newLabel.trim()}
            onClick={handleAdd}
          >
            <Plus className="size-4" />
            {translate("crm.settings.documents.add")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
