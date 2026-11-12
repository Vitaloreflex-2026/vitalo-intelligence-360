import { useTranslate } from "ra-core";

import type { Tag, TagsResource } from "../types";
import { TagDialog } from "./TagDialog";
import { useCreateTag } from "./useCreateTag";

type TagCreateModalProps = {
  open: boolean;
  onClose(): void;
  onSuccess?(tag: Tag): Promise<void>;
  tagsResource?: TagsResource;
};

export function TagCreateModal({
  open,
  onClose,
  onSuccess,
  tagsResource,
}: TagCreateModalProps) {
  const createTag = useCreateTag(tagsResource);
  const translate = useTranslate();

  const handleCreateTag = async (data: Pick<Tag, "name" | "color">) => {
    const tag = await createTag(data);
    await onSuccess?.(tag);
  };

  return (
    <TagDialog
      open={open}
      title={translate("resources.tags.dialog.create_title")}
      onClose={onClose}
      onSubmit={handleCreateTag}
    />
  );
}
