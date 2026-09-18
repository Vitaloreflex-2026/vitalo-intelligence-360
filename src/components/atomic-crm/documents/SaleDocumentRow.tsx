import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Upload } from "lucide-react";
import type { Identifier } from "ra-core";
import {
  useCreate,
  useDelete,
  useNotify,
  useTranslate,
  useUpdate,
} from "ra-core";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

import { DocumentDownloadButton } from "./DocumentDownloadButton";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { useFormatDocumentDate } from "./useFormatDocumentDate";
import type { DocumentSlot } from "./saleDocumentStatus";

/** What the browser file picker accepts: a scan or a photo of a paper. */
const ACCEPTED_TYPES = "application/pdf,image/*";

/**
 * One expected document on the consultant's own profile: its state, and the
 * actions to file, replace, download or remove the file.
 */
export const SaleDocumentRow = ({
  slot,
  salesId,
}: {
  slot: DocumentSlot;
  salesId: Identifier;
}) => {
  const translate = useTranslate();
  const notify = useNotify();
  const formatDate = useFormatDocumentDate();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [create, { isPending: isCreating }] = useCreate();
  const [update, { isPending: isUpdating }] = useUpdate();
  const [remove, { isPending: isRemoving }] = useDelete();
  const isPending = isCreating || isUpdating || isRemoving;

  // The list is derived from these rows, so every write has to invalidate it.
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["sales_documents"] });

  const mutationOptions = (successMessage: string) => ({
    onSuccess: () => {
      refresh();
      notify(successMessage);
    },
    onError: () => notify("crm.documents.save_error", { type: "error" }),
  });

  const handleFilePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset the input so picking the very same file again still fires a change.
    event.target.value = "";
    if (!file) return;

    // `src` stays empty on purpose: the data provider then uploads `rawFile`
    // straight to the bucket and fills in the public URL it gets back.
    const data = {
      sales_id: salesId,
      type: slot.type.label,
      file: { rawFile: file, src: "", title: file.name },
      // Filing the paper again restarts the one-year renewal countdown.
      created_at: new Date().toISOString(),
    };

    if (slot.document) {
      update(
        "sales_documents",
        { id: slot.document.id, data, previousData: slot.document },
        mutationOptions("crm.documents.replaced"),
      );
      return;
    }
    create(
      "sales_documents",
      { data },
      mutationOptions("crm.documents.uploaded"),
    );
  };

  const handleRemove = () => {
    if (!slot.document) return;
    remove(
      "sales_documents",
      { id: slot.document.id, previousData: slot.document },
      mutationOptions("crm.documents.removed"),
    );
  };

  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {slot.type.label}
          </span>
          <DocumentStatusBadge slot={slot} />
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {slot.document
            ? translate("crm.documents.filed_on", {
                date: formatDate(slot.document.created_at),
              })
            : translate("crm.documents.not_filed")}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <DocumentDownloadButton slot={slot} />
        {slot.document && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            disabled={isPending}
            onClick={handleRemove}
            aria-label={translate("crm.documents.actions.remove")}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          disabled={isPending}
          onClick={() => fileInput.current?.click()}
        >
          <Upload className="size-4" />
          {translate(
            slot.document
              ? "crm.documents.actions.replace"
              : "crm.documents.actions.upload",
          )}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          aria-label={`${translate("crm.documents.actions.upload")} ${slot.type.label}`}
          onChange={handleFilePicked}
        />
      </div>
    </li>
  );
};
